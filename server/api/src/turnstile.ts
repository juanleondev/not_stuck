const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(secret: string, token: string, ip?: string): Promise<boolean> {
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);
  const res = await fetch(VERIFY_URL, { method: "POST", body });
  if (!res.ok) return false;
  const result = (await res.json()) as { success: boolean };
  return result.success;
}
