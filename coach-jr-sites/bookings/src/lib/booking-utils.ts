import { formatHour, PEAK, SPORTS, type SportKey } from "./constants";

export const MAX_BOOKING_HOURS = 8; // requestSlot caps one request at 8 hours

/** Hours covered by an optional typed duration starting at `start`, or a message saying why it doesn't fit. */
export function hoursFrom(start: number, n: number, isOpen: (hour: number) => boolean): number[] | string {
  if (!Number.isInteger(n) || n < 1 || n > MAX_BOOKING_HOURS) return `Enter 1 to ${MAX_BOOKING_HOURS} hours.`;
  const out: number[] = [];
  for (let h = start; h < start + n; h++) {
    if (!isOpen(h)) return `Only ${out.length} hr${out.length === 1 ? "" : "s"} open from ${formatHour(start)}.`;
    out.push(h);
  }
  return out;
}

/**
 * Venue clock (Asia/Manila). The server renders in UTC and visitors are in PH, so rendering from
 * the local clock made SSR and hydration disagree on dates / past hours (React error #418).
 */
export function venueNow() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return { iso: `${p["year"]}-${p["month"]}-${p["day"]}`, hour: Number(p["hour"]), y: Number(p["year"]), m: Number(p["month"]), d: Number(p["day"]) };
}

/** The venue's today as a local-noon Date, so getDate()/toLocaleDateString() match on server and browser. */
export function venueToday(): Date {
  const { y, m, d } = venueNow();
  return new Date(y, m - 1, d, 12);
}

/** Group sorted selected hours into contiguous blocks. */
export function groupContiguous(hours: number[]): number[][] {
  const sorted = [...hours].sort((a, b) => a - b);
  const blocks: number[][] = [];
  for (const h of sorted) {
    const last = blocks[blocks.length - 1];
    if (last && last[last.length - 1] === h - 1) last.push(h);
    else blocks.push([h]);
  }
  return blocks;
}

/** Price of one hour on a court, using member or non-member rate and the configured peak uplift. */
export function hourRate(sport: SportKey, courtId: string, startHour: number, isMember: boolean): number {
  const court = SPORTS[sport].courts.find((c) => c.id === courtId);
  if (!court) throw new Error("Unknown court");
  const rate = isMember ? court.memberRate : court.nonMemberRate;
  const peak = PEAK.enabled && startHour >= PEAK.start;
  return Math.round(rate * (peak ? 1 + PEAK.uplift : 1));
}

/** Price for a set of hours at the member or non-member rate. */
export function priceHours(sport: SportKey, courtId: string, hours: number[], isMember: boolean): number {
  return hours.reduce((sum, h) => sum + hourRate(sport, courtId, h, isMember), 0);
}

/** True when any selected hour falls in the peak window. */
export function hasPeakHour(hours: number[]): boolean {
  return PEAK.enabled && hours.some((h) => h >= PEAK.start);
}

