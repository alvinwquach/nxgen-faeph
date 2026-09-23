import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import aguilaLogo from "@/assets/aguila-auto-glass.png.asset.json";
import basketballLogo from "@/assets/filamelite-basketball-logo.png.asset.json";
import arenaBackground from "@/assets/fae-arena.jpg.asset.json";
import courtPoster from "@/assets/fae-court-3d-render.webp.asset.json";
import basketballSlogan from "@/assets/earned-not-given-basketball-trim.png";
import volleyballSlogan from "@/assets/earned-not-given-volleyball-trim.png";
import faeManagementLogo from "@/assets/fae-management-logo.png.asset.json";
import volleyballLogo from "@/assets/filamelite-volleyball-logo.png.asset.json";
import picklemaniaLogo from "@/assets/picklemania.png.asset.json";
import vaLogo from "@/assets/va.png.asset.json";
import CourtExperience from "@/components/CourtExperience";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const courtPosterUrl = courtPoster.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FilAmElite Management | Earned Not Given" },
      {
        name: "description",
        content: "FilAmElite Management — sports, leagues, media, and more from Lipa City, Batangas.",
      },
      { property: "og:title", content: "FilAmElite Management | Earned Not Given" },
      { property: "og:description", content: "The official home of FilAmElite Management." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: courtPosterUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FilAmElite Management | Earned Not Given" },
      { name: "twitter:description", content: "Sports, leagues, and community from Lipa City, Batangas." },
      { name: "twitter:image", content: courtPosterUrl },
      { name: "theme-color", content: "#0a0a0a" },
    ],
  }),
  component: Index,
});

type Site = {
  name: string;
  caption: string;
  logo: string;
  slogan?: string;
  href?: string;
  logoClassName?: string;
};

const sites: Site[] = [
  {
    name: "FilAmElite Basketball",
    caption: "Training services and tournaments",
    logo: basketballLogo.url,
    slogan: basketballSlogan,
    // ponytail: vercel.app until basketball.faeph.com is detached from this project's redirect list
    href: "https://basketball-six-tau.vercel.app",
    logoClassName: "site-logo-basketball",
  },
  {
    name: "FilAmElite Volleyball",
    caption: "Training services and tournaments",
    logo: volleyballLogo.url,
    slogan: volleyballSlogan,
    // ponytail: vercel.app until volleyball.faeph.com is detached from this project's redirect list
    href: "https://volleyball-green-gamma.vercel.app",
    logoClassName: "site-logo-volleyball",
  },
  {
    name: "NXGEN Premier League",
    caption: "Next generation basketball",
    logo: "/nxgen-logo.png",
    href: "https://nxgen.faeph.com",
  },
  {
    name: "F.A.E. Bookings",
    caption: "Court rental • WiFi café • scheduling",
    logo: "/fae-logo.png",
    href: "https://bookings.faeph.com",
  },
  {
    name: "LinkMePH",
    caption: "Smart NFC cards • streaming • editing",
    logo: "/linkme-logo.png",
    href: "https://linkmeio.faeph.com",
  },
];

const sponsors = [
  { name: "Picklemania", logo: picklemaniaLogo.url },
  { name: "Aguila Auto Glass", logo: aguilaLogo.url },
  { name: "VA", logo: vaLogo.url },
];

// TODO: wire to NXGEN Supabase feed.
const courtStatus = {
  nextGame: "Saturday · 6:00 PM",
  matchup: "NXGEN Game Night",
  court: "Court open",
  note: "Open play until 5:00 PM",
};

const stats = [
  { value: 5, label: "Sites" },
  { value: 2, label: "Sports" },
  { value: 1, label: "Community" },
];

function HudCorners() {
  return <span className="hud-corners" aria-hidden="true"><i /><i /><i /><i /></span>;
}

