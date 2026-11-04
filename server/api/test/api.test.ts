import { env } from "cloudflare:workers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/index";
import { signToken } from "../src/token";

const json = (path: string, body: unknown) =>
  app.request(
    path,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) },
    env,
  );

const statusOf = (email: string) =>
  env.DB.prepare("SELECT status FROM subscribers WHERE email = ?").bind(email).first<{ status: string }>();

let sent: { to: string; html: string }[];

beforeEach(async () => {
  await env.DB.exec("DELETE FROM subscribers");
  sent = [];
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes("turnstile")) {
      const ok = (init?.body as FormData).get("response") === "good";
      return Response.json({ success: ok });
    }
    if (url.includes("resend")) {
      sent.push(JSON.parse(String(init?.body)));
      return Response.json({ id: "1" });
    }
    throw new Error(`Unexpected fetch ${url}`);
  });
});

afterEach(() => vi.restoreAllMocks());

describe("POST /api/subscribe", () => {
  it("stores a pending subscriber and sends a confirmation email", async () => {
    const res = await json("/api/subscribe", { email: " Me@Example.com ", turnstileToken: "good" });
    expect(res.status).toBe(200);
    expect((await statusOf("me@example.com"))?.status).toBe("pending");
    expect(sent).toHaveLength(1);
    expect(sent[0].html).toContain(`${env.SITE_URL}/confirm?token=`);
  });

  it("rejects invalid emails and failed captchas", async () => {
    expect((await json("/api/subscribe", { email: "nope", turnstileToken: "good" })).status).toBe(400);
    expect((await json("/api/subscribe", { email: "a@b.co", turnstileToken: "bad" })).status).toBe(400);
    expect(await statusOf("a@b.co")).toBeNull();
  });

  it("does not email already confirmed subscribers", async () => {
    await env.DB.prepare("INSERT INTO subscribers (email, status) VALUES ('c@d.co', 'confirmed')").run();
    const res = await json("/api/subscribe", { email: "c@d.co", turnstileToken: "good" });
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
  });
});

describe("confirm and unsubscribe", () => {
  it("confirms with a valid token and rejects an invalid one", async () => {
    await json("/api/subscribe", { email: "e@f.co", turnstileToken: "good" });
    const token = await signToken(env.TOKEN_SECRET, "e@f.co", "confirm", 60);
    expect((await json("/api/confirm", { token: "garbage" })).status).toBe(400);
    expect((await json("/api/confirm", { token })).status).toBe(200);
    expect((await statusOf("e@f.co"))?.status).toBe("confirmed");
  });

  it("does not change state on GET", async () => {
    await env.DB.prepare("INSERT INTO subscribers (email, status) VALUES ('g@h.co', 'confirmed')").run();
    const token = await signToken(env.TOKEN_SECRET, "g@h.co", "unsubscribe");
    const res = await app.request(`/api/unsubscribe?token=${token}`, {}, env);
    expect(res.status).toBe(404);
    expect((await statusOf("g@h.co"))?.status).toBe("confirmed");
  });

  it("unsubscribes via JSON and via RFC 8058 one-click", async () => {
    await env.DB.prepare("INSERT INTO subscribers (email, status) VALUES ('i@j.co', 'confirmed')").run();
    const token = await signToken(env.TOKEN_SECRET, "i@j.co", "unsubscribe");
    const oneClick = await app.request(
      `/api/unsubscribe?token=${token}`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: "List-Unsubscribe=One-Click",
      },
      env,
    );
    expect(oneClick.status).toBe(200);
    expect((await statusOf("i@j.co"))?.status).toBe("unsubscribed");
  });
});
