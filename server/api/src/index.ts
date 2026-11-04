import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "./env";
import { confirmationEmail, sendEmail } from "./email";
import { signToken, verifyToken } from "./token";
import { verifyTurnstile } from "./turnstile";

const CONFIRM_TTL_SECONDS = 60 * 60 * 48;

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  turnstileToken: z.string().min(1),
});

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.get("/health", (c) => c.json({ ok: true }));

app.post(
  "/subscribe",
  zValidator("json", subscribeSchema, (result, c) => {
    if (!result.success) return c.json({ message: "Please enter a valid email." }, 400);
  }),
  async (c) => {
    const { email, turnstileToken } = c.req.valid("json");
    const ip = c.req.header("cf-connecting-ip");

    if (c.env.SUBSCRIBE_LIMITER) {
      const { success } = await c.env.SUBSCRIBE_LIMITER.limit({ key: ip ?? "unknown" });
      if (!success) return c.json({ message: "Too many attempts, please try again soon." }, 429);
    }

    if (!(await verifyTurnstile(c.env.TURNSTILE_SECRET, turnstileToken, ip))) {
      return c.json({ message: "Captcha verification failed." }, 400);
    }

    const existing = await c.env.DB.prepare("SELECT status FROM subscribers WHERE email = ?")
      .bind(email)
      .first<{ status: string }>();

    // Same response either way so the endpoint cannot be used to probe who is subscribed.
    const response = { message: "Almost there! Check your inbox to confirm your email." };
    if (existing?.status === "confirmed") return c.json(response);

    await c.env.DB.prepare(
      `INSERT INTO subscribers (email) VALUES (?)
       ON CONFLICT(email) DO UPDATE SET status = 'pending', unsubscribed_at = NULL`,
    )
      .bind(email)
      .run();

    const token = await signToken(c.env.TOKEN_SECRET, email, "confirm", CONFIRM_TTL_SECONDS);
    const confirmUrl = `${c.env.SITE_URL}/confirm?token=${encodeURIComponent(token)}`;
    try {
      await sendEmail(c.env, { to: email, ...confirmationEmail(confirmUrl) });
    } catch (error) {
      console.error("Failed to send confirmation email", error);
      return c.json({ message: "Could not send the confirmation email. Please try again." }, 502);
    }
    return c.json(response);
  },
);

app.post("/confirm", async (c) => {
  const token = await readToken(c.req.raw);
  const email = token && (await verifyToken(c.env.TOKEN_SECRET, token, "confirm"));
  if (!email) return c.json({ message: "This confirmation link is invalid or has expired." }, 400);

  await c.env.DB.prepare(
    `UPDATE subscribers
     SET status = 'confirmed', confirmed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), unsubscribed_at = NULL
     WHERE email = ? AND status != 'confirmed'`,
  )
    .bind(email)
    .run();
  return c.json({ message: "You're subscribed. Thanks!" });
});

// Also handles RFC 8058 one-click unsubscribe: mail clients POST `List-Unsubscribe=One-Click` to the URL in the header.
app.post("/unsubscribe", async (c) => {
  const token = (await readToken(c.req.raw)) ?? c.req.query("token");
  const email = token && (await verifyToken(c.env.TOKEN_SECRET, token, "unsubscribe"));
  if (!email) return c.json({ message: "This unsubscribe link is invalid." }, 400);

  await c.env.DB.prepare(
    `UPDATE subscribers
     SET status = 'unsubscribed', unsubscribed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE email = ? AND status != 'unsubscribed'`,
  )
    .bind(email)
    .run();
  return c.json({ message: "You've been unsubscribed." });
});

async function readToken(request: Request): Promise<string | null> {
  const type = request.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/json")) {
      const body = (await request.clone().json()) as { token?: unknown };
      return typeof body.token === "string" ? body.token : null;
    }
  } catch {
    return null;
  }
  return new URL(request.url).searchParams.get("token");
}

export default app;
