import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Stat = { label: string; value: number; suffix?: string; prefix?: string };

const STATS: Stat[] = [
  { label: "Cards delivered", value: 2400, suffix: "+" },
  { label: "Games streamed", value: 180, suffix: "+" },
  { label: "Creative projects", value: 320, suffix: "+" },
  { label: "Partner leagues", value: 12, suffix: "+" },
];

function useCountUp(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run);
  return (
    <div className="text-center">
      <p className="text-3xl font-bold brand-gradient-text md:text-4xl">
        {stat.prefix}
        {n.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
    </div>
  );
}

export function StatsBar({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    const fallback = setTimeout(() => setRun(true), 900);
    return () => {
      clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-2 gap-8 border-y border-border px-2 py-10 md:grid-cols-4",
        className,
      )}
    >
      {STATS.map((s) => (
        <StatItem key={s.label} stat={s} run={run} />
      ))}
    </div>
  );
}
