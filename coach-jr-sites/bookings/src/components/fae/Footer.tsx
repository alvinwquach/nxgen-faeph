import { Link } from "@tanstack/react-router";
import { FAE_CONTACT, FAE_SOCIALS } from "@/lib/constants";
import { Icon } from "./Icon";
import faeLogo from "@/assets/fae-logo.png.asset.json";

export function Footer() {
  return (
    <footer className="border-t border-goldline bg-surface-1">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-20 items-center justify-center p-1">
              <img src={faeLogo.url} alt="Fil-Am Elite Management" className="h-full w-full object-contain" />
            </span>
            <span className="text-[15px] font-extrabold text-foreground">FAE Bookings</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Court rental and internet &amp; data services by Fil-Am Elite Management. Lipa City, Batangas.
          </p>
        </div>

        <FooterCol
          title="Book"
          links={[
            { label: "Book a court", to: "/schedule" },
            { label: "Live schedule", to: "/schedule" },
            { label: "My account", to: "/account" },
          ]}
        />
        <FooterCol
          title="Services"
          links={[
            { label: "Court rental", href: "/#court-rental" },
            { label: "Internet & data", href: "/#internet-data" },
            { label: "How it works", href: "/#how-it-works" },
          ]}
        />
        <FooterCol
          title="Contact"
          links={[
            { label: FAE_CONTACT.phone, href: `tel:${FAE_CONTACT.phone.replace(/\s/g, "")}` },
            { label: FAE_CONTACT.email, href: `mailto:${FAE_CONTACT.email}` },
            { label: "Open in Google Maps", href: FAE_CONTACT.mapsUrl },
          ]}
        />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 sm:px-6">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            © 2026 Fil-Am Elite Management · Part of the FAE Hub · faeph.com
          </p>
          <div className="flex items-center gap-4">
            {FAE_SOCIALS.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground transition-colors hover:text-gold"
                aria-label={s.platform}
              >
                <Icon name={s.icon} size={18} strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to?: string; href?: string }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.href ? (
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link to={link.to ?? "/"} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
