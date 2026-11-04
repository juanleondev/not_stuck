export const SITE = {
  name: "Juan Jose Leon Camilo",
  title: "Juan Jose Leon Camilo — Senior Software Engineer & Flutter Developer",
  description:
    "Senior software engineer with +5 years of experience building apps with Flutter and Firebase. Co-founder of Paulonia, content creator for the Latam Flutter community and speaker.",
  url: "https://notstuck.dev",
  github: "https://github.com/juanleondev",
  linkedin: "https://www.linkedin.com/in/juanleoncamilo/",
  // Public Cloudflare Turnstile site key; set PUBLIC_TURNSTILE_SITE_KEY at build time.
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA",
} as const;
