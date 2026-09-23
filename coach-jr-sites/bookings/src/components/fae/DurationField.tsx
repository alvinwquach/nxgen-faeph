import { MAX_BOOKING_HOURS } from "@/lib/booking-utils";

/** Optional typed booking length. Empty means "pick hours by tapping". */
export function DurationField({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-xs text-muted-foreground">
        Duration <span className="text-muted-foreground/60">(optional)</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_BOOKING_HOURS}
          step={1}
          value={value}
          placeholder="—"
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="fae-input w-16 px-2 py-1 text-center text-sm tabular-nums"
        />
        hrs
      </label>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
