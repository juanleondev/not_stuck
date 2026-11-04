export interface Env {
  DB: D1Database;
  SUBSCRIBE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  SITE_URL: string;
  MAIL_FROM: string;
  RESEND_API_KEY: string;
  TURNSTILE_SECRET: string;
  TOKEN_SECRET: string;
}
