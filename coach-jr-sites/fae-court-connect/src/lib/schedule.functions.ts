/**
 * Live court schedule: slot states, client requests, admin approval and the
 * reserve grace window. All state lives in the existing `bookings` table —
 * Supabase is the single source of truth.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { SPORTS, isMember, type SportKey } from "./constants";

export type SlotState = "open" | "pending" | "reserved" | "booked" | "blocked";

export interface SlotStateRow {
  court_id: string;
  day: string;
  hour: number;
  state: SlotState;
  booking_id: string;
  member_id: string | null;
  reserved_until: string | null;
}

const DATE = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/* ---------- Venue settings (open hours + reserve grace) ---------- */

export interface VenueSettings {
  openStart: number;
  openEnd: number;
  graceMinutes: number;
}

export const DEFAULT_VENUE_SETTINGS: VenueSettings = { openStart: 6, openEnd: 23, graceMinutes: 20 };

function parseSettings(rows: { key: string; value: unknown }[] | null): VenueSettings {
  const map = new Map((rows ?? []).map((row) => [row.key, row.value as Record<string, number> | null]));
  const hours = map.get("open_hours") ?? {};
  const grace = map.get("reserve_grace_minutes") ?? {};
  return {
    openStart: Number(hours?.["start"] ?? DEFAULT_VENUE_SETTINGS.openStart),
    openEnd: Number(hours?.["end"] ?? DEFAULT_VENUE_SETTINGS.openEnd),
    graceMinutes: Number(grace?.["minutes"] ?? DEFAULT_VENUE_SETTINGS.graceMinutes),
  };
}

export const getVenueSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("app_settings").select("key, value");
  return parseSettings(data as { key: string; value: unknown }[] | null);
});

export const updateVenueSettings = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        openStart: z.number().int().min(0).max(23),
        openEnd: z.number().int().min(1).max(24),
        graceMinutes: z.number().int().min(5).max(240),
      })
      .refine((v) => v.openEnd > v.openStart, "Closing hour must be after opening hour")
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: staff } = await supabase.rpc("has_staff_access", { _user_id: userId });
    if (!staff) throw new Error("Staff access required.");
    const now = new Date().toISOString();
    const rows: { key: string; value: Record<string, number>; updated_at: string; updated_by: string }[] = [
      { key: "open_hours", value: { start: data.openStart, end: data.openEnd }, updated_at: now, updated_by: userId },
      { key: "reserve_grace_minutes", value: { minutes: data.graceMinutes }, updated_at: now, updated_by: userId },
    ];
    for (const row of rows) {
      const { error } = await supabase.from("app_settings").upsert(row, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ---------- Public slot feed ---------- */

export const getSlotStates = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ from: DATE, to: DATE }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await publicClient().rpc("slot_states", { _from: data.from, _to: data.to });
    if (error) throw new Error(error.message);
    return { slots: (rows ?? []) as SlotStateRow[] };
  });

/* ---------- Client requests ---------- */

async function rateFor(
  supabase: { from: (t: "court_rates") => any },
  courtId: string,
  sport: SportKey,
  memberTier: boolean,
): Promise<number> {
  const { data: rateRow } = await supabase
    .from("court_rates")
    .select("member_rate, non_member_rate")
    .eq("court_id", courtId)
    .eq("active", true)
    .maybeSingle();
  if (rateRow) return Number(memberTier ? rateRow.member_rate : rateRow.non_member_rate);
  const court = SPORTS[sport].courts.find((c) => c.id === courtId);
  return court ? (memberTier ? court.memberRate : court.nonMemberRate) : 0;
}

export const requestSlot = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        sport: z.enum(["basketball", "volleyball", "pickleball"]),
        courtId: z.string().min(1),
        date: DATE,
        startHour: z.number().int().min(0).max(23),
        hours: z.number().int().min(1).max(8).default(1),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: member } = await supabase.from("members").select("*").eq("user_id", userId).maybeSingle();
    if (!member) throw new Error("Finish setting up your member profile first.");

    const { data: settingRows } = await supabase.from("app_settings").select("key, value");
    const settings = parseSettings(settingRows as { key: string; value: unknown }[] | null);
    if (data.startHour < settings.openStart || data.startHour + data.hours > settings.openEnd) {
      throw new Error("The venue is closed at that time.");
    }

    const rate = await rateFor(supabase as never, data.courtId, data.sport as SportKey, isMember(member.tier));
    const amount = rate * data.hours;

    let ref = "";
    for (let attempt = 0; attempt < 4; attempt++) {
      ref = `FAE-${Math.floor(10000 + Math.random() * 90000)}`;
      const { data: row, error } = await supabase
        .from("bookings")
        .insert({
          member_id: member.id,
          sport: data.sport,
          court_id: data.courtId,
          date: data.date,
          start_hour: data.startHour,
          hours: data.hours,
          amount,
          status: "Pending",
          booker_name: member.name,
          contact: member.phone ?? member.email,
          ref,
        })
        .select("id, ref, start_hour, hours, amount, status")
        .single();
      if (error) {
        if (error.code === "23P01") throw new Error("That hour was just taken — choose another open slot.");
        if (error.code === "23505") continue;
        throw new Error(error.message);
      }
      await supabase.from("activity_log").insert({
        action: `Booking requested · ${data.courtId}`,
        details: `${data.date} · ${data.startHour}:00 ×${data.hours}h · ${row.ref}`,
        booking_id: row.id,
        actor_id: userId,
        actor_name: member.name,
      });
      return { booking: row, amount };
    }
    throw new Error("Could not allocate a booking reference — try again.");
  });

