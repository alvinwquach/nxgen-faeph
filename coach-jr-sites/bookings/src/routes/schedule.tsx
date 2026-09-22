import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { SPORTS, SPORT_KEYS, formatHour, formatPeso, isMember, type SportKey } from "@/lib/constants";
import { getCourtRates, getMyProfile } from "@/lib/fae.functions";
import {
  cancelMyRequest,
  getMyActiveSlots,
  getSlotStates,
  getVenueSettings,
  requestSlot,
  type SlotState,
  type SlotStateRow,
} from "@/lib/schedule.functions";
import { supabase } from "@/integrations/supabase/client";
import { Icon } from "@/components/fae/Icon";
import { Footer } from "@/components/fae/Footer";
import { Button } from "@/components/fae/Button";
import { Modal } from "@/components/fae/Modal";
import { useAuth } from "@/components/fae/AuthProvider";
import { useToast } from "@/components/fae/Toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Live Court Schedule — FAE Bookings" },
      {
        name: "description",
        content:
          "Live court schedule at F.A.E. Court, Lipa City. See open, pending, reserved and booked hours for basketball, volleyball and pickleball, and request your slot instantly.",
      },
      { property: "og:title", content: "Live Court Schedule — FAE Bookings" },
      {
        property: "og:description",
        content: "Every court, every hour, updated live. Tap an open hour to request it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SchedulePage,
});

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const STATE_STYLE: Record<SlotState, string> = {
  open: "border-goldline bg-surface-1 text-foreground hover:bg-gold/10",
  pending: "border-sport-volleyball/40 bg-sport-volleyball/10 text-sport-volleyball",
  reserved: "border-gold/50 bg-gold/15 text-gold",
  booked: "border-border bg-surface-3 text-muted-foreground",
  blocked: "border-destructive/30 bg-destructive/10 text-destructive",
};

const STATE_LABEL: Record<SlotState, string> = {
  open: "Open",
  pending: "Pending",
  reserved: "Reserved",
  booked: "Booked",
  blocked: "Blocked",
};

type Draft = { sport: SportKey; courtId: string; courtName: string; date: string; hour: number };
const DRAFT_KEY = "fae.scheduleDraft";