function SiteWheel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const rotationRef = useRef(0);
  const animateToRef = useRef<(index: number) => void>(() => undefined);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const dragSurface = dragRef.current;
    if (!stage || !dragSurface) return;

    let disposed = false;
    let cleanup = () => undefined;

    void Promise.all([import("gsap"), import("gsap/Draggable")]).then(([gsapModule, draggableModule]) => {
      if (disposed) return;
      const gsap = gsapModule.gsap;
      const Draggable = draggableModule.Draggable;
      gsap.registerPlugin(Draggable);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const step = 360 / sites.length;
      let autoTimer: ReturnType<typeof gsap.delayedCall> | undefined;
      let startRotation = rotationRef.current;
      let hovered = false;
      let focusInside = false;
      let onscreen = true;

      const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
      const applyWheel = (rotation: number) => {
        rotationRef.current = rotation;
        const radius = Math.min(stage.clientWidth * 0.42, 430);
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const angle = index * step + rotation;
          const radians = (angle * Math.PI) / 180;
          const depth = Math.cos(radians);
          gsap.set(card, {
            x: Math.sin(radians) * radius,
            y: (1 - depth) * 62,
            scale: 0.58 + ((depth + 1) / 2) * 0.42,
            opacity: 0.18 + ((depth + 1) / 2) * 0.82,
            zIndex: Math.round((depth + 1) * 50),
            pointerEvents: depth > 0.55 ? "auto" : "none",
          });
          card.dataset["focused"] = depth > 0.92 ? "true" : "false";
        });
        setActiveIndex(modulo(Math.round(-rotation / step), sites.length));
      };

      const stopAuto = () => {
        autoTimer?.kill();
        autoTimer = undefined;
      };
      const scheduleAuto = () => {
        stopAuto();
        const shouldPause = reducedMotion || hovered || focusInside || !onscreen || document.hidden;
        if (shouldPause) return;
        autoTimer = gsap.delayedCall(4.5, () => {
          const currentIndex = modulo(Math.round(-rotationRef.current / step), sites.length);
          animateToRef.current(modulo(currentIndex + 1, sites.length));
        });
      };
      const animateTo = (index: number) => {
        const currentTurns = Math.round(rotationRef.current / 360);
        const candidates = [-index * step + (currentTurns - 1) * 360, -index * step + currentTurns * 360, -index * step + (currentTurns + 1) * 360];
        const target = candidates.reduce((best, value) => Math.abs(value - rotationRef.current) < Math.abs(best - rotationRef.current) ? value : best);
        gsap.to(rotationRef, {
          current: target,
          duration: reducedMotion ? 0 : 0.85,
          ease: "power3.inOut",
          onUpdate: () => applyWheel(rotationRef.current),
          onComplete: scheduleAuto,
        });
      };
      animateToRef.current = animateTo;

      const draggable = Draggable.create(dragSurface, {
        type: "x",
        trigger: stage,
        cursor: "grab",
        activeCursor: "grabbing",
        onPress() {
          stopAuto();
          startRotation = rotationRef.current;
          gsap.killTweensOf(rotationRef);
        },
        onDrag() {
          applyWheel(startRotation + Number(this["x"] ?? 0) * 0.24);
        },
        onRelease() {
          gsap.set(this["target"], { x: 0 });
          animateTo(modulo(Math.round(-rotationRef.current / step), sites.length));
        },
      })[0];

      const resizeObserver = new ResizeObserver(() => applyWheel(rotationRef.current));
      resizeObserver.observe(stage);
      const intersectionObserver = new IntersectionObserver(([entry]) => {
        onscreen = entry?.isIntersecting ?? false;
        scheduleAuto();
      }, { threshold: 0.25 });
      intersectionObserver.observe(stage);
      const onPointerEnter = () => { hovered = true; scheduleAuto(); };
      const onPointerLeave = () => { hovered = false; scheduleAuto(); };
      const onFocusIn = () => { focusInside = true; scheduleAuto(); };
      const onFocusOut = (event: FocusEvent) => {
        focusInside = stage.contains(event.relatedTarget as Node);
        scheduleAuto();
      };
      const onVisibilityChange = () => scheduleAuto();
      stage.addEventListener("pointerenter", onPointerEnter);
      stage.addEventListener("pointerleave", onPointerLeave);
      stage.addEventListener("focusin", onFocusIn);
      stage.addEventListener("focusout", onFocusOut);
      document.addEventListener("visibilitychange", onVisibilityChange);
      applyWheel(0);
      scheduleAuto();

      cleanup = () => {
        stopAuto();
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        stage.removeEventListener("pointerenter", onPointerEnter);
        stage.removeEventListener("pointerleave", onPointerLeave);
        stage.removeEventListener("focusin", onFocusIn);
        stage.removeEventListener("focusout", onFocusOut);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        draggable?.kill();
        gsap.killTweensOf(rotationRef);
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="wheel-wrap">
      <div ref={stageRef} className="wheel-stage" aria-roledescription="carousel" aria-label="FilAmElite sites">
        <div ref={dragRef} className="wheel-drag-surface" aria-hidden="true" />
        <div className="wheel-orbit" aria-hidden="true" />
        {sites.map((site, index) => {
          const content = (
            <>
              <div className="site-card-visual">
                <img src={site.logo} alt="" className={`site-card-logo ${site.logoClassName ?? ""}`} draggable={false} />
                {site.slogan ? <img src={site.slogan} alt="Earned Not Given" className="site-card-slogan" draggable={false} /> : null}
              </div>
              <div className="site-card-copy">
                <span className="site-card-number">0{index + 1}</span>
                <div>
                  <h3>{site.name}</h3>
                  <p>{site.caption}</p>
                </div>
                {site.href ? <ArrowUpRight aria-hidden="true" /> : <span className="site-card-status">FAE</span>}
              </div>
              <HudCorners />
            </>
          );

          return site.href ? (
            <a
              key={site.name}
              ref={(element) => { cardRefs.current[index] = element; }}
              href={site.href}
              target="_blank"
              rel="noreferrer"
              className="site-wheel-card"
              aria-label={`Visit ${site.name}`}
              tabIndex={activeIndex === index ? 0 : -1}
            >
              {content}
            </a>
          ) : (
            <article key={site.name} ref={(element) => { cardRefs.current[index] = element; }} className="site-wheel-card">
              {content}
            </article>
          );
        })}
      </div>

      <div className="wheel-controls" aria-label="Site wheel controls">
        <div className="wheel-progress" role="tablist" aria-label="Choose site">
          <span className="wheel-progress-core" aria-hidden="true">0{activeIndex + 1}<small>/0{sites.length}</small></span>
          {sites.map((site, index) => (
            <button
              key={site.name}
              type="button"
              role="tab"
              aria-selected={activeIndex === index}
              aria-label={site.name}
              className={`wheel-progress-segment segment-${index + 1}`}
              onClick={() => animateToRef.current(index)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                const direction = event.key === "ArrowRight" ? 1 : -1;
                animateToRef.current((activeIndex + direction + sites.length) % sites.length);
              }}
            />
          ))}
        </div>
      </div>
      <p className="wheel-hint">Drag to spin · Arrow keys to browse</p>
    </div>
  );
}

