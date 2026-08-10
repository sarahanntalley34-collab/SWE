import { getPendingWelcomeEmails } from "../../lib/newsletter";

/**
 * Public API: list subscribers whose welcome email has not been sent yet.
 * GET /api/newsletter/pending-welcome
 *
 * Emails are ordered oldest-first (by subscription time). A subscriber is
 * "pending" while `welcome_sent_at` is NULL in the Neon database (see
 * src/lib/newsletter.ts); in dev without DATABASE_URL it reads the JSONL
 * welcome-queue fallback.
 *
 * Like the other routes under routes/api, this is dispatched explicitly from
 * serve.ts (production) and the vite dev middleware in vite.config.ts.
 */
export async function GET() {
  return Response.json(await getPendingWelcomeEmails());
}
