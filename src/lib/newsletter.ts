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
 * - A successful subscription also queues a welcome email job (never sends directly).
 * - The admin page queues bulk newsletter sends for the lead to process.
 * - The welcome-email and newsletter-send queues stay file-based (JSONL) because the
 *   lead processes them locally.
 *
 * When `DATABASE_URL` is not set (bare local build without a connected database),
 * subscriber storage falls back to the original JSONL file so dev still works.
 */

export const SUBSCRIBERS_FILE = "/home/team/shared/newsletter-subscribers.jsonl";
export const WELCOME_QUEUE_FILE = "/home/team/shared/pending-welcome-emails.jsonl";
export const SEND_QUEUE_FILE = "/home/team/shared/pending-newsletter-sends.jsonl";

export type Subscriber = { email: string; subscribedAt: string };

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

/** Creates the subscriber table on first use (idempotent, per process). */
async function ensureSubscribersTable(sql: Sql): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

/** Subscribes a validated email: stores the subscriber AND queues a welcome-email job. */
export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { email?: string };
    if (!d.email || !isValidEmail(d.email)) {
      throw new Error("Invalid email");
    }
    return { email: d.email.trim() };
  })
  .handler(async ({ data }) => {
    const subscribedAt = new Date().toISOString();
    // Subscriber first, then the welcome-email queue job — never sent directly.
    const sql = await db();
    if (sql) {
      await ensureSubscribersTable(sql);
      await sql`
        INSERT INTO newsletter_subscribers (email)
        VALUES (${data.email})
        ON CONFLICT (email) DO NOTHING
      `;
    } else {
      const { appendFile: af } = await fs();
      await af(SUBSCRIBERS_FILE, JSON.stringify({ email: data.email, subscribedAt }) + "\n");
    }
    const { appendFile: af } = await fs();
    await af(
      WELCOME_QUEUE_FILE,
      JSON.stringify({ email: data.email, subscribedAt, status: "pending" }) + "\n",
    );
    return { success: true };
  });

/** Admin stats: total subscriber count. */
export const getNewsletterStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  if (sql) {
    await ensureSubscribersTable(sql);
    const rows = (await sql`SELECT COUNT(*) AS count FROM newsletter_subscribers`) as {
      count: string | number;
    }[];
    return { count: Number(rows[0]?.count ?? 0) };
  }
  const subscribers = await readSubscribersFromFile();
  return { count: subscribers.length };
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
