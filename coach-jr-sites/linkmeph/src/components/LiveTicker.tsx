import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

import { matches } from "@/data/linkmeph";
import { cn } from "@/lib/utils";

export function LiveTicker({ className }: { className?: string }) {
  const items = matches.slice(0, 6);
  const loop = [...items, ...items];

  return (
    <div className={cn("relative flex items-center overflow-hidden border-y border-border bg-card/60", className)}>
      <div className="z-10 flex shrink-0 items-center gap-2 border-r border-border bg-background px-4 py-2.5">
        <span className="live-dot h-2 w-2 rounded-full bg-brand-red" />
        <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground">Live</span>
      </div>
      <div className="group relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max gap-8 py-2.5 group-hover:[animation-play-state:paused]">
          {loop.map((m, i) => (
            <Link
              key={`${m.id}-${i}`}
              to="/live-sports/$matchId"
              params={{ matchId: m.id }}
              className="flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Radio className="h-3.5 w-3.5 text-brand-cyan" />
              <span className="font-semibold text-foreground">{m.home}</span>
              {m.score ? (
                <span className="font-display font-bold text-brand-cyan">
                  {m.score.home}–{m.score.away}
                </span>
              ) : (
                <span>vs</span>
              )}
              <span className="font-semibold text-foreground">{m.away}</span>
              <span className="uppercase tracking-widest text-[10px]">{m.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
