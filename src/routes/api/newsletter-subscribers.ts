import { readSubscribers } from "../../lib/newsletter";

/**
 * Public API: list newsletter subscribers.
 * GET /api/newsletter-subscribers
 *
 * Subscribers are read from the Neon database (see src/lib/newsletter.ts);
 * in dev without DATABASE_URL it falls back to the local JSONL file.
 *
 * This TanStack Start version (1.158) does not auto-serve files under
 * routes/api — requests are dispatched here explicitly from serve.ts
 * (production) and the vite dev middleware in vite.config.ts (dev).
 */
export async function getNewsletterSubscribers() {
  const subscribers = await readSubscribers();
  return { count: subscribers.length, subscribers };
}

export async function GET() {
  return Response.json(await getNewsletterSubscribers());
}
