import { createServerFn } from "@tanstack/react-start";
import { appendFile, readFile } from "node:fs/promises";

/**
 * Newsletter infrastructure — subscribers and delivery queues.
 *
 * - Subscribers are appended to a JSONL file (one {email, subscribedAt} per line).
 * - A successful subscription also queues a welcome email job (never sends directly).
 * - The admin page queues bulk newsletter sends for the lead to process.
 */

export const SUBSCRIBERS_FILE = "/home/team/shared/newsletter-subscribers.jsonl";
export const WELCOME_QUEUE_FILE = "/home/team/shared/pending-welcome-emails.jsonl";
export const SEND_QUEUE_FILE = "/home/team/shared/pending-newsletter-sends.jsonl";

export type Subscriber = { email: string; subscribedAt: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Reads all subscribers from the JSONL file, skipping malformed lines. */
export async function readSubscribers(): Promise<Subscriber[]> {
  let raw: string;
  try {
    raw = await readFile(SUBSCRIBERS_FILE, "utf8");
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

/** Subscribes a validated email: appends the subscriber record AND a welcome-email job. */
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
    const record = { email: data.email, subscribedAt };
    // Subscriber first, then the welcome-email queue job — never sent directly.
    await appendFile(SUBSCRIBERS_FILE, JSON.stringify(record) + "\n");
    await appendFile(
      WELCOME_QUEUE_FILE,
      JSON.stringify({ ...record, status: "pending" }) + "\n",
    );
    return { success: true };
  });

/** Admin stats: total subscriber count. */
export const getNewsletterStats = createServerFn({ method: "GET" }).handler(async () => {
  const subscribers = await readSubscribers();
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
    await appendFile(SEND_QUEUE_FILE, JSON.stringify(job) + "\n");
    return { success: true, recipientCount: recipients.length };
  });
