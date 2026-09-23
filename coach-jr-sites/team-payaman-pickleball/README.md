# Team Payaman Pickleball

Client work for **Playhouse Pickle** (Team Payaman), 3 indoor courts in Molino, Bacoor, Cavite.
Pitch: an owned customer portal and database (lead capture, 30-day footage grace period then
keep-forever, email marketing) plus PickleCam instant highlights and full-game coverage.

| Folder | What it is |
|---|---|
| `site/` | Clickable demo site, live at **https://sample.faeph.com**. Static HTML + Tailwind CDN + GSAP. Booking, player portal, WiFi, footage + QR export, owner console. |
| `highlight-cutter/` | **PickleCam Highlight Cutter** desktop app (Python). Finds rallies by paddle-pop sound + court motion, exports a highlight reel, per-rally clips and the full game, and shares them by QR over the venue WiFi. See its README. |

**Owner console demo login:** `jhoopin3@gmail.com`, any password (client-side demo gate only; real
auth comes with Supabase after sign-off).

Demo only: no backend, no real customer data. Snapshot copied from Coach Jr's own repo
(`fae-software`); not synced.
