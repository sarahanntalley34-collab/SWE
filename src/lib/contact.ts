// Contact message storage — mirrors the newsletter persistence pattern
// (src/lib/newsletter.ts): Neon Postgres when `DATABASE_URL` is set, JSONL
// fallback otherwise so dev/build work with no database.
//
// This module is used only from `src/routes/api/*` (server-only), so Node
// built-ins are imported dynamically to keep the client bundle clean.

async function fs() {
  return import("node:fs/promises");
}

export const CONTACT_MESSAGES_FILE = "/home/team/shared/contact-messages.jsonl";

export type ContactMessage = {
  /** Present on DB-backed rows (contact_messages.id); file-fallback rows have none. */
  id?: number;
  name: string;
  email: string;
  company?: string;
  message: string;
  submittedAt: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Minimal call signature for the tagged-template query function from db.ts. */
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>;

/**
 * Resolves the database query function when `DATABASE_URL` is set, or null when
 * it isn't (so storage falls back to the JSONL file).
 */
async function db(): Promise<Sql | null> {
  if (!process.env.DATABASE_URL) return null;
  const { sql } = await import("~/db");
  return sql() as unknown as Sql;
}

let tableReady: Promise<void> | null = null;

/** Creates the contact_messages table on first use (idempotent, per process). */
async function ensureContactMessagesTable(sql: Sql): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS contact_messages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            message TEXT NOT NULL,
            submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `;
      } catch (e) {
        // Retry on the next call instead of pinning the process to a rejected promise.
        tableReady = null;
        throw e;
      }
    })();
  }
  await tableReady;
}

/**
 * Validates and stores a contact message. Returns the stored record.
 * Throws an Error with a human-readable message on validation failure
 * (the API route maps those to 400).
 */
export async function saveContactMessage(input: {
  name: string;
  email: string;
  company?: string;
  message: string;
}): Promise<ContactMessage> {
  const name = input.name.trim();
  const email = input.email.trim();
  const company = (input.company ?? "").trim();
  const message = input.message.trim();

  if (!name) throw new Error("Name is required");
  if (!isValidEmail(email)) throw new Error("A valid email is required");
  if (!message) throw new Error("Message is required");

  const submittedAt = new Date().toISOString();
  const record: ContactMessage = { name, email, message, submittedAt };
  if (company) record.company = company;

  const sql = await db();
  if (sql) {
    await ensureContactMessagesTable(sql);
    await sql`
      INSERT INTO contact_messages (name, email, company, message)
      VALUES (${name}, ${email}, ${company || null}, ${message})
    `;
  } else {
    // File fallback (no DATABASE_URL): keep the message in JSONL.
    const { appendFile: af } = await fs();
    await af(CONTACT_MESSAGES_FILE, JSON.stringify(record) + "\n", "utf8");
  }
  return record;
}

/**
 * Reads all contact messages (newest first). Uses the database when
 * `DATABASE_URL` is set, otherwise falls back to the JSONL file. Mirrors
 * `readSubscribers` in src/lib/newsletter.ts.
 */
export async function listContactMessages(): Promise<ContactMessage[]> {
  const sql = await db();
  if (sql) {
    await ensureContactMessagesTable(sql);
    const rows = (await sql`
      SELECT id, name, email, company, message, submitted_at
      FROM contact_messages
      ORDER BY submitted_at DESC
    `) as {
      id: number;
      name: string;
      email: string;
      company: string | null;
      message: string;
      submitted_at: Date | string;
    }[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      company: r.company ?? undefined,
      message: r.message,
      submittedAt: new Date(r.submitted_at).toISOString(),
    }));
  }
  return readContactMessagesFromFile();
}

/** Reads all contact messages from the JSONL file, newest first, skipping malformed lines. */
async function readContactMessagesFromFile(): Promise<ContactMessage[]> {
  let raw: string;
  try {
    raw = await (await fs()).readFile(CONTACT_MESSAGES_FILE, "utf8");
  } catch (e) {
    if ((e as { code?: string }).code === "ENOENT") return [];
    throw e;
  }
  const messages: ContactMessage[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Partial<ContactMessage>;
      if (
        typeof parsed.name === "string" &&
        typeof parsed.email === "string" &&
        typeof parsed.message === "string" &&
        typeof parsed.submittedAt === "string"
      ) {
        messages.push({
          name: parsed.name,
          email: parsed.email,
          company: parsed.company,
          message: parsed.message,
          submittedAt: parsed.submittedAt,
        });
      }
    } catch {
      // Skip malformed lines rather than failing the whole read.
    }
  }
  // The file is append-only (oldest first) — flip to match the DB order.
  return messages.reverse();
}
