import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { formatHour, HOURS as DEFAULT_HOURS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT = 52;

interface HourWheelProps {
  selected: number | null;
  unavailable: Set<number>;
  onSelect: (hour: number) => void;
  /** Bookable hours; defaults to the venue's standard window. */
  hours?: number[];
}

export function HourWheel({ selected, unavailable, onSelect, hours }: HourWheelProps) {
  const HOURS = hours && hours.length ? hours : DEFAULT_HOURS;
  const viewportRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const index = selected === null ? HOURS.findIndex((hour) => !unavailable.has(hour)) : HOURS.indexOf(selected);
    if (index < 0) return;
    viewportRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
  }, [selected, unavailable]);

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  const settle = () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const rawIndex = Math.round(viewport.scrollTop / ITEM_HEIGHT);
      const closest = HOURS.map((hour, index) => ({ hour, distance: Math.abs(index - rawIndex) }))
        .filter(({ hour }) => !unavailable.has(hour))
        .sort((a, b) => a.distance - b.distance)[0];
      if (!closest) return;
      onSelect(closest.hour);
      viewport.scrollTo({ top: HOURS.indexOf(closest.hour) * ITEM_HEIGHT, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="hour-wheel relative mx-auto max-w-sm" aria-label="Choose a one-hour time slot">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-[52px] -translate-y-1/2 rounded-lg border border-goldline bg-gold/10" aria-hidden="true" />
      <div ref={viewportRef} onScroll={settle} className="hour-wheel-viewport scrollbar-hide h-[260px] snap-y snap-mandatory overflow-y-auto py-[104px]">
        {HOURS.map((hour) => {
          const disabled = unavailable.has(hour);
          const active = selected === hour;
          return (
            <div key={hour} className="flex h-[52px] snap-center items-center justify-center px-3">
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onSelect(hour)}
                className={cn(
                  "relative z-20 h-11 w-full border-0 bg-transparent text-base transition-[color,opacity,transform] duration-200",
                  active ? "scale-105 text-gold" : "text-muted-foreground opacity-45",
                  disabled && "line-through opacity-20",
                )}
              >
                {formatHour(hour)}
                <span className="ml-3 text-[10px] uppercase">{disabled ? "Unavailable" : active ? "Selected" : "Open"}</span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}