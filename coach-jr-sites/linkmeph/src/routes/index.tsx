import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Check, Contact, Radio, Share2, Smartphone, Wifi } from "lucide-react";

import { InquiryForm } from "@/components/InquiryForm";
import { Logo } from "@/components/Logo";
import { PageShell } from "@/components/PageShell";
import { ServicesGrid } from "@/components/ServicesGrid";
import { StatsBar } from "@/components/StatsBar";
import { Button } from "@/components/ui/button";
import { CARD_PROMO, CARD_SRP } from "@/data/linkmeph";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LinkMePH — One tap. All of you." },
      { name: "description", content: "Connect everything instantly with LinkMePH digital business cards, livestreaming, content creation and advertising in the Philippines." },
      { property: "og:title", content: "LinkMePH — One tap. All of you." },
      { property: "og:description", content: "Smart NFC cards and digital services built to help Filipino people, brands and events connect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const steps = [
  { number: "01", icon: Wifi, title: "Tap", copy: "Tap your LinkMe Card on any modern smartphone." },
  { number: "02", icon: Share2, title: "Share", copy: "Your profile opens instantly. No app or typing needed." },
  { number: "03", icon: Contact, title: "Connect", copy: "Save details, follow socials and start the conversation." },
];

function Home() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="hero-sheen absolute inset-0" aria-hidden />
        <div className="grid-glow absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:gap-12 sm:py-16 md:px-8 lg:min-h-[780px] lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="animate-rise">
            <div className="mb-8 hidden sm:block"><Logo className="scale-110 origin-left" /></div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Connect everything, instantly.</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
              One tap.<br /><span className="brand-gradient-text">All of you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              One premium NFC card opens your complete digital profile — contact details, socials, work and every link that matters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/card">Get your card <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#services">See services <ArrowDown /></a></Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">Launch offer <span className="ml-1 line-through">₱{CARD_SRP.toLocaleString()}</span> <span className="ml-2 font-semibold text-primary">₱{CARD_PROMO.toLocaleString()}</span></p>
          </div>

          <div className="relative mx-auto h-[300px] w-full max-w-[560px] sm:h-[500px] lg:h-[560px]" aria-label="LinkMe Card tapping a phone with a digital profile">
            <div className="absolute right-2 top-0 h-[290px] w-[168px] rounded-[28px] border border-border bg-card p-2 shadow-brand-glow sm:right-8 sm:h-[460px] sm:w-[258px] sm:rounded-[34px]">
              <div className="h-full overflow-hidden rounded-[28px] border border-border bg-background p-5">
                <div className="mx-auto h-1.5 w-16 rounded-full bg-muted" />
                <div className="mt-7 text-center sm:mt-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-lg font-bold text-primary sm:h-20 sm:w-20 sm:text-2xl">IR</div>
                  <p className="mt-3 text-xs font-semibold sm:mt-4 sm:text-lg">Isidro Raymundo</p>
                  <p className="mt-1 text-xs text-muted-foreground">Founder · LinkMePH</p>
                  <div className="mx-auto mt-3 flex w-fit gap-2 sm:mt-5"><span className="h-2 w-2 rounded-full bg-primary" /><span className="h-2 w-2 rounded-full bg-destructive" /><span className="h-2 w-2 rounded-full bg-muted" /></div>
                </div>
                <div className="mt-4 hidden space-y-2.5 sm:block sm:mt-8">
                  {["Save contact", "View portfolio", "Follow on Instagram"].map((item) => <div key={item} className="rounded-full border border-border bg-card px-4 py-3 text-center text-xs font-medium">{item}</div>)}
                </div>
                <p className="mt-7 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Powered by LinkMePH</p>
              </div>
            </div>
            <div className="absolute bottom-3 left-0 w-[220px] -rotate-6 rounded-[16px] border border-primary/30 bg-card p-4 shadow-brand-glow transition-transform duration-500 hover:rotate-0 sm:bottom-10 sm:left-4 sm:w-[330px] sm:rounded-[18px] sm:p-6">
              <div className="flex items-center justify-between"><Logo showWordmark={false} className="scale-75 origin-left" /><Wifi className="h-5 w-5 rotate-90 text-primary" /></div>
              <div className="mt-8 sm:mt-16"><p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">NFC digital card</p><p className="mt-2 text-xs font-semibold sm:text-base">Isidro V. Raymundo Jr.</p><p className="text-[10px] text-muted-foreground sm:text-xs">Founder · LinkMePH</p></div>
            </div>
            <div className="absolute bottom-32 left-[250px] hidden h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary sm:flex"><Radio className="h-8 w-8" /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">How it works</p><h2 className="mt-4 text-3xl font-bold md:text-5xl">From introduction to connection in seconds.</h2></div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[9px] border border-border bg-border md:grid-cols-3">
          {steps.map((step) => <div key={step.title} className="bg-card p-7 md:p-9"><div className="flex items-center justify-between"><step.icon className="h-6 w-6 text-primary" /><span className="text-xs text-muted-foreground">{step.number}</span></div><h3 className="mt-12 text-2xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{step.copy}</p></div>)}
        </div>
      </section>

      <section id="services" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="mb-12 max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">What we do</p><h2 className="mt-4 text-3xl font-bold md:text-5xl">Digital presence, brought to life.</h2><p className="mt-4 text-muted-foreground">Four connected services for people, brands, leagues and events.</p></div>
          <ServicesGrid />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2">
        <div className="relative mx-auto h-[540px] w-full max-w-[430px]">
          <div className="absolute inset-x-8 top-0 h-[520px] rounded-[38px] border border-border bg-card p-2 shadow-brand-glow"><div className="h-full rounded-[31px] border border-border bg-background p-6"><div className="mx-auto h-1.5 w-16 rounded-full bg-muted" /><div className="mt-14 flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-3xl font-bold text-primary">JR</div><h3 className="mt-6 text-2xl font-semibold">Juan Reyes</h3><p className="mt-1 text-sm text-muted-foreground">Athlete · Creator · Entrepreneur</p><p className="mt-5 text-sm leading-6 text-muted-foreground">Everything I do, share and build — in one place.</p><div className="mt-7 grid grid-cols-2 gap-2"><div className="rounded-full bg-primary px-4 py-3 text-center text-xs font-semibold text-primary-foreground">Save contact</div><div className="rounded-full border border-border px-4 py-3 text-center text-xs font-semibold">My work</div></div><div className="mt-3 rounded-[9px] border border-border bg-card p-4"><div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-primary" /><div><p className="text-xs font-semibold">Latest reel</p><p className="text-[10px] text-muted-foreground">Watch without leaving the profile</p></div></div></div></div></div>
        </div>
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Your digital profile</p><h2 className="mt-4 text-3xl font-bold md:text-5xl">More than a card. It’s your digital presence.</h2><p className="mt-5 max-w-xl leading-7 text-muted-foreground">Update your details anytime. Share contact information, socials, portfolios, videos and payment links from one mobile-first profile.</p><ul className="mt-8 grid gap-4 sm:grid-cols-2">{["Works on modern phones", "No app required", "Real-time updates", "Tap and click insights", "Custom profile themes", "Save-to-wallet ready"].map((item) => <li key={item} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-3.5 w-3.5" /></span>{item}</li>)}</ul><Button asChild size="lg" className="mt-9"><Link to="/p/$slug" params={{ slug: "isidro" }}>View a live profile <ArrowRight /></Link></Button></div>
      </section>

      <section className="border-y border-border bg-card/55">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-destructive">At FAE Court & online</p><h2 className="mt-4 text-3xl font-bold md:text-4xl">Own the moment, courtside and onscreen.</h2><p className="mt-4 max-w-2xl text-muted-foreground">Reach local sports communities through live event coverage, courtside advertising, branded stream overlays and LinkMePH digital placements.</p></div><div className="flex flex-wrap gap-3"><Button asChild size="lg"><Link to="/live-sports">Watch live sports</Link></Button><Button asChild size="lg" variant="outline"><a href="#inquire">Advertise with us</a></Button></div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><StatsBar /><div className="mt-16 grid items-center gap-10 border border-border bg-card p-7 md:grid-cols-[1fr_auto] md:p-10"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Start with the flagship</p><h2 className="mt-3 text-3xl font-bold">Your LinkMe Card, ready from ₱{CARD_PROMO.toLocaleString()}.</h2><p className="mt-3 text-sm text-muted-foreground">Includes your NFC card, hosted digital profile and nationwide-ready ordering.</p></div><div className="md:text-right"><p className="text-sm text-muted-foreground line-through">₱{CARD_SRP.toLocaleString()}</p><p className="text-4xl font-bold text-primary">₱{CARD_PROMO.toLocaleString()}</p><Button asChild size="lg" className="mt-4"><Link to="/card">Get started <ArrowRight /></Link></Button></div></div></section>

      <section id="inquire" className="mx-auto grid max-w-7xl gap-12 px-5 pb-8 md:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start"><div className="lg:sticky lg:top-28"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Let’s connect</p><h2 className="mt-4 text-3xl font-bold md:text-5xl">Tell us what you want to put in motion.</h2><p className="mt-5 max-w-lg leading-7 text-muted-foreground">Request a digital card setup, livestream, content package or advertising placement. Our team will follow up with the right next step.</p><p className="mt-8 text-sm text-muted-foreground">Lipa City, Batangas · contact@linkmeph.com</p></div><InquiryForm /></section>
    </PageShell>
  );
}