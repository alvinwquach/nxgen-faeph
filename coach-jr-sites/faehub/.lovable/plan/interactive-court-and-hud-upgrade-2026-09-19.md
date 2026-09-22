# Interactive Court and HUD Upgrade

## What changes
- Remove the NBA legends gym photo from the hero, court section, metadata, scroll effects, and project assets.
- Crop the supplied top-down court artwork to the black court rectangle and use it as the 3D floor texture.
- Add a client-safe React Three Fiber court viewer with procedural hoops, backboards, arena lighting, floor sheen, damped orbit controls, gentle rotation, and a static low-motion mode.
- Use the supplied 3D render as the loading poster and WebGL fallback with subtle pointer parallax.
- Replace plain status and site-card borders with glass HUD frames, silver edge glow, corner brackets, and inner highlights.
- Replace arrow and play controls with a segmented circular site indicator that remains clickable and keyboard accessible; dragging still spins the wheel.
- Keep the layered silver background fixed and visible continuously through the footer.

## Technical details
- Install Three.js, React Three Fiber v9, Drei v10, and Three.js types for React 19.
- Mount the 3D viewer only after the browser loads to avoid server-rendering mismatches.
- Detect reduced motion, coarse pointers, constrained device memory, and missing WebGL; those modes use a static scene or the poster.
- Keep the existing wheel geometry, logos, external links, and static Picklemania/Aguila/VA sponsor row unchanged.
- Update the page preview image to the supplied court render and verify desktop, mobile, reduced-motion, keyboard controls, WebGL fallback, and build health.
