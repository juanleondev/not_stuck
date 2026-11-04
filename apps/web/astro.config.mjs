import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://notstuck.dev",
  output: "static",
  integrations: [mdx(), sitemap()],
  vite: {
    server: {
      // Proxy the Hono Worker in dev so the subscribe form stays same-origin.
      proxy: { "/api": "http://localhost:8787" },
    },
  },
});
