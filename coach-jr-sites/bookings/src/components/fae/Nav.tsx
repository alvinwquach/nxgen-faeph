import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";
import faeLogo from "@/assets/fae-logo.png.asset.json";

const LINKS = [
  { href: "/#court-rental", label: "Court Rental" },
  { href: "/schedule", label: "Book a Slot" },
  { href: "/#internet-data", label: "Internet & Data" },
  { href: "/#how-it-works", label: "How it Works" },
] as const;

export function Nav() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const displayName =
    (user?.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0] ??
    (user?.user_metadata?.["first_name"] as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Member";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] transition-all duration-300",
        scrolled ? "border-b border-border bg-background/85 backdrop-blur-xl" : "bg-background/10 backdrop-blur-sm",
      )}
    >
      {/* scroll progress */}
      <div className="absolute left-0 top-0 h-[2px] bg-gold transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />

      <div className={cn("mx-auto flex max-w-7xl items-center justify-between px-4 transition-[height] duration-300 sm:px-6", scrolled ? "h-14" : "h-20")}>
        <Link to="/" className="nav-enter group flex items-center gap-3" aria-label="FAE Bookings home">
          <span className="nav-logo-mark flex h-11 w-14 items-center justify-center p-1">
            <img src={faeLogo.url} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-extrabold text-foreground">FAE Bookings</span>
            <span className="mt-1 block text-[9px] uppercase text-muted-foreground">Lipa City · Batangas</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link nav-enter text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground"
              style={{ animationDelay: `${80 + index * 45}ms` }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-enter hidden items-center gap-2 lg:flex" style={{ animationDelay: "380ms" }}>
          {user ? <ButtonLink to="/account" variant="ghost" size="sm"><Icon name="user" size={14} />{displayName}</ButtonLink> : null}
          <ButtonLink to="/schedule" variant="gold" size="sm">Book now</ButtonLink>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div className="fade-in fixed inset-0 z-[70] flex flex-col bg-background/98 backdrop-blur-md lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-display text-[15px] font-extrabold tracking-wide text-foreground">FAE BOOKINGS</span>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2 text-foreground"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-8" aria-label="Mobile">
            {LINKS.map((link, i) => (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.assign(link.href);
                }}
                className="mobile-nav-item border-b border-border py-4 text-left font-display text-3xl font-extrabold uppercase tracking-wide text-foreground transition-colors hover:text-gold"
                style={{ animationDelay: `${80 + i * 45}ms` }}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex gap-3 px-8 pb-10">
            {user ? <ButtonLink to="/account" variant="ghost" className="flex-1" onClick={() => setMenuOpen(false)}>{displayName}</ButtonLink> : <ButtonLink to="/auth" variant="ghost" className="flex-1" onClick={() => setMenuOpen(false)}>Sign in</ButtonLink>}
            <ButtonLink to="/schedule" variant="gold" className="flex-1" onClick={() => setMenuOpen(false)}>Book now</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