function SchedulePage() {
  const today = useMemo(() => new Date(), []);
  const [dayOffset, setDayOffset] = useState(0);
  const [view, setView] = useState<"day" | "week">("day");
  const [sport, setSport] = useState<SportKey>("basketball");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [today],
  );
  const from = toDateStr(days[0]!);
  const to = toDateStr(days[6]!);
  const dateStr = toDateStr(days[dayOffset]!);

  const { data: settings } = useQuery({ queryKey: ["venue-settings"], queryFn: () => getVenueSettings({ data: undefined }) });
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => getMyProfile({ data: undefined }), enabled: !!user });
  const { data: rates } = useQuery({ queryKey: ["court-rates"], queryFn: () => getCourtRates({ data: undefined }) });
  const { data: slotData, isLoading } = useQuery({
    queryKey: ["slot-states", from, to],
    queryFn: () => getSlotStates({ data: { from, to } }),
    refetchInterval: 60_000,
  });
  const { data: mine } = useQuery({
    queryKey: ["my-active-slots"],
    queryFn: () => getMyActiveSlots({ data: undefined }),
    enabled: !!user,
    refetchInterval: 60_000,
  });

  // Live feed: any booking change bumps schedule_pulse.
  useEffect(() => {
    const channel = supabase
      .channel("schedule-pulse")
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule_pulse" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["slot-states"] });
        void queryClient.invalidateQueries({ queryKey: ["my-active-slots"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const openStart = settings?.openStart ?? 6;
  const openEnd = settings?.openEnd ?? 23;
  const hours = useMemo(
    () => Array.from({ length: Math.max(openEnd - openStart, 0) }, (_, i) => openStart + i),
    [openStart, openEnd],
  );

  const slotMap = useMemo(() => {
    const map = new Map<string, SlotStateRow>();
    for (const slot of slotData?.slots ?? []) map.set(`${slot.court_id}|${slot.day}|${slot.hour}`, slot);
    return map;
  }, [slotData]);

  const courts = SPORTS[sport].courts;
  const member = isMember(profile?.member?.tier);

  // Restore a guest draft after sign-in.
  useEffect(() => {
    if (!user) return;
    try {
      const stored = window.sessionStorage.getItem(DRAFT_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Draft;
      if (!SPORT_KEYS.includes(parsed.sport)) return;
      setSport(parsed.sport);
      const offset = Math.round((Date.parse(`${parsed.date}T00:00:00`) - Date.parse(`${toDateStr(today)}T00:00:00`)) / 86_400_000);
      if (offset >= 0 && offset < 7) setDayOffset(offset);
      setDraft(parsed);
      window.sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      window.sessionStorage.removeItem(DRAFT_KEY);
    }
  }, [today, user]);

  const pick = (next: Draft) => {
    if (!user) {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      toast("Sign in or create an account to request this hour.");
      navigate({ to: "/auth", search: { returnTo: "/schedule" } });
      return;
    }
    setDraft(next);
  };

  const rate = draft
    ? (() => {
        const stored = rates?.rates.find((r) => r.court_id === draft.courtId);
        if (stored) return Number(member ? stored.member_rate : stored.non_member_rate);
        const fallback = SPORTS[draft.sport].courts.find((c) => c.id === draft.courtId);
        return fallback ? (member ? fallback.memberRate : fallback.nonMemberRate) : 0;
      })()
    : 0;

  const submit = async () => {
    if (!draft || !user) return;
    setSubmitting(true);
    try {
      const result = await requestSlot({
        data: { sport: draft.sport, courtId: draft.courtId, date: draft.date, startHour: draft.hour, hours: 1 },
      });
      setConfirmation(result.booking.ref ?? "");
      setDraft(null);
      await queryClient.invalidateQueries({ queryKey: ["slot-states"] });
      await queryClient.invalidateQueries({ queryKey: ["my-active-slots"] });
    } catch (error) {
      toast(error instanceof Error ? error.message : "That hour could not be requested.");
      await queryClient.invalidateQueries({ queryKey: ["slot-states"] });
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = async (bookingId: string) => {
    try {
      await cancelMyRequest({ data: { bookingId } });
      toast("Request cancelled.");
      await queryClient.invalidateQueries({ queryKey: ["slot-states"] });
      await queryClient.invalidateQueries({ queryKey: ["my-active-slots"] });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not cancel that request.");
    }
  };

  const cellFor = (courtId: string, day: string, hour: number) => {
    const slot = slotMap.get(`${courtId}|${day}|${hour}`);
    const now = new Date();
    const past = day === toDateStr(now) && hour <= now.getHours();
    const state: SlotState = slot ? slot.state : "open";
    return { slot, state, past, selectable: !slot && !past };
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pt-20">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Live court schedule</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every court, hour by hour, updating live. Tap an open hour to request it — staff confirm it from the front desk.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {SPORT_KEYS.map((k) => (
            <Button
              key={k}
              type="button"
              variant="ghost"
              onClick={() => setSport(k)}
              className={cn("border", sport === k ? "border-goldline bg-gold/10 text-foreground" : "border-border bg-surface-1 text-muted-foreground")}
            >
              <Icon name={SPORTS[k].icon} size={16} strokeWidth={1.8} />
              {SPORTS[k].label}
            </Button>
          ))}
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
          {(["day", "week"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              variant="ghost"
              onClick={() => setView(v)}
              className={cn("border capitalize", view === v ? "border-goldline bg-gold/10 text-foreground" : "border-border bg-surface-1 text-muted-foreground")}
            >
              {v}
            </Button>
          ))}
        </div>

        {view === "day" && (
          <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1">
            {days.map((d, i) => (
              <Button
                key={i}
                type="button"
                variant="ghost"
                onClick={() => setDayOffset(i)}
                className={cn(
                  "flex min-w-[58px] flex-col gap-0.5 border px-3 py-2",
                  dayOffset === i ? "border-goldline bg-gold/10 text-foreground" : "border-border text-muted-foreground",
                )}
              >
                <span className="font-mono uppercase">{d.toLocaleDateString("en-PH", { weekday: "short" })}</span>
                <span className="text-base font-bold">{d.getDate()}</span>
              </Button>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {(Object.keys(STATE_LABEL) as SlotState[]).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={cn("h-3 w-3 rounded border", STATE_STYLE[s])} />
              {STATE_LABEL[s]}
            </span>
          ))}
        </div>

        {user && (mine?.slots.length ?? 0) > 0 && (
          <div className="mt-6 rounded-xl border border-goldline bg-gold/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Your slots</p>
            <ul className="mt-3 space-y-2 text-sm">
              {(mine?.slots ?? []).map((slot) => (
                <li key={slot.id} className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-foreground">
                    {slot.date} · {formatHour(slot.start_hour)}–{formatHour(slot.start_hour + slot.hours)} ·{" "}
                    <span className="text-muted-foreground">{slot.status}</span>
                    {slot.status === "Reserved" && slot.reserved_until ? <Countdown until={slot.reserved_until} /> : null}
                  </span>
                  <Button size="xs" variant="ghost" onClick={() => void cancel(slot.id)}>
                    Cancel
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 space-y-8">
          {courts.map((court) => (
            <div key={court.id}>
              <h3 className="mb-3 text-sm font-semibold text-foreground">{court.name}</h3>
              {view === "day" ? (
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-9">
                  {hours.map((h) => {
                    const { state, past, selectable } = cellFor(court.id, dateStr, h);
                    return (
                      <Button
                        key={h}
                        type="button"
                        variant="ghost"
                        disabled={isLoading || !selectable}
                        onClick={() => pick({ sport, courtId: court.id, courtName: court.name, date: dateStr, hour: h })}
                        aria-label={`${formatHour(h)} ${past ? "past" : STATE_LABEL[state]}`}
                        className={cn(
                          "flex min-h-[58px] flex-col whitespace-normal border px-1 py-2 text-xs",
                          isLoading ? "animate-pulse border-border bg-surface-1" : STATE_STYLE[state],
                          past && "opacity-40 line-through",
                        )}
                      >
                        <span className="font-mono font-medium">{formatHour(h)}</span>
                        {!isLoading && <span className="mt-0.5 text-[9px] uppercase">{past ? "Past" : STATE_LABEL[state]}</span>}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-separate border-spacing-1 text-center text-[10px]">
                    <thead>
                      <tr>
                        <th className="w-14" />
                        {days.map((d) => (
                          <th key={d.toISOString()} className="font-mono uppercase text-muted-foreground">
                            {d.toLocaleDateString("en-PH", { weekday: "short" })} {d.getDate()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {hours.map((h) => (
                        <tr key={h}>
                          <th className="font-mono text-muted-foreground">{formatHour(h)}</th>
                          {days.map((d) => {
                            const day = toDateStr(d);
                            const { state, past, selectable } = cellFor(court.id, day, h);
                            return (
                              <td key={day}>
                                <button
                                  type="button"
                                  disabled={isLoading || !selectable}
                                  onClick={() => pick({ sport, courtId: court.id, courtName: court.name, date: day, hour: h })}
                                  aria-label={`${court.name} ${day} ${formatHour(h)} ${past ? "past" : STATE_LABEL[state]}`}
                                  className={cn(
                                    "h-7 w-full rounded border font-mono uppercase transition-colors",
                                    STATE_STYLE[state],
                                    past && "opacity-40",
                                  )}
                                >
                                  {past ? "—" : STATE_LABEL[state].slice(0, 4)}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title="Request this hour"
        subtitle={draft ? `${draft.courtName} · ${formatHour(draft.hour)}–${formatHour(draft.hour + 1)}` : undefined}
      >
        {draft ? (
          <div>
            <dl className="space-y-3 border-y border-border py-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd>{new Date(`${draft.date}T00:00:00`).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Rate</dt>
                <dd>{formatPeso(rate)}/hour</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Pricing</dt>
                <dd className="capitalize">{member ? "member" : "non-member"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted-foreground">
              Staff review your request. Once approved you get a short window to pay the deposit before the hour returns to open.
            </p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <strong className="text-2xl text-gold">{formatPeso(rate)}</strong>
              <Button onClick={() => void submit()} disabled={submitting || authLoading}>
                {submitting ? "Sending…" : "Send request"}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={!!confirmation} onClose={() => setConfirmation(null)} title="Request sent" subtitle="The front desk sees it instantly.">
        <div className="rounded-lg border border-border bg-surface-2 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <strong>Reference</strong>
            <span className="text-gold">{confirmation}</span>
          </div>
          <p className="mt-2 text-muted-foreground">You can cancel or change it here until staff approve it.</p>
        </div>
      </Modal>
      <Footer />
    </main>
  );
}

function Countdown({ until }: { until: string }) {
  const [left, setLeft] = useState(() => Date.parse(until) - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Date.parse(until) - Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  if (left <= 0) return <span className="ml-2 text-destructive">expired</span>;
  const mins = Math.floor(left / 60_000);
  const secs = Math.floor((left % 60_000) / 1000);
  return (
    <span className="ml-2 font-mono text-gold">
      pay within {mins}:{String(secs).padStart(2, "0")}
    </span>
  );
}
