import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useToast } from "./Toast";
import { supabase } from "@/integrations/supabase/client";
import { formatHour, formatPeso } from "@/lib/constants";
import {
  getBookingRequests,
  getVenueSettings,
  reviewBookingRequest,
  sweepLapsedReserves,
  updateVenueSettings,
} from "@/lib/schedule.functions";

export function BookingRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["booking-requests"],
    queryFn: () => getBookingRequests({ data: undefined }),
    refetchInterval: 30_000,
  });
  const { data: settings } = useQuery({ queryKey: ["venue-settings"], queryFn: () => getVenueSettings({ data: undefined }) });

  const [openStart, setOpenStart] = useState<number | null>(null);
  const [openEnd, setOpenEnd] = useState<number | null>(null);
  const [grace, setGrace] = useState<number | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("admin-schedule-pulse")
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule_pulse" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const review = async (bookingId: string, action: "reserve" | "book" | "decline") => {
    setBusy(bookingId);
    try {
      await reviewBookingRequest({ data: { bookingId, action } });
      await queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["slot-states"] });
      toast(action === "decline" ? "Request declined — slot is open again." : "Schedule updated.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update that request.");
    } finally {
      setBusy(null);
    }
  };

  const saveSettings = async () => {
    try {
      await updateVenueSettings({
        data: {
          openStart: openStart ?? settings?.openStart ?? 6,
          openEnd: openEnd ?? settings?.openEnd ?? 23,
          graceMinutes: grace ?? settings?.graceMinutes ?? 20,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["venue-settings"] });
      toast("Schedule settings saved.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save settings.");
    }
  };

  const requests = data?.requests ?? [];

  return (
    <section className="space-y-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Approval queue</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Booking requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Approving writes straight onto the live schedule everyone sees.
        </p>

        <div className="mt-5 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-surface-3 font-mono text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Client</th>
                <th className="p-3">Court</th>
                <th className="p-3">When</th>
                <th className="p-3">Amount</th>
                <th className="p-3">State</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td className="p-4 text-muted-foreground" colSpan={6}>
                    No pending or reserved requests right now.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="bg-surface-2">
                    <td className="p-3">
                      <p className="font-semibold text-foreground">{r.booker_name ?? "Member"}</p>
                      <p className="text-xs text-muted-foreground">{r.contact ?? r.ref}</p>
                    </td>
                    <td className="p-3 text-foreground">{r.court_id}</td>
                    <td className="p-3 text-muted-foreground">
                      {r.date} · {formatHour(r.start_hour)}–{formatHour(r.start_hour + r.hours)}
                    </td>
                    <td className="p-3 font-semibold text-gold">{formatPeso(Number(r.amount))}</td>
                    <td className="p-3">
                      <Badge variant={r.status === "Reserved" ? "gold" : "blue"}>{r.status}</Badge>
                      {r.status === "Reserved" && r.reserved_until ? (
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          holds until {new Date(r.reserved_until).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {r.status === "Pending" && (
                          <Button size="xs" disabled={busy === r.id} onClick={() => void review(r.id, "reserve")}>
                            Approve (hold)
                          </Button>
                        )}
                        <Button size="xs" variant="ghost" disabled={busy === r.id} onClick={() => void review(r.id, "book")}>
                          Mark booked
                        </Button>
                        <Button size="xs" variant="danger" disabled={busy === r.id} onClick={() => void review(r.id, "decline")}>
                          Decline
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Button
          className="mt-4"
          variant="ghost"
          size="sm"
          onClick={async () => {
            const result = await sweepLapsedReserves({ data: undefined });
            await queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
            toast(`${result.released} lapsed hold${result.released === 1 ? "" : "s"} released.`);
          }}
        >
          Release lapsed holds now
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-surface-2 p-5">
        <h3 className="font-display text-lg font-bold text-foreground">Schedule settings</h3>
        <p className="mt-1 text-sm text-muted-foreground">Open hours limit which slots clients can request. Holds auto-release after the grace window.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-xs text-muted-foreground">
            Opens at (hour)
            <input
              type="number"
              min={0}
              max={23}
              value={openStart ?? settings?.openStart ?? 6}
              onChange={(e) => setOpenStart(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Closes at (hour)
            <input
              type="number"
              min={1}
              max={24}
              value={openEnd ?? settings?.openEnd ?? 23}
              onChange={(e) => setOpenEnd(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted-foreground">
            Payment grace (minutes)
            <input
              type="number"
              min={5}
              max={240}
              value={grace ?? settings?.graceMinutes ?? 20}
              onChange={(e) => setGrace(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
        <Button className="mt-4" size="sm" onClick={() => void saveSettings()}>
          Save settings
        </Button>
      </div>
    </section>
  );
}
