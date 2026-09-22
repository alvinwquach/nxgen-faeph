import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";

import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card/55">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 md:px-8 md:py-16">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
            One tap. All of you. Smart digital cards, live experiences, creative content and advertising built in the Philippines.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Founded 2022 in Lipa City, Batangas, Philippines by Isidro V. Raymundo Jr.
          </p>
          <div className="mt-6 flex gap-2">
            <a href="https://www.facebook.com/linkmeph" target="_blank" rel="noreferrer" aria-label="LinkMePH on Facebook" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Facebook className="h-4 w-4" /></a>
            <a href="https://www.instagram.com/linkmeph" target="_blank" rel="noreferrer" aria-label="LinkMePH on Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/card" className="hover:text-foreground">LinkMe Card</Link></li>
            <li><Link to="/live-sports" className="hover:text-foreground">Live Sports</Link></li>
            <li><Link to="/creative-services" className="hover:text-foreground">Creative Services</Link></li>
            <li><Link to="/my-passes" className="hover:text-foreground">My Passes</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Account</Link></li>
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">F.A.E. family</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li><a href="https://faeph.com" target="_blank" rel="noreferrer" className="hover:text-foreground">faeph.com</a></li>
            <li><a href="https://faeph.com" target="_blank" rel="noreferrer" className="hover:text-foreground">NXGEN</a></li>
            <li><a href="https://faeph.com" target="_blank" rel="noreferrer" className="hover:text-foreground">FAE Bookings</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> contact@linkmeph.com</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Lipa City, Batangas</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} LinkMePH. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
