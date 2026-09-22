import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/fae/Badge";
import { Button } from "@/components/fae/Button";
import { Footer } from "@/components/fae/Footer";
import { Icon } from "@/components/fae/Icon";
import { TiltCard } from "@/components/fae/TiltCard";
import { useAuth } from "@/components/fae/AuthProvider";
import { useToast } from "@/components/fae/Toast";
import { supabase } from "@/integrations/supabase/client";
import { createCafeBooking, getCafeAvailability, getCafeStations } from "@/lib/cafe.functions";
import { formatHour, formatPeso } from "@/lib/constants";
import type { CafeStationRow } from "@/lib/fae.types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stations")({
  head: () => ({ meta: [
    { title: "Book a Gaming Station — FAE Bookings" },
    { name: "description", content: "Reserve a gaming PC or PS5 station by the hour at F.A.E. Gaming Lounge in Lipa City." },
    { property: "og:title", content: "Book a Gaming Station — FAE Bookings" },
    { property: "og:description", content: "Choose a gaming PC or PS5, select your hours, and reserve instantly in Lipa City." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: StationsPage,
});

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

function StationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all"|"gaming_pc"|"console">("all");
  const [station, setStation] = useState<CafeStationRow | null>(null);
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const stations = useQuery({ queryKey:["cafe-stations"], queryFn:() => getCafeStations({data:undefined}), refetchInterval:15_000 });
  const availability = useQuery({ queryKey:["cafe-availability", date], queryFn:() => getCafeAvailability({data:{date}}), refetchInterval:10_000 });
  useEffect(() => { const channel = supabase.channel("cafe-live").on("postgres_changes", { event:"*", schema:"public", table:"cafe_booking_slots" }, () => queryClient.invalidateQueries({queryKey:["cafe-availability"]})).on("postgres_changes", { event:"*", schema:"public", table:"cafe_stations" }, () => queryClient.invalidateQueries({queryKey:["cafe-stations"]})).subscribe(); return () => { void supabase.removeChannel(channel); }; }, [queryClient]);
  useEffect(() => { const raw = sessionStorage.getItem("fae.cafeDraft"); if (!raw) return; try { const draft = JSON.parse(raw) as {stationId:string;date:string;hours:number[]}; setDate(draft.date); setHours(draft.hours); const found=(stations.data?.stations??[]).find(s=>s.id===draft.stationId); if(found) setStation(found); } catch { sessionStorage.removeItem("fae.cafeDraft"); } }, [stations.data]);
  const taken = useMemo(() => new Set((availability.data?.slots??[]).filter(s=>s.station_id===station?.id).map(s=>s.hour)), [availability.data,station]);
  const toggleHour=(h:number)=>{ if(taken.has(h)) return; const next=hours.includes(h)?hours.filter(x=>x!==h):[...hours,h].sort((a,b)=>a-b); if(next.length>1&&!next.every((v,i)=>i===0||v===(next[i-1] ?? v)+1)){toast("Choose consecutive hours for one session.");return;} setHours(next); };
  const choose=(s:CafeStationRow)=>{setStation(s);setHours([]);requestAnimationFrame(()=>document.getElementById("reserve")?.scrollIntoView({behavior:"smooth",block:"start"}));};
  const confirm=async()=>{ if(!station||!hours.length)return; const draft={stationId:station.id,date,hours}; sessionStorage.setItem("fae.cafeDraft",JSON.stringify(draft)); if(!user){navigate({to:"/auth",search:{returnTo:"/stations"}});return;} setBusy(true); try { const result=await createCafeBooking({data:draft}); sessionStorage.removeItem("fae.cafeDraft"); setHours([]); toast(`Reserved ${station.name} · ${result.booking.ref}`); queryClient.invalidateQueries({queryKey:["cafe-availability"]}); queryClient.invalidateQueries({queryKey:["my-cafe-bookings"]}); } catch(error){toast(error instanceof Error?error.message:"Could not reserve this station."); queryClient.invalidateQueries({queryKey:["cafe-availability"]});} finally{setBusy(false);} };
  const visible=(stations.data?.stations??[]).filter(s=>filter==="all"||s.station_type===filter);
  return <main className="min-h-screen bg-background pt-16">
    <section className="gaming-spotlight border-b border-border px-4 py-20 sm:px-6"><div className="mx-auto max-w-7xl"><Badge variant="gold">Live availability</Badge><h1 className="mt-6 max-w-4xl font-display text-5xl font-black leading-[.92] text-foreground sm:text-7xl">Pick your station.<br/><span className="text-gold">Own the next hour.</span></h1><p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">High-performance gaming PCs and PS5 lounge stations. Choose consecutive hours and lock your setup instantly.</p><div className="mt-9 flex flex-wrap gap-2">{(["all","gaming_pc","console"] as const).map(x=><Button key={x} variant={filter===x?"gold":"ghost"} size="sm" onClick={()=>setFilter(x)}>{x==="all"?"All stations":x==="gaming_pc"?"Gaming PCs":"PS5 consoles"}</Button>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{visible.map(s=>{const occupied=(availability.data?.slots??[]).some(slot=>slot.station_id===s.id);const online=s.status==="available";return <TiltCard key={s.id} className="h-full"><button type="button" disabled={!online} onClick={()=>choose(s)} className={cn("shine-card flex h-full w-full flex-col rounded-lg border bg-surface-2 p-5 text-left transition",station?.id===s.id?"border-gold shadow-[0_0_30px_-16px_var(--gold)]":"border-border hover:border-goldline",!online&&"opacity-55")}><div className="flex w-full items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-wider text-gold">{s.code}</span><Badge variant={!online?"red":occupied?"gold":"green"}>{!online?s.status:occupied?"partly reserved":"available"}</Badge></div><div className="my-7 flex h-12 w-12 items-center justify-center rounded-lg border border-goldline bg-gold/10 text-gold"><Icon name={s.station_type==="gaming_pc"?"monitor":"activity"} size={23}/></div><h2 className="font-display text-lg font-bold text-foreground">{s.name}</h2><div className="mt-3 flex-1 space-y-1">{Object.values((s.specs??{}) as Record<string,string>).slice(0,4).map(v=><p key={v} className="text-xs text-muted-foreground">{v}</p>)}</div><p className="mt-5 font-display text-xl font-bold text-gold">{formatPeso(s.hourly_rate)}<span className="text-xs font-medium text-muted-foreground"> / hour</span></p></button></TiltCard>})}</div></section>
    <section id="reserve" className="scroll-mt-24 border-y border-goldline bg-surface-1 px-4 py-16 sm:px-6"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-gold">Your session</p><h2 className="mt-3 font-display text-3xl font-bold text-foreground">{station?.name??"Choose a station"}</h2><p className="mt-3 text-sm text-muted-foreground">{station?`${station.station_type==="gaming_pc"?"Gaming PC":"PS5 console"} · ${formatPeso(station.hourly_rate)}/hour`:"Select a station above to see its live hourly slots."}</p><label className="mt-8 block max-w-xs text-xs text-muted-foreground">Session date<input type="date" min={today()} value={date} onChange={e=>{setDate(e.target.value);setHours([])}} className="fae-input mt-2"/></label></div><div className="glass-panel rounded-lg border border-border p-5"><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{HOURS.map(h=><button type="button" key={h} disabled={!station||taken.has(h)} onClick={()=>toggleHour(h)} className={cn("h-12 rounded-md border font-mono text-[11px] transition",taken.has(h)?"cursor-not-allowed border-border bg-surface-1 text-muted-foreground/40":hours.includes(h)?"border-gold bg-gold text-primary-foreground":"border-border bg-surface-3 text-foreground hover:border-goldline")}>{formatHour(h)}</button>)}</div><div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><div><p className="font-mono text-[10px] uppercase text-muted-foreground">{hours.length?`${hours.length} hour${hours.length>1?"s":""} · ${formatHour(hours[0] ?? 0)}–${formatHour((hours[hours.length-1] ?? 0)+1)}`:"Select consecutive hours"}</p><p className="mt-1 font-display text-3xl font-bold text-gold">{formatPeso((station?.hourly_rate??0)*hours.length)}</p></div><Button disabled={!station||!hours.length||busy} onClick={confirm}>{busy?"Locking station…":user?"Confirm reservation":"Sign in to reserve"}</Button></div></div></div></section>
    <Footer />
  </main>;
}