import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { useToast } from "./Toast";
import { formatHour, formatPeso } from "@/lib/constants";
import { getCafeAdminData, saveCafeStation, updateCafeBookingStatus } from "@/lib/cafe.functions";
import type { CafeStationRow } from "@/lib/fae.types";

const EMPTY = { code: "", name: "", station_type: "gaming_pc", hourly_rate: 80, status: "available", active: true, sort_order: 20, specs: {} } as const;

export function CafeAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ["cafe-admin"], queryFn: () => getCafeAdminData({ data: undefined }), refetchInterval: 15_000 });
  const [editing, setEditing] = useState<CafeStationRow | null | "new">(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["cafe-admin"] });
  const changeStatus = async (id: string, status: "reserved" | "confirmed" | "completed" | "cancelled") => {
    try { await updateCafeBookingStatus({ data: { id, status } }); toast(`Booking marked ${status}.`); refresh(); }
    catch (error) { toast(error instanceof Error ? error.message : "Could not update booking."); }
  };
  if (isLoading) return <p className="font-mono text-xs uppercase text-muted-foreground">Loading gaming lounge…</p>;
  return <div className="space-y-10">
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Live floor</p><h2 className="mt-2 font-display text-2xl font-bold text-foreground">Stations</h2></div><Button size="sm" onClick={() => setEditing("new")}>Add station</Button></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{(data?.stations ?? []).map((s) => <button type="button" key={s.id} onClick={() => setEditing(s)} className="shine-card rounded-lg border border-border bg-surface-2 p-4 text-left transition hover:border-goldline"><div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] uppercase text-gold">{s.code}</span><Badge variant={s.status === "available" ? "green" : s.status === "maintenance" ? "gold" : "red"}>{s.status}</Badge></div><p className="mt-4 font-display text-lg font-bold text-foreground">{s.name}</p><p className="mt-1 text-xs text-muted-foreground">{s.station_type === "gaming_pc" ? "Gaming PC" : "PS5 Console"} · {formatPeso(s.hourly_rate)}/hr</p></button>)}</div>
    </section>
    <section><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Reservations</p><h2 className="mt-2 font-display text-2xl font-bold text-foreground">Café bookings</h2></div><div className="mt-5 overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-3 font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="p-3">Guest</th><th className="p-3">Station</th><th className="p-3">Time</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody className="divide-y divide-border">{(data?.bookings ?? []).map((b) => <tr key={b.id} className="bg-surface-2"><td className="p-3"><p className="font-semibold text-foreground">{b.members?.name ?? "Member"}</p><p className="text-xs text-muted-foreground">{b.ref}</p></td><td className="p-3 text-foreground">{b.cafe_stations?.name ?? "Station"}</td><td className="p-3 text-muted-foreground">{b.date} · {formatHour(b.start_hour)}–{formatHour(b.start_hour + b.hours)}</td><td className="p-3 font-semibold text-gold">{formatPeso(b.amount)}</td><td className="p-3"><Badge variant={b.status === "cancelled" ? "red" : b.status === "completed" ? "green" : "gold"}>{b.status}</Badge></td><td className="p-3"><div className="flex gap-2">{b.status === "reserved" && <Button size="xs" onClick={() => changeStatus(b.id, "confirmed")}>Confirm</Button>}{!(["cancelled", "completed"] as string[]).includes(b.status) && <Button size="xs" variant="ghost" onClick={() => changeStatus(b.id, "completed")}>Complete</Button>}{!(["cancelled", "completed"] as string[]).includes(b.status) && <Button size="xs" variant="danger" onClick={() => changeStatus(b.id, "cancelled")}>Cancel</Button>}</div></td></tr>)}</tbody></table></div></section>
    <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add station" : "Edit station"}>{editing !== null && <StationForm station={editing === "new" ? null : editing} onDone={() => { setEditing(null); refresh(); }} />}</Modal>
  </div>;
}

function StationForm({ station, onDone }: { station: CafeStationRow | null; onDone: () => void }) {
  const { toast } = useToast();
  const base = station ?? EMPTY;
  const specs = typeof base.specs === "object" && base.specs && !Array.isArray(base.specs) ? base.specs as Record<string, string> : {};
  const [form, setForm] = useState({ code: base.code, name: base.name, stationType: base.station_type as "gaming_pc" | "console", hourlyRate: Number(base.hourly_rate), status: base.status as "available" | "maintenance" | "offline", active: base.active, sortOrder: base.sort_order, specs: Object.entries(specs).map(([k,v]) => `${k}: ${v}`).join("\n") });
  const [busy, setBusy] = useState(false);
  return <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { const parsed = Object.fromEntries(form.specs.split("\n").map((line) => { const index = line.indexOf(":"); return index > 0 ? [line.slice(0, index).trim(), line.slice(index + 1).trim()] : null; }).filter((entry): entry is [string, string] => entry !== null)); await saveCafeStation({ data: { id: station?.id, ...form, specs: parsed } }); toast("Station saved."); onDone(); } catch (error) { toast(error instanceof Error ? error.message : "Could not save station."); } finally { setBusy(false); } }}>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Code<input className="fae-input mt-1" value={form.code} onChange={(e) => setForm({...form, code:e.target.value})} required /></label><label className="text-xs text-muted-foreground">Name<input className="fae-input mt-1" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} required /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Type<select className="fae-input mt-1" value={form.stationType} onChange={(e) => setForm({...form, stationType:e.target.value as "gaming_pc"|"console"})}><option value="gaming_pc">Gaming PC</option><option value="console">Console</option></select></label><label className="text-xs text-muted-foreground">Rate / hour<input type="number" min="0" className="fae-input mt-1" value={form.hourlyRate} onChange={(e) => setForm({...form, hourlyRate:Number(e.target.value)})} /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs text-muted-foreground">Status<select className="fae-input mt-1" value={form.status} onChange={(e) => setForm({...form, status:e.target.value as "available"|"maintenance"|"offline"})}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="offline">Offline</option></select></label><label className="text-xs text-muted-foreground">Order<input type="number" min="0" className="fae-input mt-1" value={form.sortOrder} onChange={(e) => setForm({...form, sortOrder:Number(e.target.value)})} /></label></div>
    <label className="block text-xs text-muted-foreground">Specs, one per line (label: value)<textarea rows={5} className="fae-input mt-1" value={form.specs} onChange={(e) => setForm({...form, specs:e.target.value})} /></label>
    <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active:e.target.checked})} /> Visible for booking</label>
    <Button className="w-full" disabled={busy}>{busy ? "Saving…" : "Save station"}</Button>
  </form>;
}