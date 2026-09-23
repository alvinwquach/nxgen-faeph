import { LayoutGroup, MotionConfig, motion, type Variants } from "motion/react";
import { useId, useState } from "react";
import { hoursFrom, MAX_BOOKING_HOURS } from "@/lib/booking-utils";
import { formatHour, PEAK } from "@/lib/constants";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { cn } from "@/lib/utils";
import { DurationField } from "./DurationField";

/** Inclusive hour range. start === end means one hour picked (tap a later hour to extend). */
export type HourRange = { start: number; end: number } | null;

export const MAX_HOURS = MAX_BOOKING_HOURS;

const PERIODS = [
  { label: "Morning", test: (h: number) => h < 12 },
  { label: "Afternoon", test: (h: number) => h >= 12 && h < 17 },
  { label: "Night", test: (h: number) => h >= 17 },
];

/** First tap = start; a later open hour = end (every hour between must be open, max 8). Anything else restarts. */
export function nextRange(range: HourRange, hour: number, unavailable: Set<number>): HourRange {
  if (range && range.start === range.end && hour === range.start) return null;
  if (!range || range.start !== range.end || hour < range.start) return { start: hour, end: hour };
  if (hour - range.start + 1 > MAX_HOURS) return { start: hour, end: hour };
  for (let h = range.start; h <= hour; h++) if (unavailable.has(h)) return { start: hour, end: hour };
  return { start: range.start, end: hour };
}

export function rangeHours(range: HourRange): number[] {
  return range ? Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i) : [];
}

const grid: Variants = { hidden: {}, visible: { transition: { staggerChildren: motionTokens.stagger } } };
const chip: Variants = {
  hidden: { opacity: 0, y: motionTokens.distance.sm, scale: motionTokens.scale.subtle },
  visible: { opacity: 1, y: 0, scale: 1, transition: springs.gentle },
};

export function HourGrid({
  hours,
  unavailable,
  range,
  onChange,
}: {
  hours: number[];
  unavailable: Set<number>;
  range: HourRange;
  onChange: (range: HourRange) => void;
}) {
  const picked = rangeHours(range);
  const durationId = useId();
  const [duration, setDuration] = useState("");
  const [durationError, setDurationError] = useState<string | null>(null);
  const isOpen = (h: number) => hours.includes(h) && !unavailable.has(h);

  // A typed duration stretches the picked start into a block; tapping an end hour still works.
  const withDuration = (start: number, text: string): HourRange => {
    if (!text) {
      setDurationError(null);
      return { start, end: start };
    }
    const block = hoursFrom(start, Number(text), isOpen);
    if (typeof block === "string") {
      setDurationError(block);
      return { start, end: start };
    }
    setDurationError(null);
    return { start, end: block[block.length - 1]! };
  };

  const tap = (h: number) => {
    let next = nextRange(range, h, unavailable);
    if (next && next.start === next.end && duration) next = withDuration(next.start, duration);
    else setDurationError(null);
    if (next && next.end > next.start) setDuration(String(next.end - next.start + 1));
    onChange(next);
  };

  const type = (text: string) => {
    setDuration(text);
    if (range) onChange(withDuration(range.start, text));
    else setDurationError(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id="hour-grid">
        <div className="space-y-5">
          <DurationField id={durationId} value={duration} onChange={type} error={durationError} />
          {PERIODS.map((period) => {
            const list = hours.filter(period.test);
            if (!list.length) return null;
            return (
              <div key={period.label} role="group" aria-label={`${period.label} hours`}>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{period.label}</p>
                <motion.div className="grid grid-cols-3 gap-2 sm:grid-cols-4" variants={grid} initial="hidden" animate="visible">
                  {list.map((h) => {
                    const taken = unavailable.has(h);
                    const edge = !!range && (h === range.start || h === range.end);
                    const inside = !edge && picked.includes(h);
                    const peak = PEAK.enabled && h >= PEAK.start;
                    return (
                      <motion.button
                        key={h}
                        type="button"
                        variants={chip}
                        disabled={taken}
                        aria-pressed={edge || inside}
                        aria-label={`${formatHour(h)} to ${formatHour(h + 1)}${peak ? ", peak rate" : ""}${taken ? ", taken" : edge || inside ? ", selected" : ""}`}
                        onClick={() => tap(h)}
                        {...(taken ? {} : { whileHover: { scale: motionTokens.scale.pop }, whileTap: { scale: motionTokens.scale.press } })}
                        transition={springs.bouncy}
                        className={cn(
                          "relative h-12 overflow-hidden rounded-xl border text-sm font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                          taken && "cursor-not-allowed border-border/40 bg-surface-1/30 text-muted-foreground/40 line-through",
                          !taken && edge && "border-gold text-background",
                          !taken && inside && "border-goldline text-gold",
                          !taken && !edge && !inside && "border-border bg-surface-1 text-foreground hover:border-goldline",
                        )}
                      >
                        {range && h === range.start ? (
                          <motion.span layoutId="hour-start" className="absolute inset-0 bg-gold" transition={springs.bouncy} />
                        ) : null}
                        {range && h === range.end && range.end !== range.start ? (
                          <motion.span layoutId="hour-end" className="absolute inset-0 bg-gold" transition={springs.bouncy} />
                        ) : null}
                        {inside ? (
                          <motion.span
                            className="absolute inset-0 bg-gold/20"
                            initial={{ opacity: 0, scaleX: 0.6 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={springs.snappy}
                          />
                        ) : null}
                        <span className="relative">{formatHour(h)}</span>
                        {peak && !taken ? (
                          <span aria-hidden="true" className={cn("absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full", edge ? "bg-background" : "bg-gold")} />
                        ) : null}
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
