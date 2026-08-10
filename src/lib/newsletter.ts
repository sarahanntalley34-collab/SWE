import { createServerFn } from "@tanstack/react-start";

// Node built-ins must be imported dynamically inside server functions —
// top-level static imports are processed by the client bundler and break.
async function fs() {
  return import("node:fs/promises");
}

/**
 * Newsletter infrastructure — subscribers and delivery queues.
 *
 * - Subscribers live in the Neon Postgres database (table `newsletter_subscribers`),
 *   so the published site works where the local filesystem isn't available.
 * - A successful NEW subscription queues a welcome email in the database:
 *   `welcome_sent_at IS NULL` means the welcome email is pending (never sent
 *   directly). Duplicate signups do NOT re-queue. The lead reads and acknowledges
 *   the queue via the API endpoints (GET /api/newsletter/pending-welcome,
 *   POST /api/newsletter/mark-welcome-sent).
 * - The admin page queues bulk newsletter sends for the lead to process; the
 *   newsletter-send queue stays file-based (JSONL) because the lead processes it
 *   locally.
 *
 * When `DATABASE_URL` is not set (bare local build without a connected database),
 * subscriber storage and the welcome queue fall back to JSONL files so dev works.
 */

export const SUBSCRIBERS_FILE = "/home/team/shared/newsletter-subscribers.jsonl";
export const WELCOME_QUEUE_FILE = "/home/team/shared/pending-welcome-emails.jsonl";
export const SEND_QUEUE_FILE = "/home/team/shared/pending-newsletter-sends.jsonl";

export type Subscriber = { email: string; subscribedAt: string };
export type PendingWelcomeEmail = { email: string; subscribedAt: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Minimal call signature for the tagged-template query function from db.ts. */
type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>;

/**
 * Resolves the database query function when `DATABASE_URL` is set, or null when it
 * isn't (so subscriber storage can fall back to the JSONL file).
 *
 * Note: db.ts exports a factory — `sql()` must be called to get the tagged-template
 * query function.
 */
async function db(): Promise<Sql | null> {
  if (!process.env.DATABASE_URL) return null;
  const { sql } = await import("~/db");
  return sql() as unknown as Sql;
}

let tableReady: Promise<void> | null = null;

/** Creates the subscriber table + welcome-email column on first use (idempotent, per process). */
async function ensureSubscribersTable(sql: Sql): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            welcome_sent_at TIMESTAMPTZ
          )
        `;
        // Idempotent migration for databases created before welcome-email tracking
        // existed (NULL welcome_sent_at = welcome email pending).
        await sql`
          ALTER TABLE newsletter_subscribers
          ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMPTZ
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
 * Reads all subscribers (newest first). Uses the database when `DATABASE_URL` is
 * set, otherwise falls back to the JSONL file.
 */
export async function readSubscribers(): Promise<Subscriber[]> {
  const sql = await db();
  if (sql) {
    await ensureSubscribersTable(sql);
    const rows = (await sql`
      SELECT email, subscribed_at
      FROM newsletter_subscribers
      ORDER BY subscribed_at DESC
    `) as { email: string; subscribed_at: Date | string }[];
    return rows.map((r) => ({
      email: r.email,
      subscribedAt: new Date(r.subscribed_at).toISOString(),
    }));
  }
  return readSubscribersFromFile();
}

/** Reads all subscribers from the JSONL file, skipping malformed lines. */
async function readSubscribersFromFile(): Promise<Subscriber[]> {
  let raw: string;
  try {
    raw = await (await fs()).readFile(SUBSCRIBERS_FILE, "utf8");
  } catch (e) {
    if ((e as { code?: string }).code === "ENOENT") return [];
    throw e;
  }
  const subscribers: Subscriber[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Partial<Subscriber>;
      if (
        typeof parsed.email === "string" &&
        typeof parsed.subscribedAt === "string"
      ) {
        subscribers.push({ email: parsed.email, subscribedAt: parsed.subscribedAt });
      }
    } catch {
      // Skip malformed lines rather than failing the whole read.
    }
  }
  return subscribers;
}

/** A welcome-queue job as stored in the JSONL fallback file. */
type WelcomeQueueEntry = { email: string; subscribedAt: string; status: string };

/** Reads the JSONL welcome-queue fallback file, skipping malformed lines. */
async function readWelcomeQueueFromFile(): Promise<WelcomeQueueEntry[]> {
  let raw: string;
  try {
    raw = await (await fs()).readFile(WELCOME_QUEUE_FILE, "utf8");
  } catch (e) {
    if ((e as { code?: string }).code === "ENOENT") return [];
    throw e;
  }
  const entries: WelcomeQueueEntry[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as Partial<WelcomeQueueEntry>;
      if (
        typeof parsed.email === "string" &&
        typeof parsed.subscribedAt === "string"
      ) {
        entries.push({
          email: parsed.email,
          subscribedAt: parsed.subscribedAt,
          status: parsed.status === "pending" ? "pending" : parsed.status ?? "pending",
        });
      }
    } catch {
      // Skip malformed lines rather than failing the whole read.
    }
  }
  return entries;
}

/**
 * Subscribes a validated email: stores the subscriber AND queues a welcome-email
 * job. Plain async function (NOT a server fn) so the public signup form can call
 * it through a plain HTTP POST route — server functions 403 on the published
 * host, so /api/newsletter/subscribe dispatches here instead.
 *
 * Returns `{ success: true, subscribed: true }` for a fresh signup (welcome
 * email queued) and `{ success: true, subscribed: false }` for a duplicate
 * (accepted, but NOT re-queued).
 *
 * Throws `new Error("Invalid email")` for invalid input; other errors propagate
 * for the route layer to map to 500.
 */