const benefits = [
  "Logo on our sponsor wall",
  "Event & court signage",
  "Digital shout-outs across FAE channels",
];

function SponsorInquiry() {
  const [submitting, setSubmitting] = useState(false);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    const { error } = await supabase.from("sponsor_inquiries").insert({
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not send your inquiry", {
        description: "Email filamelitebasketball@gmail.com instead.",
      });
      return;
    }
    form.reset();
    toast.success("Inquiry sent", { description: "We’ll be in touch soon." });
  }

  return (
    <section className="sponsor-with-us reveal-section" aria-labelledby="sponsor-with-us-heading">
      <div className="sponsor-pitch">
        <p>Partner with FAE</p>
        <h2 id="sponsor-with-us-heading">Sponsor with us.</h2>
        <p className="sponsor-intro">Back local sport. Grow your brand.</p>
        <Button asChild variant="premium" size="lg"><a href="#sponsor-form" data-magnetic>Become a sponsor</a></Button>
        <a className="sponsor-email" href="mailto:filamelitebasketball@gmail.com">filamelitebasketball@gmail.com</a>
      </div>
      <div className="benefit-grid">
        {benefits.map((benefit, index) => (
          <article className="benefit-card" key={benefit}><span>0{index + 1}</span><h3>{benefit}</h3></article>
        ))}
      </div>
      <form id="sponsor-form" className="sponsor-form" onSubmit={submitInquiry}>
        <div className="form-heading"><p>Sponsorship inquiry</p><h3>Start a conversation.</h3></div>
        <div className="form-grid">
          <div className="form-field"><Label htmlFor="sponsor-name">Name</Label><Input id="sponsor-name" name="name" minLength={2} maxLength={120} required autoComplete="name" /></div>
          <div className="form-field"><Label htmlFor="sponsor-company">Company</Label><Input id="sponsor-company" name="company" minLength={2} maxLength={160} required autoComplete="organization" /></div>
          <div className="form-field form-field-wide"><Label htmlFor="sponsor-email">Email</Label><Input id="sponsor-email" name="email" type="email" maxLength={254} required autoComplete="email" /></div>
          <div className="form-field form-field-wide"><Label htmlFor="sponsor-message">Message</Label><Textarea id="sponsor-message" name="message" minLength={10} maxLength={2000} required rows={5} /></div>
        </div>
        <Button type="submit" variant="premium" size="lg" disabled={submitting} data-magnetic>{submitting ? "Sending…" : "Send inquiry"}</Button>
      </form>
    </section>
  );
}

