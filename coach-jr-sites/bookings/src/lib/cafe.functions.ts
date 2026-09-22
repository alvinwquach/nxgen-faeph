import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}

async function requireStaff(supabase: SupabaseClient<Database>, userId: string) {
  const { data: ok } = await supabase.rpc("has_staff_access", { _user_id: userId });
  if (!ok) throw new Error("Forbidden");
  const { data: member } = await supabase.from("members").select("name").eq("user_id", userId).maybeSingle();
  return member?.name ?? "Staff";
}

export const getCafeStations = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().from("cafe_stations").select("*").eq("active", true).order("sort_order");
  if (error) throw new Error(error.message);
  return { stations: data ?? [] };
});

export const getCafeAvailability = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input))
  .handler(async ({ data }) => {
    const { data: slots, error } = await publicClient().from("cafe_booking_slots").select("station_id, hour").eq("date", data.date);
    if (error) throw new Error(error.message);
    return { slots: slots ?? [] };
  });

export const createCafeBooking = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ stationId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), hours: z.array(z.number().int().min(6).max(23)).min(1).max(12) }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { data: booking, error } = await context.supabase.rpc("create_cafe_booking", { _station_id: data.stationId, _date: data.date, _hours: data.hours });
    if (error) throw new Error(error.message);
    return { booking };
  });

export const getMyCafeBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: member } = await context.supabase.from("members").select("id").eq("user_id", context.userId).maybeSingle();
    if (!member) return { bookings: [] };
    const { data, error } = await context.supabase.from("cafe_bookings").select("*, cafe_stations(name, code, station_type)").eq("member_id", member.id).order("date", { ascending: false }).order("start_hour", { ascending: false });
    if (error) throw new Error(error.message);
    return { bookings: data ?? [] };
  });

export const cancelCafeBooking = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("cancel_cafe_booking", { _booking_id: data.id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getCafeAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireStaff(context.supabase, context.userId);
    const [stations, bookings] = await Promise.all([
      context.supabase.from("cafe_stations").select("*").order("sort_order"),
      context.supabase.from("cafe_bookings").select("*, cafe_stations(name, code, station_type), members(name, email, phone)").order("date", { ascending: false }).order("start_hour", { ascending: false }).limit(200),
    ]);
    if (stations.error) throw new Error(stations.error.message);
    if (bookings.error) throw new Error(bookings.error.message);
    return { stations: stations.data ?? [], bookings: bookings.data ?? [] };
  });

const stationInput = z.object({
  id: z.string().uuid().optional(), code: z.string().trim().min(2).max(20), name: z.string().trim().min(2).max(80),
  stationType: z.enum(["gaming_pc", "console"]), hourlyRate: z.number().min(0).max(100000), status: z.enum(["available", "maintenance", "offline"]),
  active: z.boolean(), sortOrder: z.number().int().min(0).max(999), specs: z.record(z.string(), z.string()),
});

export const saveCafeStation = createServerFn({ method: "POST" })
  .inputValidator((input) => stationInput.parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const actor = await requireStaff(context.supabase, context.userId);
    const payload = { code: data.code, name: data.name, station_type: data.stationType, hourly_rate: data.hourlyRate, status: data.status, active: data.active, sort_order: data.sortOrder, specs: data.specs as Json, updated_by: context.userId };
    const result = data.id ? await context.supabase.from("cafe_stations").update(payload).eq("id", data.id) : await context.supabase.from("cafe_stations").insert(payload);
    if (result.error) throw new Error(result.error.message);
    await context.supabase.from("activity_log").insert({ action: `${data.id ? "Station edited" : "Station added"} · ${data.name}`, details: `${data.code} · ₱${data.hourlyRate}/hr · ${data.status}`, actor_id: context.userId, actor_name: actor });
    return { ok: true };
  });

export const updateCafeBookingStatus = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(["reserved", "confirmed", "completed", "cancelled"]) }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const actor = await requireStaff(context.supabase, context.userId);
    if (data.status === "cancelled") {
      const { error } = await context.supabase.rpc("cancel_cafe_booking", { _booking_id: data.id });
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { data: prev, error: findError } = await context.supabase.from("cafe_bookings").select("ref, status").eq("id", data.id).single();
    if (findError) throw new Error(findError.message);
    const { error } = await context.supabase.from("cafe_bookings").update({ status: data.status, updated_by: context.userId }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_log").insert({ action: `Cafe booking ${data.status} · ${prev.ref}`, details: `${prev.status} → ${data.status}`, actor_id: context.userId, actor_name: actor });
    return { ok: true };
  });