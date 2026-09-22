import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CreditCard, Radio, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Service = {
  icon: typeof Radio;
  title: string;
  body: string;
  demo?: { to: "/card" | "/live-sports" | "/creative-services"; label: string };
  href?: string;
};

const services: Service[] = [
  {
    icon: CreditCard,
    title: "Digital Business Cards",
    body: "Smart NFC cards and one shareable profile for your socials, contact details, portfolio and links.",
    demo: { to: "/card" as const, label: "Explore cards" },
  },
  {
    icon: Radio,
    title: "Livestreaming",
    body: "Live sports and event coverage, produced on-site at FAE Court and broadcast across online platforms.",
    demo: { to: "/live-sports" as const, label: "View live sports" },
  },
  {
    icon: Sparkles,
    title: "Social Media Content Creation",
    body: "Professional production and creative editing for brands, leagues, teams and athletes.",
    demo: { to: "/creative-services" as const, label: "View packages" },
  },
  {
    icon: BadgeCheck,
    title: "Advertising",
    body: "Courtside boards, stream overlays and digital-profile placements at FAE Court and across our platforms.",
    href: "#inquire",
  },
];

export function ServicesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => (
        <Card key={s.title} className="group flex flex-col overflow-hidden border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-brand">
          <CardContent className="flex flex-1 flex-col p-6 md:p-7">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[9px] border border-primary/25 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <s.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.body}</p>
            <div className="mt-6">
              {s.demo ? (
                <Button asChild size="sm" variant="outline">
                  <Link to={s.demo.to}>{s.demo.label} <ArrowRight /></Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline"><a href={s.href ?? "#inquire"}>Advertise with us <ArrowRight /></a></Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
