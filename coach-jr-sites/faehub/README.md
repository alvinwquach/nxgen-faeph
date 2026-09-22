# F.A.E. Hub

Build faeph.com — the premium landing HUB for F.A.E. (FilAm Elite), a sports + services company in Lipa City, Batangas. It is a single dark, animated public landing page (no login) whose job is to link out to all F.A.E. sites on their subdomains.

Design system — match "NXGEN Premier League":
- Colors: gold #C9A227 accent on deep charcoal — #0d0d10 page background, #141419 surfaces/cards, near-white text. Premium, modern, athletic.
- Typography: "Outfit" font family (Google Fonts), bold tight headings.
- Motion (respect prefers-reduced-motion): a spotlight/glow hero featuring the F.A.E. name and tagline, tilt + shine interactive link cards, scroll-reveal as sections enter view, a subtle animated background, and smooth hovers.

Layout — a hero, then category sections of link cards. Each card = title, one-line description, and a button linking to the URL; show a "Coming soon" pill and disabled button for the ones not ready yet:
- Sports & Leagues: "NXGEN Premier League" → https://nxgen.faeph.com (LIVE); "FAE Basketball" (coming soon); "FAE Volleyball" (coming soon).
- Bookings & Management: "Internet Café & Court Bookings" → https://bookings.faeph.com (LIVE); "FAE Events" (coming soon).
- Digital Services: "LinkMePH — smart NFC cards & live sports streaming" → https://linkme.faeph.com (coming soon).
- Footer/contact: email filamelitebasketball@gmail.com, Lipa City, Batangas, plus a small "Beta" badge in the hero.

Fully responsive/mobile-first. This is a marketing landing hub only — keep it lightweight and fast.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/81b3dcf5-15bb-4808-be4d-f16a0239d4bb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
