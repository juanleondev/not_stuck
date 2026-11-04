// Copy follows BRAND.md (positioning, voice and copy kit).
export const SITE = {
  name: "Juanjo",
  fullName: "Juan José León Camilo",
  role: "Product engineer for founders",
  title: "Juanjo — Product engineer for founders",
  description:
    "I build products with founders, from idea to real users. MVPs and fractional CTO support from someone who gets involved in the business, not just the code.",
  newsletter: {
    name: "Not Stuck",
    pitch: "Every two weeks: one decision founders face when building a product, and how I'd make it.",
  },
  url: "https://juanjodev.com",
  github: "https://github.com/juanleondev",
  linkedin: "https://www.linkedin.com/in/juanleoncamilo/",
  // Public Turnstile site key: the juanjodev.com widget in production builds, Cloudflare's
  // always-pass test key in dev. PUBLIC_TURNSTILE_SITE_KEY overrides both.
  turnstileSiteKey:
    import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ??
    (import.meta.env.PROD ? "0x4AAAAAAFz-joC0j2U3k9em" : "1x00000000000000000000AA"),
} as const;
