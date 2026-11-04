import type { Env } from "./env";

interface Message {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

export async function sendEmail(env: Pick<Env, "RESEND_API_KEY" | "MAIL_FROM">, message: Message): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, ...message }),
  });
  if (!res.ok) throw new Error(`Resend responded with ${res.status}`);
}

export function confirmationEmail(confirmUrl: string): Omit<Message, "to"> {
  return {
    subject: "Confirm your subscription",
    text: `Thanks for subscribing! Confirm your email by opening this link:\n\n${confirmUrl}\n\nIf you didn't request this, you can ignore this message.`,
    html: `<p>Thanks for subscribing!</p><p><a href="${confirmUrl}">Confirm your email</a></p><p>If you didn't request this, you can ignore this message.</p>`,
  };
}
