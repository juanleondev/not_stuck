export type TokenAction = "confirm" | "unsubscribe";

interface Payload {
  e: string;
  a: TokenAction;
  exp?: number;
}

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

const importKey = (secret: string, usage: "sign" | "verify") =>
  crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [usage]);

/** Creates a signed token `payload.signature`. Omit `ttlSeconds` for tokens that never expire. */
export async function signToken(
  secret: string,
  email: string,
  action: TokenAction,
  ttlSeconds?: number,
): Promise<string> {
  const payload: Payload = { e: email, a: action };
  if (ttlSeconds) payload.exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await importKey(secret, "sign"), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the email when the token is valid for `action`, otherwise `null`. */
export async function verifyToken(secret: string, token: string, action: TokenAction): Promise<string | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret, "verify"),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as Payload;
    if (payload.a !== action) return null;
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload.e;
  } catch {
    return null;
  }
}
