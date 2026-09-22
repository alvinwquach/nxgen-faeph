# LinkMePH premium rebrand

## Scope
- Preserve all existing routes, authentication, account features, data, forms, and working interactions.
- Replace the current visual identity with the supplied LinkMePH logo and a cohesive black, cyan, and red premium system.
- Restructure the homepage around the requested tap-to-connect story without removing existing destinations.

## Implementation
1. Add the supplied logo through the project asset flow, create a correctly padded favicon, and use the official mark consistently in the header, homepage, and footer.
2. Rework the global design tokens and shared controls for pure-black surfaces, near-black panels, cyan primary actions, red highlights, system typography, pill buttons, visible focus states, and restrained motion.
3. Rebuild the shared header and footer with mobile navigation, “Get your card,” existing account access, social links, and F.A.E. family links.
4. Restructure the homepage into: immersive tap-to-connect opening, Tap → Share → Connect, exactly four service cards, digital-profile showcase, FAE Court and online band, proof points, starting offer, existing inquiry flow, and closing action.
5. Align shared page headers and reusable cards so all existing pages inherit the new premium system while retaining their current content and behavior.
6. Update page metadata where needed, then verify the homepage and key existing pages on desktop and mobile, including menus, links, forms, focus states, and layout stability.

## Technical details
- Keep TanStack Start routing and current Cloud-backed functionality unchanged.
- Use semantic Tailwind v4 tokens only; no raw component colors.
- The uploaded PNG remains transparent and proportionally fitted; the favicon is a separate optimized square file.
- Existing placeholders such as phone numbers remain placeholders unless real values are supplied.
