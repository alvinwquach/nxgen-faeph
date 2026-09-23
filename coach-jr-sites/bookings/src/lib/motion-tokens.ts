// Shared motion tokens (motion-foundations). Components import these; no raw timing numbers inline.
export const motionTokens = {
  distance: { xs: 4, sm: 8, md: 16, lg: 24, xl: 48 },
  scale: { subtle: 0.98, press: 0.95, pop: 1.04 },
  stagger: 0.05,
} as const;

export const springs = {
  snappy: { type: "spring", stiffness: 300, damping: 30 },
  gentle: { type: "spring", stiffness: 120, damping: 14 },
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
} as const;