function IntroReveal() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const key = "fae-intro-seen";
    if (window.sessionStorage.getItem(key)) {
      setVisible(false);
      return;
    }
    window.sessionStorage.setItem(key, "true");
    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;
  return (
    <div className="intro-reveal" aria-hidden="true">
      <strong>FAE</strong>
      <span>FilAmElite</span>
    </div>
  );
}

function StatsStrip() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCounts(stats.map((stat) => stat.value));
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 900, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCounts(stats.map((stat) => Math.round(stat.value * eased)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="stats-strip" aria-label="FilAmElite at a glance">
      {stats.map((stat, index) => <div key={stat.label}><strong>{counts[index]}</strong><span>{stat.label}</span></div>)}
    </div>
  );
}

function CourtSection() {
  return (
    <section id="court" className="court-section reveal-section" aria-labelledby="court-heading">
      <div className="court-heading">
        <p>Built for the work</p>
        <h2 id="court-heading">Our Court.</h2>
        <span>Built to compete.</span>
      </div>
      <div className="court-experience-frame">
        <CourtExperience />
        <HudCorners />
      </div>
    </section>
  );
}

function Index() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".reveal-section"));
    if (reducedMotion) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    let disposed = false;
    let lenisCleanup = () => undefined;
    void Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(([lenisModule, gsapModule, scrollModule]) => {
      if (disposed) return;
      const Lenis = lenisModule.default;
      const gsap = gsapModule.gsap;
      const ScrollTrigger = scrollModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
      const update = (time: number) => {
        lenis.raf(time * 1000);
        ScrollTrigger.update();
      };
      gsap.ticker.add(update);
      gsap.ticker.lagSmoothing(0);
      const hero = document.querySelector<HTMLElement>(".hero-shell");
      if (hero) gsap.to(hero, { opacity: 0.18, ease: "none", scrollTrigger: { trigger: hero, start: "65% top", end: "bottom top", scrub: true } });
      const courtStill = document.querySelector<HTMLElement>(".court-still");
      if (courtStill) gsap.fromTo(courtStill, { opacity: 0, y: 54 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: courtStill, start: "top 92%", end: "top 58%", scrub: 0.7 } });
      lenisCleanup = () => {
        gsap.ticker.remove(update);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        lenis.destroy();
      };
    });
    return () => { disposed = true; lenisCleanup(); };
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cursor = document.querySelector<HTMLElement>(".silver-cursor");
    if (!cursor) return;
    const move = (event: PointerEvent) => {
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
    };
    const interactive = Array.from(document.querySelectorAll<HTMLElement>("a, button, .site-wheel-card"));
    const enter = () => cursor.classList.add("is-active");
    const leave = () => cursor.classList.remove("is-active");
    const magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const magnetMove = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      target.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * 0.14}px, ${(event.clientY - rect.top - rect.height / 2) * 0.14}px)`;
    };
    const magnetLeave = (event: PointerEvent) => { (event.currentTarget as HTMLElement).style.transform = ""; };
    window.addEventListener("pointermove", move);
    interactive.forEach((element) => { element.addEventListener("pointerenter", enter); element.addEventListener("pointerleave", leave); });
    magnets.forEach((element) => { element.addEventListener("pointermove", magnetMove); element.addEventListener("pointerleave", magnetLeave); });
    return () => {
      window.removeEventListener("pointermove", move);
      interactive.forEach((element) => { element.removeEventListener("pointerenter", enter); element.removeEventListener("pointerleave", leave); });
      magnets.forEach((element) => { element.removeEventListener("pointermove", magnetMove); element.removeEventListener("pointerleave", magnetLeave); });
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <IntroReveal />
      <div className="premium-backdrop" aria-hidden="true"><img src={arenaBackground.url} alt="" /></div>
      <div className="silver-cursor" aria-hidden="true" />
      <header className="site-header">
        <a href="#top" className="wordmark" aria-label="FilAmElite Management home">
          <img src={faeManagementLogo.url} alt="" aria-hidden="true" />
          <small>FilAmElite Management</small>
        </a>
        <a href="#sites" className="header-link">Sites <ArrowDown aria-hidden="true" /></a>
      </header>

      <section id="top" className="hero-shell">
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-lines" aria-hidden="true" />
        <div className="hero-core">
          <img className="hero-brand-logo" src={faeManagementLogo.url} alt="FilAmElite Management" />
          <p className="hero-label">FilAmElite Management</p>
          <h1>Earned<br /><span>Not Given.</span></h1>
          <p className="hero-place">Lipa City · Batangas</p>
        </div>
        <a href="#sites" className="hero-scroll" aria-label="Browse FilAmElite sites"><ArrowDown /></a>
      </section>

      <section className="hub-overview reveal-section" aria-label="Latest FilAmElite information">
        <StatsStrip />
        <article className="status-card">
          <HudCorners />
          <div><span>Next game</span><strong>{courtStatus.matchup}</strong><small>{courtStatus.nextGame}</small></div>
          <div><span>Court status</span><strong className="status-open">{courtStatus.court}</strong><small>{courtStatus.note}</small></div>
        </article>
      </section>

      <section id="sites" className="showcase-section reveal-section" aria-labelledby="sites-heading">
        <div className="section-heading">
          <p>FAE Network</p>
          <h2 id="sites-heading">Our sites.</h2>
        </div>
        <SiteWheel />
      </section>

      <CourtSection />

      <section className="sponsors-section reveal-section" aria-labelledby="sponsors-heading">
        <div className="section-heading sponsors-heading">
          <p>Partners</p>
          <h2 id="sponsors-heading">Sponsors.</h2>
        </div>
        <div className="sponsor-grid">
          {sponsors.map((sponsor) => (
            <div className="sponsor-logo" key={sponsor.name}>
              <img src={sponsor.logo} alt={sponsor.name} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <SponsorInquiry />

      <footer className="site-footer">
        <div>
          <strong>FilAmElite Management</strong>
          <span>Earned Not Given</span>
        </div>
        <div className="footer-contact">
          <a href="mailto:filamelitebasketball@gmail.com"><Mail aria-hidden="true" /> filamelitebasketball@gmail.com</a>
          <span><MapPin aria-hidden="true" /> Lipa City, Batangas</span>
        </div>
      </footer>
    </main>
  );
}