export const updateMyRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid(), date: DATE, startHour: z.number().int().min(0).max(23) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: member } = await supabase.from("members").select("id, name").eq("user_id", userId).maybeSingle();
    if (!member) throw new Error("Member profile not found.");
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, member_id, hours")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (!booking || booking.member_id !== member.id) throw new Error("Request not found.");
    if (booking.status !== "Pending") throw new Error("Only a pending request can be changed.");

    const { data: settingRows } = await supabase.from("app_settings").select("key, value");
    const settings = parseSettings(settingRows as { key: string; value: unknown }[] | null);
    if (data.startHour < settings.openStart || data.startHour + booking.hours > settings.openEnd) {
      throw new Error("The venue is closed at that time.");
    }

    const { error } = await supabase
      .from("bookings")
      .update({ date: data.date, start_hour: data.startHour, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", booking.id);
    if (error) {
      if (error.code === "23P01") throw new Error("That hour is already taken — pick another one.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const cancelMyRequest = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ bookingId: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: member } = await supabase.from("members").select("id, name").eq("user_id", userId).maybeSingle();
    if (!member) throw new Error("Member profile not found.");
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, member_id, ref")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (!booking || booking.member_id !== member.id) throw new Error("Request not found.");
    if (booking.status === "Cancelled") return { ok: true };
    if (booking.status !== "Pending" && booking.status !== "Reserved") {
      throw new Error("That booking is confirmed — contact the front desk to change it.");
    }
    const { error } = await supabase
      .from("bookings")
      .update({ status: "Cancelled", updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", booking.id);
    if (error) throw new Error(error.message);
    await supabase.from("activity_log").insert({
      action: `Booking cancelled by client · ${booking.ref ?? ""}`,
      booking_id: booking.id,
      actor_id: userId,
      actor_name: member.name,
    });
    return { ok: true };
  });

/* ---------- My live slots (for countdown) ---------- */

export const getMyActiveSlots = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: member } = await supabase.from("members").select("id").eq("user_id", userId).maybeSingle();
    if (!member) return { slots: [] };
    const { data } = await supabase
      .from("bookings")
      .select("id, court_id, sport, date, start_hour, hours, amount, status, ref, reserved_until")
      .eq("member_id", member.id)
      .in("status", ["Pending", "Reserved"])
      .order("date", { ascending: true });
    return { slots: data ?? [] };
  });

/* ---------- Admin approval ---------- */

export const getBookingRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: staff } = await supabase.rpc("has_staff_access", { _user_id: userId });
    if (!staff) throw new Error("Staff access required.");
    const { data, error } = await supabase
      .from("bookings")
      .select("id, court_id, sport, date, start_hour, hours, amount, status, ref, booker_name, contact, reserved_until, created_at")
      .in("status", ["Pending", "Reserved"])
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { requests: data ?? [] };
  });

export const reviewBookingRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid(), action: z.enum(["reserve", "book", "decline"]) }).parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: staff } = await supabase.rpc("has_staff_access", { _user_id: userId });
    if (!staff) throw new Error("Staff access required.");

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, ref, booker_name, date, start_hour")
      .eq("id", data.bookingId)
      .maybeSingle();
    if (!booking) throw new Error("Request not found.");

    const { data: settingRows } = await supabase.from("app_settings").select("key, value");
    const settings = parseSettings(settingRows as { key: string; value: unknown }[] | null);

    const patch =
      data.action === "decline"
        ? { status: "Cancelled", reserved_until: null }
        : data.action === "book"
          ? { status: "Booked", reserved_until: null }
          : {
              status: "Reserved",
              reserved_until: new Date(Date.now() + settings.graceMinutes * 60_000).toISOString(),
            };

    const { error } = await supabase
      .from("bookings")
      .update({ ...patch, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", booking.id);
    if (error) throw new Error(error.message);

    await supabase.from("activity_log").insert({
      action: `Booking ${data.action === "decline" ? "declined" : data.action === "book" ? "confirmed" : "reserved"} · ${booking.ref ?? ""}`,
      details: `${booking.booker_name ?? "—"} · ${booking.date} ${booking.start_hour}:00`,
      booking_id: booking.id,
      actor_id: userId,
      before_after: `${booking.status} → ${patch.status}`,
    });
    return { ok: true, status: patch.status };
  });

export const sweepLapsedReserves = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("release_lapsed_reserves");
    if (error) throw new Error(error.message);
    return { released: data ?? 0 };
  });
