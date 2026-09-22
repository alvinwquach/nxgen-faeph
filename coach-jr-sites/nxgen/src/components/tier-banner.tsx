import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { requestOtp, verifyOtp } from "@/lib/otp.functions";
import type { MembershipTier } from "@/lib/use-membership-tier";

export function TierBanner({ tier, onVerified }: { tier: MembershipTier; onVerified: () => void }) {
  const sendCode = useServerFn(requestOtp);
  const checkCode = useServerFn(verifyOtp);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const code = digits.join("");

  if (tier === "rfid_linked") {
    return (
      <div className="rounded-xl border border-[var(--line-g)] bg-[rgba(201,162,39,.08)] px-5 py-4">
        <p className="text-sm font-black uppercase tracking-wide text-[var(--gold-l)]">
          Full Member — bracelet linked
        </p>
      </div>
    );
  }

  if (tier === "otp_verified") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--s2)] px-5 py-4">
        <div>
          <p className="text-sm font-bold text-[var(--paint)]">Link your RFID bracelet to become a Full Member</p>
          <p className="mt-1 text-xs text-muted-foreground">
            A linked bracelet handles venue check-in and wallet taps at the court.
          </p>
        </div>
        <Link to="/account/bracelet"><Button size="sm">Link bracelet</Button></Link>
      </div>
    );
  }

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) inputs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!t) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < t.length; i++) next[i] = t[i];
    setDigits(next);
    inputs.current[Math.min(t.length, 5)]?.focus();
  };

  return (
    <div className="rounded-2xl border border-[var(--line-g)] bg-[rgba(201,162,39,.06)] px-6 py-5">
      <p className="text-sm font-bold text-[var(--gold-l)]">Verify your email</p>
      <p className="mt-1 text-xs text-muted-foreground">
        We'll email you a 6-digit code. Verifying confirms your contact details and lets you link an RFID bracelet.
      </p>

      <div className="mt-4 flex gap-2 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            className="h-12 w-11 rounded-xl border border-[var(--line-g)] bg-[rgba(0,0,0,.4)] text-center text-lg font-black text-[var(--paint)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[rgba(201,162,39,.25)]"
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={verifying || code.length !== 6}
          onClick={async () => {
            setVerifying(true);
            try {
              await checkCode({ data: { code } });
              toast.success("Email verified.");
              setDigits(["", "", "", "", "", ""]);
              onVerified();
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Verification failed");
            } finally {
              setVerifying(false);
            }
          }}
        >
          {verifying ? "Verifying…" : "Verify code"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={sending}
          onClick={async () => {
            setSending(true);
            try {
              const res = await sendCode({ data: undefined as never });
              setSent(true);
              toast.success(`Code sent to ${res.sentTo}`);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Could not send code");
            } finally {
              setSending(false);
            }
          }}
        >
          {sending ? "Sending…" : sent ? "Resend code" : "Send code"}
        </Button>
      </div>
    </div>
  );
}
