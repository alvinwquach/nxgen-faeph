# Team Payaman Pickleball

Client work for **Playhouse Pickle** (Team Payaman), 3 indoor courts in Molino, Bacoor, Cavite.
Pitch: an owned customer portal and database (lead capture, 30-day footage grace period then
keep-forever, email marketing) plus instant highlights (camera product name TBD, shown as "Your Brand") and full-game coverage.

| Folder | What it is |
|---|---|
| `site/` | Clickable demo site, live at **https://sample.faeph.com**. Static HTML + Tailwind CDN + GSAP. Booking, player portal, WiFi, footage + QR export, owner console. |
| `dinkcut-io/` | **DinkCut IO v3.5** desktop app (Python, © LINKMEIO), formerly Highlight Studio IO. Finds rallies by paddle-pop sound + court motion (soft pops catch the serve), exports one highlights video with every rally, the longest rally and the full game, and shares them by QR over the venue WiFi. Folders: `source/`, `trial/` (client trial kit), `test-scoreboard/` (parked scoreboard); exes are built into `product/` and `trial/`. See its README. |

**Owner console demo login:** `jhoopin3@gmail.com`, any password (client-side demo gate only; real
auth comes with Supabase after sign-off).

Demo only: no backend, no real customer data. Snapshot copied from Coach Jr's own repo
(`fae-software`); not synced.
