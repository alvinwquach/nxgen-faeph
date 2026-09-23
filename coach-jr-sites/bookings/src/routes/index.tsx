import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/fae/Footer";
import { HomeBooking } from "@/components/fae/HomeBooking";
import { Icon } from "@/components/fae/Icon";
import { InView } from "@/components/fae/Motion";
import { TiltCard } from "@/components/fae/TiltCard";
import { MEMBERSHIP } from "@/lib/constants";
import nxgenLogo from "@/assets/partners/nxgen-logo.png.asset.json";
import linkmeLogo from "@/assets/partners/linkme-logo.png.asset.json";
import picklemaniaLogo from "@/assets/partners/sponsor-picklemania.png.asset.json";
import aguilaLogo from "@/assets/partners/sponsor-aguila.png.asset.json";
import vaLogo from "@/assets/partners/sponsor-va.png.asset.json";
import volleyballLogo from "@/assets/partners/sponsor-filam-volleyball.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FAE Bookings — Court Rental & Internet Services in Lipa City" },
      {
        name: "description",
        content: "Reserve basketball, volleyball and pickleball courts by the hour, with fast WiFi and data services at Fil-Am Elite Management in Lipa City.",
      },
      { property: "og:title", content: "FAE Bookings — Book the court. Stay connected." },
      {
        property: "og:description",
        content: "Live hourly court availability plus fiber-backed internet and data services in Lipa City, Batangas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const COURTS: ReadonlyArray<{
  sport: "Basketball" | "Volleyball" | "Pickleball";
  icon: string;
  memberPrice: string;
  nonMemberPrice: string;
  description: string;
  className: string;
  tag?: string;
}> = [
  {
    sport: "Basketball",
    icon: "basketball",
    memberPrice: "₱1,000/hr",
    nonMemberPrice: "₱1,200/hr",
    description: "Full-court runs, team practice and private sessions on indoor hardwood.",
    className: "court-card-basketball",
    tag: "Popular",
  },
  {
    sport: "Volleyball",
    icon: "volleyball",
    memberPrice: "₱1,000/hr",
    nonMemberPrice: "₱1,200/hr",
    description: "Regulation indoor setup for training, friendly matches and organized play.",
    className: "court-card-volleyball",
  },
  {
    sport: "Pickleball",
    icon: "pickleball",
    memberPrice: "₱500/hr",
    nonMemberPrice: "₱700/hr",
    description: "Dedicated courts with permanent nets, with paddles and balls available on-site.",
    className: "court-card-pickleball",
    tag: "New",
  },
] as const;

const PARTNERS = [
  { name: "NXGEN Premier League", image: nxgenLogo.url },
  { name: "LinkMePH", image: linkmeLogo.url },
  { name: "Picklemania", image: picklemaniaLogo.url },
  { name: "Aguila Auto Glass", image: aguilaLogo.url },
  { name: "VA", image: vaLogo.url },
  { name: "Fil-Am Elite Volleyball", image: volleyballLogo.url },
] as const;

function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Hero />
      <Facts />
      <CourtRental />
      <LiveBooking />
      <InternetData />
      <HowItWorks />
      <CtaBand />
      <Partners />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[min(900px,100svh)] items-end overflow-hidden pt-24" aria-labelledby="home-title">
      <video
        className="absolute inset-0 z-[1] h-full w-full object-cover"
        src="/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-bg-poster.jpg"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background via-background/85 to-background/25" aria-hidden="true" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background via-background/20 to-background/55" aria-hidden="true" />
      <div className="hero-grid absolute inset-0 z-[3] opacity-30" aria-hidden="true" />
      <div className="hero-spotlight absolute inset-0 z-[3]" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:pb-24">
        <InView delay={60}>
          <h1 id="home-title" className="max-w-5xl text-5xl font-extrabold leading-[0.94] text-foreground sm:text-7xl lg:text-8xl">
            Book the court.
            <span className="block bg-gradient-to-r from-gold-light via-gold to-gold-light bg-clip-text text-transparent">Stay connected.</span>
          </h1>
        </InView>
        <InView delay={120}>
          <p className="mt-7 max-w-2xl text-base font-light leading-7 text-foreground/75 sm:text-lg">
            Reserve basketball, volleyball and pickleball courts by the hour, plus fast in-house internet and data services.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/schedule" className="btn-gold inline-flex min-h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold">
              Reserve a court <Icon name="arrow-right" size={16} />
            </Link>
            <a href="#internet-data" className="btn-ghost inline-flex min-h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold">
              Internet &amp; data <Icon name="wifi" size={16} />
            </a>
          </div>
        </InView>

      </div>
    </section>
  );
}

function Facts() {
  const facts = ["FAE Court · Lipa City, Batangas", "Instant online booking", "Fast WiFi & data on-site"];
  return (
    <div className="border-y border-border bg-surface-1">
      <div className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {facts.map((fact) => <p key={fact} className="border-border py-4 text-center text-xs font-semibold text-muted-foreground sm:border-r sm:last:border-r-0">{fact}</p>)}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <InView>
      <p className="text-xs font-bold uppercase text-gold">{eyebrow}</p>
      <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">{title}</h2>
      {copy ? <p className="mt-5 max-w-2xl text-base font-light leading-7 text-muted-foreground">{copy}</p> : null}
    </InView>
  );
}

