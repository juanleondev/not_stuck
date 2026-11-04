# not_stuck

Personal brand monorepo for [notstuck.dev](https://notstuck.dev).

```
apps/web/     Astro site: landing, blog, subscribe form (static, served from Cloudflare's edge)
server/api/   Hono Worker: newsletter subscribe / confirm / unsubscribe (Cloudflare D1 + Resend)
personal/     Personal documents (not part of the site)
```

Requires Node >= 22.23.4 (`.node-version` points to Node 24).

## Development

```sh
npm install
npm run dev:api   # Hono Worker on http://localhost:8787 (needs server/api/.dev.vars, see .dev.vars.example)
npm run dev:web   # Astro on http://localhost:4321, proxies /api to the Worker
npm test          # API tests (Vitest on the Workers runtime, real D1)
npm run check     # astro check + tsc
```

First run only: `npm run db:migrate:local -w server/api`.

## Writing posts

Add a Markdown/MDX file to `apps/web/src/content/blog/`. Frontmatter: `title`, `description`, `pubDate`, `tags`, optional `image` and `draft`.

## API

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/subscribe` | `{ email, turnstileToken }`. Stores a pending subscriber and sends the double opt-in email. |
| POST | `/api/confirm` | `{ token }`. Linked from the email via `/confirm?token=`. |
| POST | `/api/unsubscribe` | `{ token }` or RFC 8058 one-click (`?token=`). Linked via `/unsubscribe?token=`. |
| GET | `/api/health` | Liveness check. |

State changes never happen on GET, so mail scanners and link prefetchers cannot confirm or unsubscribe anyone.

## Deploy (Cloudflare)

One-time setup:

```sh
cd server/api
npx wrangler d1 create not-stuck            # copy database_id into wrangler.jsonc
npm run db:migrate:remote
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put TOKEN_SECRET        # long random string
```

Set `PUBLIC_TURNSTILE_SITE_KEY` when building the web app, and verify the sending domain in Resend.

```sh
npm run deploy -w server/api   # Worker, routed on notstuck.dev/api/*
npm run deploy -w apps/web     # static assets, custom domain notstuck.dev
```
