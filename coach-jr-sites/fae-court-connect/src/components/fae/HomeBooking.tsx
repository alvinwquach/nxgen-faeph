import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { HourWheel } from "./HourWheel";
import { Modal } from "./Modal";
import { useToast } from "./Toast";
import {
  formatHour,
  formatPeso,
  HOURS,
  isMember,
  PEAK,
  SPORTS,
  SPORT_KEYS,
  type SportKey,
} from "@/lib/constants";
import {
  ensureMemberProfile,
  getAvailability,
  getCourtRates,
  getMyProfile,
} from "@/lib/fae.functions";
import { getVenueSettings, requestSlot } from "@/lib/schedule.functions";
import { cn } from "@/lib/utils";

const DRAFT_KEY = "fae.bookingDraft";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function HomeBooking() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sport, setSport] = useState<SportKey>("basketball");
  const [courtId, setCourtId] = useState(SPORTS.basketball.courts[0]?.id ?? "bb-full");
  const [date, setDate] = useState(() => toIso(new Date()));
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ ref: string; startHour: number; hours: number; amount: number }[] | null>(null);

  const { data: availability, refetch } = useQuery({
    queryKey: ["availability", courtId, date],
    queryFn: () => getAvailability({ data: { courtId, date } }),
  });
  const { data: rates } = useQuery({ queryKey: ["court-rates"], queryFn: () => getCourtRates({ data: undefined }) });
  const { data: settings } = useQuery({ queryKey: ["venue-settings"], queryFn: () => getVenueSettings({ data: undefined }) });
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getMyProfile({ data: undefined }),
    enabled: !!user,
  });

  const days = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const value = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      return { iso: toIso(value), day: value.getDate(), weekday: i === 0 ? "Today" : WEEKDAYS[value.getDay()] };
    });
  }, []);
  const taken = useMemo(() => new Set(availability?.taken ?? []), [availability]);
  const hours = useMemo(() => selectedHour === null ? [] : [selectedHour], [selectedHour]);
  const member = isMember(profile?.member?.tier);
  const court = SPORTS[sport].courts.find((item) => item.id === courtId) ?? SPORTS[sport].courts[0];
  const rate = useMemo(() => {
    const stored = rates?.rates.find((item) => item.court_id === courtId);
    if (stored) return Number(member ? stored.member_rate : stored.non_member_rate);
    const court = SPORT_KEYS.flatMap((key) => SPORTS[key].courts).find((item) => item.id === courtId);
    return court ? (member ? court.memberRate : court.nonMemberRate) : 0;
  }, [courtId, member, rates]);
  const memberRate = useMemo(() => {
    const stored = rates?.rates.find((item) => item.court_id === courtId);
    if (stored) return Number(stored.member_rate);
    return court?.memberRate ?? 0;
  }, [court, courtId, rates]);
  const nonMemberRate = useMemo(() => {
    const stored = rates?.rates.find((item) => item.court_id === courtId);
    if (stored) return Number(stored.non_member_rate);
    return court?.nonMemberRate ?? 0;
  }, [court, courtId, rates]);
  const total = hours.reduce(
    (sum, hour) => sum + Math.round(rate * (PEAK.enabled && hour >= PEAK.start ? 1 + PEAK.uplift : 1)),
    0,
  );
  const isToday = date === toIso(new Date());
  const nowHour = new Date().getHours();
  const openHours = useMemo(() => {
    const start = settings?.openStart ?? HOURS[0] ?? 6;
    const end = settings?.openEnd ?? 23;
    return Array.from({ length: Math.max(end - start, 0) }, (_, i) => start + i);
  }, [settings]);
  const unavailableHours = useMemo(
    () => new Set(openHours.filter((hour) => taken.has(hour) || (isToday && hour <= nowHour))),
    [isToday, nowHour, openHours, taken],
  );

  useEffect(() => {
    try {
      window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ sport, courtId, date, hours }));
    } catch {
      // The booking remains usable if browser storage is unavailable.
    }
  }, [courtId, date, hours, sport]);

  const selectSport = (key: SportKey) => {
    const firstCourt = SPORTS[key].courts[0];
    if (!firstCourt) return;
    setSport(key);
    setCourtId(firstCourt.id);
    setSelectedHour(null);
  };

  const reserve = async () => {
    if (selectedHour === null) return;
    if (!user) {
      toast("Sign in to reserve — your selected hour is saved.");
      navigate({ to: "/auth", search: { returnTo: "/schedule" } });
      return;
    }
    setSubmitting(true);
    try {
      await ensureMemberProfile({ data: {} });
      const result = await requestSlot({ data: { sport, courtId, date, startHour: selectedHour, hours: 1 } });
      setConfirmation([
        {
          ref: result.booking.ref ?? "",
          startHour: result.booking.start_hour,
          hours: result.booking.hours,
          amount: Number(result.booking.amount),
        },
      ]);
      setSelectedHour(null);
      window.sessionStorage.removeItem(DRAFT_KEY);
      await queryClient.invalidateQueries({ queryKey: ["availability"] });
      await queryClient.invalidateQueries({ queryKey: ["slot-states"] });
      await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      await refetch();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Booking failed — please try another hour.");
      await refetch();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[18px] border border-goldline bg-card shadow-2xl shadow-background/60">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 p-5 sm:p-8">
          <div className="flex flex-wrap gap-2" aria-label="Choose a sport">
            {SPORT_KEYS.map((key) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={sport === key ? "gold" : "ghost"}
                onClick={() => selectSport(key)}
              >
                <Icon name={SPORTS[key].icon} size={16} />
                {SPORTS[key].label}
              </Button>
            ))}
          </div>

          {SPORTS[sport].courts.length > 1 ? (
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Choose a court">
              {SPORTS[sport].courts.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="xs"
                  variant={courtId === item.id ? "gold" : "ghost"}
                  onClick={() => {
                    setCourtId(item.id);
                    setSelectedHour(null);
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="scrollbar-hide mt-7 flex gap-2 overflow-x-auto pb-2" aria-label="Choose a day">
            {days.map((day) => (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  setDate(day.iso);
                  setSelectedHour(null);
                }}
                className={cn(
                  "w-[68px] shrink-0 rounded-xl border px-2 py-3 text-center transition-colors",
                  date === day.iso ? "border-gold bg-gold/10" : "border-border bg-surface-1 hover:border-goldline",
                )}
              >
                <span className="block text-xl font-bold text-foreground">{day.day}</span>
                <span className="mt-1 block text-[10px] uppercase text-muted-foreground">{day.weekday}</span>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-center text-[10px] font-semibold uppercase text-muted-foreground">Scroll to choose one hour</p>
            <HourWheel
              hours={openHours}
              selected={selectedHour}
              unavailable={unavailableHours}
              onSelect={setSelectedHour}
            />
          </div>
        </div>

        <aside className="flex flex-col justify-between border-t border-border bg-surface-1 p-6 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-semibold uppercase text-gold">Your booking</p>
            <h3 className="mt-3 text-2xl font-bold text-foreground">{SPORTS[sport].label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{court?.name}</p>
            <dl className="mt-8 space-y-4 border-y border-border py-5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Date</dt><dd>{new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Hours</dt><dd>{hours.length || "—"}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Your live rate</dt><dd>{formatPeso(rate)}/hr</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Member rate</dt><dd className="text-gold">{formatPeso(memberRate)}/hr</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Non-member rate</dt><dd>{formatPeso(nonMemberRate)}/hr</dd></div>
            </dl>
          </div>
          <div className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <span className="text-sm text-muted-foreground">Running total</span>
              <strong className="text-3xl font-bold text-gold">{formatPeso(total)}</strong>
            </div>
            <Button className="w-full" onClick={reserve} disabled={!hours.length || submitting || loading}>
              {submitting ? "Sending…" : user ? "Request this hour" : "Sign in & continue"}
              <Icon name="arrow-right" size={16} />
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">Live availability · protected against double-booking</p>
          </div>
        </aside>
      </div>

      <Modal open={!!confirmation} onClose={() => setConfirmation(null)} title="Request sent" subtitle="The front desk reviews it and confirms your slot.">
        <div className="space-y-3">
          {confirmation?.map((item) => (
            <div key={item.ref} className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex justify-between gap-3 text-sm"><strong>{court?.name}</strong><span className="text-gold">{item.ref}</span></div>
              <p className="mt-2 text-xs text-muted-foreground">{formatHour(item.startHour)}–{formatHour(item.startHour + item.hours)} · {formatPeso(item.amount)}</p>
            </div>
          ))}
          <Button className="mt-3 w-full" onClick={() => navigate({ to: "/account" })}>View my bookings</Button>
        </div>
      </Modal>
    </div>
  );
}