function CourtRental() {
  return (
    <section id="court-rental" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow="Court rental" title="Three sports. One easy booking." copy="Members receive the best hourly rate. Non-members add ₱200 per hour." />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {COURTS.map((court, index) => (
          <InView key={court.sport} delay={index * 80}>
            <TiltCard className={`court-service-card ${court.className} h-full rounded-[18px] border border-border bg-card p-7`}>
              <div className="flex items-start justify-between gap-4">
                <span className="court-icon flex h-12 w-12 items-center justify-center rounded-xl"><Icon name={court.icon} size={23} /></span>
                {court.tag ? <span className="rounded-full border border-current px-2.5 py-1 text-[10px] font-bold uppercase">{court.tag}</span> : null}
              </div>
              <h3 className="mt-10 text-2xl font-bold text-foreground">{court.sport}</h3>
              <p className="mt-3 min-h-20 text-sm font-light leading-6 text-muted-foreground">{court.description}</p>
              <div className="mt-8 flex items-end justify-between gap-4 border-t border-border pt-6">
                <div>
                  <strong className="court-price text-2xl">{court.memberPrice}</strong>
                  <p className="mt-1 text-[10px] font-semibold uppercase text-gold">Member rate</p>
                  <p className="mt-2 text-xs text-muted-foreground">Non-member {court.nonMemberPrice}</p>
                </div>
                <Link to="/schedule" aria-label={`Book ${court.sport}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-gold hover:text-gold">
                  <Icon name="arrow-right" size={17} />
                </Link>
              </div>
            </TiltCard>
          </InView>
        ))}
      </div>
      <InView delay={120} className="mt-8">
        <div className="flex flex-col justify-between gap-4 border-y border-goldline py-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-foreground">FAE Membership · {`₱${MEMBERSHIP.fee.toLocaleString("en-PH")}`}/year</p>
            <p className="mt-1 text-sm text-muted-foreground">Unlock member court rates, plus your RFID band and membership card.</p>
          </div>
          <Link to="/auth" search={{ returnTo: "/book" }} className="inline-flex items-center gap-2 text-sm font-bold text-gold">
            Join and book <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </InView>
    </section>
  );
}

function LiveBooking() {
  return (
    <section id="live-booking" className="border-y border-border bg-surface-1 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <SectionHeading eyebrow="Live booking" title="See the open hours. Take yours." copy="Availability and rates come directly from the FAE booking desk and update across devices." />
          <Link to="/schedule" className="inline-flex items-center gap-2 text-sm font-bold text-gold">View full schedule <Icon name="arrow-right" size={15} /></Link>
        </div>
        <InView delay={80} className="mt-12"><HomeBooking /></InView>
      </div>
    </section>
  );
}

function InternetData() {
  const features = [
    { icon: "wifi", title: "High-Speed WiFi", copy: "Fiber-backed hourly, day and event passes for players, guests and organizers." },
    { icon: "phone", title: "Data & Load", copy: "Prepaid mobile data and load top-ups for all networks, available at the FAE counter." },
    { icon: "play", title: "Stream & Upload", copy: "Reliable bandwidth for live-streaming games and uploading highlights while you are on-site." },
  ];
  return (
    <section id="internet-data" className="internet-section relative overflow-hidden py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading eyebrow="Internet & data" title="Fast on court. Faster online." copy="Stay connected before, during and after the game with flexible connectivity from the front desk." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <InView key={feature.title} delay={index * 80} className="h-full">
              <article className="glass-panel h-full rounded-[18px] border border-border p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-goldline bg-gold/10 text-gold"><Icon name={feature.icon} size={22} /></span>
                <h3 className="mt-8 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm font-light leading-6 text-muted-foreground">{feature.copy}</p>
              </article>
            </InView>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Pick your court", copy: "Choose basketball, volleyball or pickleball." },
    { title: "Grab an open hour", copy: "Live availability shows exactly what is free." },
    { title: "Show up & play", copy: "Your reservation is synced with the front desk." },
  ];
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading eyebrow="How it works" title="From screen to court in three moves." />
      <ol className="mt-14 grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <InView key={step.title} delay={index * 80} as="li">
            <span className="text-6xl font-light text-gold/35">0{index + 1}</span>
            <h3 className="mt-5 text-xl font-bold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm font-light leading-6 text-muted-foreground">{step.copy}</p>
          </InView>
        ))}
      </ol>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <InView className="mx-auto max-w-7xl">
        <div className="cta-band rounded-[18px] border border-goldline px-6 py-12 sm:px-12 sm:py-16">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div><p className="text-xs font-bold uppercase text-gold">Ready when you are</p><h2 className="mt-3 text-3xl font-bold text-foreground sm:text-5xl">Your court is one tap away.</h2></div>
            <div className="flex flex-wrap gap-3">
              <Link to="/schedule" className="btn-gold inline-flex min-h-12 items-center rounded-xl px-6 text-sm font-bold">Book now</Link>
              <a href="#live-booking" className="btn-ghost inline-flex min-h-12 items-center rounded-xl px-6 text-sm font-bold">Check availability</a>
            </div>
          </div>
        </div>
      </InView>
    </section>
  );
}

function Partners() {
  return (
    <section className="border-t border-border bg-surface-1 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <InView>
          <p className="text-xs font-bold uppercase text-gold">FAE network</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">Partners &amp; Sponsors</h2>
          <p className="mt-4 max-w-3xl text-sm font-light leading-6 text-muted-foreground">Shared across the FAE family — backed alongside NXGEN Premier League and the wider Fil-Am Elite network.</p>
        </InView>
      </div>
      <div className="partners-marquee mt-10 overflow-hidden">
        <div className="partners-track flex w-max gap-4 px-4">
          {[...PARTNERS, ...PARTNERS].map((partner, index) => (
            <div key={`${partner.name}-${index}`} aria-hidden={index >= PARTNERS.length} className="flex h-32 w-56 shrink-0 items-center justify-center rounded-[16px] bg-foreground/[0.04] p-5 sm:w-64">
              <img src={partner.image} alt={index < PARTNERS.length ? partner.name : ""} className="max-h-full max-w-full object-contain" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}