# F.A.E. × NXGEN motion upgrade

## Goal
Bring the strongest motion ideas from the existing NXGEN Premier League project into F.A.E. Court while keeping F.A.E. visually and functionally independent.

## What will change
- Add a lightweight animated court-atmosphere layer behind the F.A.E. homepage opening: perspective floor lines, restrained gold light shafts, depth particles, and a slow horizon pulse.
- Keep the scene crisp across screen sizes, cap pixel density for performance, pause it when the tab is hidden, and render a static frame for reduced-motion users.
- Strengthen scroll choreography with reusable staggered 3D entrances for the service and sport groups already on the page.
- Add NXGEN-inspired navigation and card micro-motion: staggered navigation entrance, centered gold underline, subtle icon lift/rotation, and directional arrow movement.
- Remove the current decorative drifting blobs from the homepage once the richer court scene replaces them; page structure, wording, links, pricing, and booking behavior stay unchanged.

## Technical details
- Adapt the source project's canvas animation into a new F.A.E.-specific component using the current semantic color tokens instead of importing NXGEN branding or assets.
- Reuse the existing `Scene3D`, `Motion`, and `TiltCard` systems rather than adding a motion dependency.
- Keep all animation transform/opacity based where possible, use passive listeners or `requestAnimationFrame`, and honor `prefers-reduced-motion` and touch-device constraints.
- Verify the homepage at desktop and mobile sizes, check motion-disabled rendering, and confirm all content routes retain their metadata and the app builds cleanly.
