import { markWelcomeEmailsSent } from "../../lib/newsletter";

/**
 * Public API: mark subscribers as having received their welcome email.
 * POST /api/newsletter/mark-welcome-sent
 *
 * Body: { "emails": ["a@b.com"] } — an array of email strings. Unknown or
 * already-marked emails are ignored; the response reports how many were
 * actually marked: { "marked": N }.
 *
 * Dispatched explicitly from serve.ts (production) and the vite dev middleware
 * in vite.config.ts, like the other routes under routes/api.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }
  const emails = (body as { emails?: unknown })?.emails;
  if (!Array.isArray(emails) || emails.some((e) => typeof e !== "string")) {
    return Response.json(
      { error: 'Body must be an object: { "emails": ["a@b.com"] } with an array of email strings' },
      { status: 400 },
    );
  }
  return Response.json(await markWelcomeEmailsSent(emails as string[]));
}
