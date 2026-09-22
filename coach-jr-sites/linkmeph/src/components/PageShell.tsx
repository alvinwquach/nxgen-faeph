import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight text-foreground md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
