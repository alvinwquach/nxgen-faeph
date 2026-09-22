/**
 * Booking notification endpoint. Called from Postgres (status-change trigger
 * via pg_net) and from the pg_cron expiry sweep. Authenticated with a shared
 * bearer secret — never call it from the browser.
 */
import { createFileRoute } from "@tanstack/react-router";
import { renderBookingEmail, type BookingEmailData, type BookingEmailEvent } from "@/lib/email/templates";
import { sendResendEmail } from "@/lib/email/resend.server";

const EVENTS: BookingEmailEvent[] = ["requested", "approved", "expiring", "confirmed", "released"];

interface Payload {
  booking_id?: string;
  event?: BookingEmailEvent;
}

async function handle(request: Request): Promise<Response> {
  const secret = process.env["BOOKING_NOTIFY_SECRET"];
  const token = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!secret || !token || token !== secret) return new Response("Unauthorized", { status: 401 });

  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const bookingId = payload.booking_id;
  const event = payload.event;
  if (!bookingId || !event || !EVENTS.includes(event)) return new Response("Invalid payload", { status: 400 });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select("id, ref, sport, court_id, date, start_hour, hours, amount, status, reserved_until, booker_name, contact, member_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (error || !booking) return new Response("Booking not found", { status: 404 });

  let recipient = booking.contact && booking.contact.includes("@") ? booking.contact : "";
  let name = booking.booker_name ?? "there";
  if (booking.member_id) {
    const { data: member } = await supabaseAdmin
      .from("members")
      .select("name, email")
      .eq("id", booking.member_id)
      .maybeSingle();
    if (member?.email) recipient = member.email;
    if (member?.name) name = member.name;
  }

  const { data: court } = await supabaseAdmin
    .from("court_rates")
    .select("name")
    .eq("court_id", booking.court_id)
    .maybeSingle();

  const { data: settingRows } = await supabaseAdmin.from("app_settings").select("key, value");
  const settings = new Map((settingRows ?? []).map((row) => [row.key, row.value as Record<string, string> | null]));
  const pay = settings.get("payment_details") ?? {};
  const adminEmail = String(settings.get("admin_email")?.["email"] ?? process.env["FAE_ADMIN_EMAIL"] ?? "");

  const siteUrl = process.env["PUBLIC_SITE_URL"] ?? "https://bookings.faeph.com";
  const data: BookingEmailData = {
    courtName: court?.name ?? booking.court_id,
    date: booking.date,
    startHour: booking.start_hour,
    hours: booking.hours,
    amount: Number(booking.amount),
    ref: booking.ref ?? booking.id.slice(0, 8).toUpperCase(),
    bookerName: name,
    reservedUntil: booking.reserved_until,
    siteUrl,
    logoUrl: `${siteUrl}/favicon.png`,
    payment: {
      gcash: String(pay["gcash"] ?? "0917 501 8835 (F.A.E. Management)"),
      maya: String(pay["maya"] ?? "0917 501 8835 (F.A.E. Management)"),
      bank: String(pay["bank"] ?? "BPI · F.A.E. Management Services"),
    },
  };

  const results: Record<string, unknown> = {};
  const mail = renderBookingEmail(event, data);
  results["client"] = recipient ? await sendResendEmail(recipient, mail.subject, mail.html) : { sent: false, reason: "no_recipient" };

  if (event === "requested" && adminEmail) {
    const adminMail = renderBookingEmail("admin_new_request", data);
    results["admin"] = await sendResendEmail(adminEmail, adminMail.subject, adminMail.html);
  }

  // Mark so the trigger/cron never sends the same notice twice.
  await supabaseAdmin
    .from("bookings")
    .update(event === "expiring" ? { notified_event: event, reminder_sent: true } : { notified_event: event })
    .eq("id", bookingId);

  return Response.json({ ok: true, event, results });
}

export const Route = createFileRoute("/api/public/booking-emails")({
  server: { handlers: { POST: ({ request }) => handle(request) } },
});
