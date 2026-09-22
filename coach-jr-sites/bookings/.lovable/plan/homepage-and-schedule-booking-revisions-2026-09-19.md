# Homepage and Schedule Booking Revisions

## Goal
Simplify the homepage hero, replace the homepage time grid with a tactile vertical hour wheel, present transparent branding cleanly, and make `/schedule` the public court availability and hourly booking flow.

## Homepage
- Remove the open-status pill and the entire four-item stats row, leaving more space around the headline and calls to action.
- Point the hero “Reserve a court,” navigation “Book a Slot,” court-card booking links, and relevant booking calls to action to `/schedule`.
- Keep the existing sport and seven-day selectors in the live booking area.
- Replace only its time grid with a fixed-height vertical scroll wheel: one-hour rows, center selection band, snap/momentum scrolling, faded neighbors, keyboard/click support, and unavailable or past hours visibly disabled.
- Keep the selected hour tied to live availability, live rates, authentication handoff, and the existing booking confirmation logic.

## Logos
- Remove light/white backgrounds from the navigation and footer logo containers.
- Render partner and sponsor PNGs directly over the dark section using only subtle translucent dark spacing panels where necessary.
- Preserve logo proportions, marquee motion, and the static reduced-motion layout.

## Schedule booking flow
- Upgrade `/schedule` from read-only availability to the main one-hour booking surface.
- Keep sport and seven-day controls, show each court’s hourly slots, and make every open future hour selectable.
- For guests, save the chosen court/date/hour and send them to sign in or register, returning to `/schedule` afterward.
- For signed-in users, show a clear confirmation with their database-backed member/non-member rate and total, then reserve through the existing protected booking function.
- Refresh availability after confirmation and on a short interval so bookings made elsewhere appear across devices; keep taken and past slots disabled.
- Preserve the existing `/book` page for compatibility, but make `/schedule` the primary linked flow.

## Technical details
- Reuse `getAvailability`, `getCourtRates`, `getMyProfile`, `ensureMemberProfile`, `claimLapsedHolds`, and `createBooking` so rates, membership, activity, and overlap protection remain centralized.
- Use the existing bookings schema and portable migrations; no new table or schema change is required.
- Keep configuration environment-driven and make no Lovable-specific booking dependency.
- Add no new raw HTML command buttons where the shared button component applies; retain accessible focus and reduced-motion behavior.

## Verification
- Verify homepage spacing, wheel snapping/selection, disabled hours, and transparent logos on desktop and phone.
- Verify guest sign-in return, authenticated one-hour booking, confirmation, availability refresh, and double-book rejection.
- Confirm `/schedule` metadata, all updated links, keyboard behavior, reduced motion, no horizontal overflow, clean console/runtime signals, and final build health.
