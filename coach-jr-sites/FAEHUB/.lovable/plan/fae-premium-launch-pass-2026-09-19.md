# FAE Premium Launch Pass

## Goal
Finish the new court presentation and add a cinematic, installable premium experience while preserving the wheel and black-and-silver FAE identity.

## Changes
- Replace the basketball wheel logo with the new transparent upload, centered and contained at the existing large scale; leave the wheel’s behavior unchanged.
- Use the real court photo behind the title with a dark overlay and restrained Ken Burns motion.
- Add a full-width “Our Court” section using both supplied court images, short copy, scroll reveal, parallax, and a brief cross-fade transition.
- Add a subtle silver sheen, grain, and vignette behind page content, plus smooth scrolling that keeps anchor links working.
- Show a quick FAE / FilAmElite intro once per browser session, and add a subtle silver-ring cursor for precise pointer devices.
- Add magnetic primary buttons, a light card sheen, count-up stats, and an editable Next Game / Court Status card near the top.
- Remove Apex Performance and restyle Picklemania, Aguila Auto Glass, and VA as a static, borderless centered row.
- Add complete launch metadata, social sharing image, favicon, installability, and an offline splash.
- Verify desktop and mobile layouts, reduced-motion behavior, interactions, installability, image rendering, and diagnostics.

## Technical details
- Store uploaded page imagery through the project asset service and import the resulting pointers.
- Use Lenis for smooth scrolling and GSAP ScrollTrigger for two restrained pinned/cross-fade moments; disable both enhanced motion paths under reduced motion.
- Keep game and court placeholder values in one clearly named configuration object with the requested future-feed comment.
- Use a manifest and preview-safe service-worker setup with an offline fallback; preserve ordinary navigation and anchor behavior.
- Keep all image treatments proportional with `object-fit: contain` and stable responsive bounds.
