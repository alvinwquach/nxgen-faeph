import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/card", label: "LinkMe Card" },
  { to: "/live-sports", label: "Live Sports" },
  { to: "/creative-services", label: "Creative Services" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 md:flex md:px-8">
        <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Get your card</Link>
          </Button>
        </div>

        <Button
          variant="outline"
          size="icon"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="h-11 w-11 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-[9px] px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" onClick={() => setOpen(false)}>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild onClick={() => setOpen(false)}>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
