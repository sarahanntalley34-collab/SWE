import { saveContactMessage } from "../../lib/contact";

/**
 * Public API: submit a contact message.
 * POST /api/contact
 *
 * Accepts JSON { name, email, company?, message }, validates it (name, email
 * and message non-empty; email format checked), stores it in Neon
 * (`contact_messages` table, with a JSONL fallback when DATABASE_URL is unset)
 * and returns JSON. Errors return non-2xx statuses.
 *
 * This TanStack Start version (1.158) does not auto-serve files under
 * routes/api — requests are dispatched here explicitly from serve.ts
 * (production) and the vite dev middleware in vite.config.ts (dev).
 */
export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const d = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    company?: unknown;
    message?: unknown;
  };
  const name = typeof d.name === "string" ? d.name : "";
  const email = typeof d.email === "string" ? d.email : "";
  const company = typeof d.company === "string" ? d.company : "";
  const message = typeof d.message === "string" ? d.message : "";

  try {
    const record = await saveContactMessage({ name, email, company, message });
    return Response.json({ success: true, submittedAt: record.submittedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save message";
    const status =
      message.includes("required") || message.includes("valid email") ? 400 : 500;
    return Response.json({ error: message }, { status });
  }
}
