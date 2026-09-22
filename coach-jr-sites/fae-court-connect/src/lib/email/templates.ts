/**
 * Branded booking emails (gold on charcoal). Plain reusable template
 * functions so they can be rendered anywhere on the server.
 */

export type BookingEmailEvent =
  | "requested"
  | "approved"
  | "expiring"
  | "confirmed"
  | "released"
  | "admin_new_request";

export interface BookingEmailData {
  courtName: string;
  date: string;
  startHour: number;
  hours: number;
  amount: number;
  ref: string;
  bookerName: string;
  reservedUntil?: string | null;
  siteUrl: string;
  logoUrl: string;
  payment: { gcash: string; maya: string; bank: string };
}

const GOLD = "#C9A227";
const CHARCOAL = "#0b0b0e";
const PANEL = "#131318";
const TEXT = "#F6F4EC";
const MUTED = "#a8a49a";

function peso(amount: number) {
  return `₱${Math.round(amount).toLocaleString("en-PH")}`;
}

function hourLabel(hour: number) {
  const h = ((hour + 11) % 12) + 1;
  return `${h}:00 ${hour < 12 ? "AM" : "PM"}`;
}

function longDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shell(data: BookingEmailData, heading: string, intro: string, extra: string, cta: string) {
  const slot = `${hourLabel(data.startHour)} – ${hourLabel(data.startHour + data.hours)}`;
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${CHARCOAL};font-family:'Outfit',Helvetica,Arial,sans-serif;color:${TEXT};">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <img src="${data.logoUrl}" alt="Fil-Am Elite Management" width="64" style="display:block;margin-bottom:24px;" />
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:${TEXT};">${heading}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED};">${intro}</p>

    <table role="presentation" width="100%" style="background:${PANEL};border:1px solid rgba(201,162,39,0.35);border-radius:16px;border-collapse:separate;padding:20px;">
      <tr><td style="font-size:13px;color:${MUTED};padding:6px 0;">Court</td><td align="right" style="font-size:13px;color:${TEXT};padding:6px 0;">${data.courtName}</td></tr>
      <tr><td style="font-size:13px;color:${MUTED};padding:6px 0;">Date</td><td align="right" style="font-size:13px;color:${TEXT};padding:6px 0;">${longDate(data.date)}</td></tr>
      <tr><td style="font-size:13px;color:${MUTED};padding:6px 0;">Time</td><td align="right" style="font-size:13px;color:${TEXT};padding:6px 0;">${slot}</td></tr>
      <tr><td style="font-size:13px;color:${MUTED};padding:6px 0;">Reference</td><td align="right" style="font-size:13px;color:${GOLD};padding:6px 0;">${data.ref}</td></tr>
      <tr><td style="font-size:15px;color:${TEXT};padding:12px 0 0;font-weight:600;">Total</td><td align="right" style="font-size:22px;color:${GOLD};padding:12px 0 0;font-weight:700;">${peso(data.amount)}</td></tr>
    </table>

    ${extra}

    <p style="margin:28px 0 0;">
      <a href="${data.siteUrl}/schedule" style="display:inline-block;background:${GOLD};color:${CHARCOAL};text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;font-size:14px;">${cta}</a>
    </p>
    <p style="margin:28px 0 0;font-size:12px;color:${MUTED};line-height:1.6;">
      F.A.E. Court · Lipa City, Batangas<br />Court rental and internet &amp; data services by Fil-Am Elite Management.
    </p>
  </div>
</body></html>`;
}

function note(html: string) {
  return `<div style="margin-top:20px;background:rgba(201,162,39,0.08);border:1px solid rgba(201,162,39,0.3);border-radius:14px;padding:16px;font-size:14px;line-height:1.6;color:${TEXT};">${html}</div>`;
}

function payBlock(data: BookingEmailData) {
  const deadline = data.reservedUntil
    ? new Date(data.reservedUntil).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
    : null;
  return note(
    `<strong style="color:${GOLD};">Send your deposit to hold this slot</strong><br />
     GCash: ${data.payment.gcash}<br />Maya: ${data.payment.maya}<br />Bank: ${data.payment.bank}<br />
     Amount due: <strong>${peso(data.amount)}</strong>${deadline ? `<br />Pay before <strong>${deadline}</strong> or the hour goes back on the open schedule.` : ""}`,
  );
}

export function renderBookingEmail(event: BookingEmailEvent, data: BookingEmailData): { subject: string; html: string } {
  switch (event) {
    case "requested":
      return {
        subject: `Request received · ${data.ref}`,
        html: shell(
          data,
          "We got your request",
          `Thanks ${data.bookerName} — your hour is pending approval from the front desk. We'll email you the moment it's approved.`,
          note("Nothing to pay yet. You can cancel or change this request from the live schedule until staff approve it."),
          "View live schedule",
        ),
      };
    case "approved":
      return {
        subject: `Approved — pay to confirm · ${data.ref}`,
        html: shell(
          data,
          "Approved — pay now to lock it in",
          `Good news ${data.bookerName}, your hour is approved and being held for you.`,
          payBlock(data),
          "View my booking",
        ),
      };
    case "expiring":
      return {
        subject: `Your hold expires soon · ${data.ref}`,
        html: shell(
          data,
          "Your hold expires soon",
          "We haven't received your deposit yet. Your hour is released back to the open schedule shortly.",
          payBlock(data),
          "Pay and keep my slot",
        ),
      };
    case "confirmed":
      return {
        subject: `Booking confirmed · ${data.ref}`,
        html: shell(
          data,
          "You're booked",
          `See you on court, ${data.bookerName}. Your deposit is verified and the hour is yours.`,
          note("Come 10 minutes early and show this reference at the front desk."),
          "View my booking",
        ),
      };
    case "released":
      return {
        subject: `Slot released · ${data.ref}`,
        html: shell(
          data,
          "That hour is open again",
          "Your request was declined or the payment window lapsed, so the slot is back on the schedule. Pick another time — plenty of hours are open.",
          note("Need help? Reply to this email and the front desk will sort it out."),
          "Pick another hour",
        ),
      };
    case "admin_new_request":
      return {
        subject: `New booking request · ${data.ref}`,
        html: shell(
          data,
          "New booking request",
          `${data.bookerName} requested an hour. Approve or decline it in the admin Requests tab.`,
          note("Approving starts the client's payment countdown automatically."),
          "Open admin",
        ),
      };
  }
}
