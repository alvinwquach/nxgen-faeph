/** Minimal Resend sender. Server-only. */
export interface SendResult {
  sent: boolean;
  reason?: string;
  id?: string;
}

export async function sendResendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { sent: false, reason: "resend_api_key_missing" };
  if (!to) return { sent: false, reason: "no_recipient" };

  // Use the verified domain sender once available; otherwise Resend's onboarding sender.
  const from = process.env["RESEND_FROM"] ?? "FAE Bookings <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const body = await response.text();
  if (!response.ok) {
    console.error(`Resend send failed [${response.status}]: ${body}`);
    return { sent: false, reason: `resend_${response.status}` };
  }
  try {
    const id = (JSON.parse(body) as { id?: string }).id;
    return id ? { sent: true, id } : { sent: true };
  } catch {
    return { sent: true };
  }
}
