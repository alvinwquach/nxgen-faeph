import { cn } from "@/lib/utils";
import logoAsset from "@/assets/linkmeph-logo.png.asset.json";

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img src={logoAsset.url} alt="" className="h-8 w-16 shrink-0 object-contain" />
      {showWordmark ? (
        <span className="text-base font-bold text-foreground">LinkMePH</span>
      ) : null}
    </span>
  );
}
