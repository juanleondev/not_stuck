# not_stuck

Personal brand monorepo for [notstuck.dev](https://notstuck.dev).

```
apps/web/     Astro site: landing, blog, subscribe form (static, served from Cloudflare's edge)
server/api/   Hono Worker: newsletter subscribe / confirm / unsubscribe (Cloudflare D1 + Resend)
personal/     Personal documents (the CV PDF is published to apps/web/public/cv.pdf)
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

Ports are configurable so several instances can run at once (for example one per feature or worktree). Copy `.env.example` to `.env` or pass them inline:

```sh
API_PORT=8801 INSPECTOR_PORT=9301 npm run dev:api
WEB_PORT=4401 API_PORT=8801 npm run dev:web
```

Local D1 state lives in `server/api/.wrangler/state-<API_PORT>/` (migrations are applied automatically on start), so instances never share or lock a database. The web dev server fails if its port is taken instead of silently picking another one.

### Docker

```sh
docker compose up --build
# a second, isolated instance:
COMPOSE_PROJECT_NAME=feat-x WEB_PORT=4401 API_PORT=8801 INSPECTOR_PORT=9301 docker compose up --build
```

Each compose project gets its own containers and its own D1 state volume. `astro dev` allows one dev server per directory, so run parallel instances from separate git worktrees (or use Docker). Source in `apps/web/src` and `server/api/src` is bind-mounted for live reload.

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
