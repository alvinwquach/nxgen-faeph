# Premium Public Homepage Redesign

## Goal
Turn the public homepage into a cinematic court-rental and connectivity marketing experience while preserving authentication, the real database-backed booking flow, member pages, and admin tools.

## Homepage and navigation
- Replace the current homepage composition with the requested sequence: shrinking glass navigation, video-led hero, facts strip, court cards, live booking widget, internet/data features, three-step guide, call-to-action band, partner marquee, and footer.
- Use the supplied Fil-Am Elite Management logo in light logo chips in the navigation and footer, and create its required favicon copy.
- Limit public service messaging to court rental and internet/data services; keep Teams absent everywhere.
- Update homepage title and social descriptions to match court rental and internet/data services in Lipa City.

## Real live booking widget
- Extract/reuse the existing court booking selection logic rather than creating a second schedule.
- Let visitors select sport, surface where needed, one of the next seven dates, and one or more available one-hour slots.
- Read availability and current court rates from the existing database functions, disable and strike occupied/past hours, calculate the live total, preserve selections through sign-in, and submit through the existing double-booking-protected booking function.
- Continue to keep the full `/book` experience available; the homepage widget is a streamlined entry into that same booking workflow.
- Show the requested card prices as explicitly marked sample prices only; the live widget always shows the database rate.

## Visual system and motion
- Refine semantic theme tokens to charcoal `#0b0b0e`, panel `#131318`, gold `#C9A227`, light gold `#E9C65A`, and off-white `#F6F4EC`, with Outfit throughout and 16–18px feature-card corners.
- Keep `/hero-bg.mp4` full-bleed with its poster/fallback and strong overlays, plus a subtle spotlight and grid.
- Add tasteful scroll reveals, hero count-ups, green availability pulse, cursor-follow court-card glow/lift, sponsor marquee pause-on-hover, reduced-motion static behavior, and shrinking navigation.
- Keep mobile gutters at 16px, stack content cleanly, and prevent horizontal overflow.

## Partners and footer
- Store the seven supplied logos through the project asset flow and render them in the exact requested order on light tiles.
- Link the section copy to the FAE family without introducing Teams or restoring removed features.
- Rebuild the footer with the supplied logo, requested description, Book / Services / Contact columns, and 2026 FAE Hub attribution.

## Technical boundaries
- No database schema changes are required; existing tables, row-level access, migrations, server functions, auth, and admin behavior remain intact.
- Keep backend configuration environment-driven and portable to Vercel plus an external Supabase project.
- Keep uploaded binary media out of source control except the square favicon required in `public/`.

## Verification
- Confirm live database availability, rate calculation, sign-in handoff, and booking confirmation still work.
- Verify desktop, phone, keyboard focus, reduced motion, marquee behavior, video fallback, metadata, missing Teams links, console/runtime errors, and final build health.
