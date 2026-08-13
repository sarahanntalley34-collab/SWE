import { listContactMessages } from "../../lib/contact";

/**
 * Public API: list contact-message inquiries (admin read path).
 * GET /api/contact-messages
 *
 * Messages are read from the Neon database (see src/lib/contact.ts), newest
 * first; in dev without DATABASE_URL it falls back to the local JSONL file.
 * The response shape mirrors GET /api/newsletter-subscribers: a count plus an
 * array under a plural key.
 *
 * This TanStack Start version (1.158) does not auto-serve files under
 * routes/api — requests are dispatched here explicitly from serve.ts
 * (production) and the vite dev middleware in vite.config.ts (dev).
 */
export async function getContactMessages() {
  const messages = await listContactMessages();
  return { count: messages.length, messages };
}

export async function GET() {
  return Response.json(await getContactMessages());
}
