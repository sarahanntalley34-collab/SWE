import { subscribeEmail } from "../../lib/newsletter";

/**
 * Public API: subscribe to the newsletter.
 * POST /api/newsletter/subscribe
 *
 * Accepts JSON { email }, validates the email (invalid → 400), stores the
 * subscriber (Neon `newsletter_subscribers`, with a JSONL fallback when
 * DATABASE_URL is unset) and queues a welcome email for fresh signups only —
 * duplicates are accepted but never re-queued. Returns JSON.
 *
 * This is a plain route (NOT a server function) because server functions 403 on
 * the published host — the signup form posts here directly. Like the other
 * routes under routes/api, requests are dispatched here explicitly from serve.ts
 * (production) and the vite dev middleware in vite.config.ts (dev).
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const d = (body ?? {}) as { email?: unknown };
  const email = typeof d.email === "string" ? d.email : "";

  try {
    await subscribeEmail(email);
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to subscribe";
    const status = message === "Invalid email" ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