export async function subscribeEmail(
  email: string,
): Promise<{ success: boolean; subscribed?: boolean }> {
  if (!email || !isValidEmail(email)) {
    throw new Error("Invalid email");
  }
  const normalized = email.trim();
  const subscribedAt = new Date().toISOString();
  const sql = await db();
  if (sql) {
    await ensureSubscribersTable(sql);
    // A returned row means the email was actually inserted (ON CONFLICT DO
    // NOTHING skips duplicates). New rows are pending-welcome by default
    // (welcome_sent_at IS NULL), so only fresh signups enqueue a welcome email
    // and duplicates never re-queue. No filesystem involved — the published
    // host has no local writable queue.
    const rows = (await sql`
      INSERT INTO newsletter_subscribers (email)
      VALUES (${normalized})
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `) as { id: number }[];
    return { success: true, subscribed: rows.length > 0 };
  }
  // File fallback (no DATABASE_URL): keep subscriber + welcome job in JSONL.
  const { appendFile: af } = await fs();
  const existing = await readSubscribersFromFile();
  if (existing.some((s) => s.email === normalized)) {
    // Duplicate — do not store again and do not re-queue the welcome email.
    return { success: true, subscribed: false };
  }
  await af(SUBSCRIBERS_FILE, JSON.stringify({ email: normalized, subscribedAt }) + "\n");
  await af(
    WELCOME_QUEUE_FILE,
    JSON.stringify({ email: normalized, subscribedAt, status: "pending" }) + "\n",
  );
  return { success: true, subscribed: true };
}

/**
 * Pending welcome emails, oldest first. DB mode: subscribers whose
 * `welcome_sent_at` is NULL. File mode: pending entries in the JSONL queue.
 */
export async function getPendingWelcomeEmails(): Promise<{ emails: PendingWelcomeEmail[] }> {
  const sql = await db();
  if (sql) {
    await ensureSubscribersTable(sql);
    const rows = (await sql`
      SELECT email, subscribed_at
      FROM newsletter_subscribers
      WHERE welcome_sent_at IS NULL
      ORDER BY subscribed_at ASC
    `) as { email: string; subscribed_at: Date | string }[];
    return {
      emails: rows.map((r) => ({
        email: r.email,
        subscribedAt: new Date(r.subscribed_at).toISOString(),
      })),
    };
  }
  const entries = (await readWelcomeQueueFromFile()).filter((e) => e.status === "pending");
  return { emails: entries.map((e) => ({ email: e.email, subscribedAt: e.subscribedAt })) };
}

/**
 * Marks the given emails as having received their welcome email
 * (sets welcome_sent_at = NOW()). Unknown or already-marked emails are ignored.
 * Returns the number of emails actually marked.
 */
export async function markWelcomeEmailsSent(emails: string[]): Promise<{ marked: number }> {
  const unique = [...new Set(emails.map((e) => e.trim()).filter(Boolean))];
  if (unique.length === 0) return { marked: 0 };
  const sql = await db();
  if (sql) {
    await ensureSubscribersTable(sql);
    const rows = (await sql`
      UPDATE newsletter_subscribers
      SET welcome_sent_at = NOW()
      WHERE email = ANY(${unique}) AND welcome_sent_at IS NULL
      RETURNING email
    `) as { email: string }[];
    return { marked: rows.length };
  }
  const entries = await readWelcomeQueueFromFile();
  const remaining = entries.filter((e) => !unique.includes(e.email));
  const marked = entries.length - remaining.length;
  const { writeFile: wf } = await fs();
  await wf(
    WELCOME_QUEUE_FILE,
    remaining.length ? remaining.map((e) => JSON.stringify(e)).join("\n") + "\n" : "",
  );
  return { marked };
}

/** Admin stats: total subscriber count + pending welcome emails. */
export const getNewsletterStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  if (sql) {
    await ensureSubscribersTable(sql);
    const rows = (await sql`SELECT COUNT(*) AS count FROM newsletter_subscribers`) as {
      count: string | number;
    }[];
    const pending = (await sql`
      SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE welcome_sent_at IS NULL
    `) as { count: string | number }[];
    return {
      count: Number(rows[0]?.count ?? 0),
      pendingWelcome: Number(pending[0]?.count ?? 0),
    };
  }
  const subscribers = await readSubscribersFromFile();
  const pending = (await readWelcomeQueueFromFile()).filter((e) => e.status === "pending").length;
  return { count: subscribers.length, pendingWelcome: pending };
});

/** Admin send: queues a newsletter job for every current subscriber. */
export const sendNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { subject?: string; body?: string };
    const subject = d.subject?.trim() ?? "";
    const body = d.body?.trim() ?? "";
    if (!subject) throw new Error("Subject is required");
    if (!body) throw new Error("Body is required");
    return { subject, body };
  })
  .handler(async ({ data }) => {
    const subscribers = await readSubscribers();
    const recipients = subscribers.map((s) => s.email);
    if (recipients.length === 0) {
      throw new Error("No subscribers yet");
    }
    const job = {
      subject: data.subject,
      body: data.body,
      recipients,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };
    const { appendFile: af } = await fs();
    await af(SEND_QUEUE_FILE, JSON.stringify(job) + "\n");
    return { success: true, recipientCount: recipients.length };
  });
