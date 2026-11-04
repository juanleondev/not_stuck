import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Ports come from the shell or the repo-root .env so several instances can run side by side.
const rootDir = new URL("../..", import.meta.url).pathname;
const env = { ...loadEnv("development", rootDir, ""), ...process.env };
const webPort = Number(env.WEB_PORT ?? 4321);
const apiUrl = env.API_URL ?? `http://localhost:${env.API_PORT ?? 8787}`;

export default defineConfig({
  site: "https://juanjodev.com",
  output: "static",
  integrations: [mdx(), sitemap()],
  server: { port: webPort, host: env.HOST ?? "127.0.0.1" },
  vite: {
    server: {
      strictPort: true, // fail loudly instead of silently moving to another port
      // Proxy the Hono Worker in dev so the subscribe form stays same-origin.
      proxy: { "/api": apiUrl },
    },
  },
});
