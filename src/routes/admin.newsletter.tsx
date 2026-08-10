import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { getNewsletterStats, sendNewsletter } from "~/lib/newsletter";

/**
 * Internal newsletter admin page. Not linked publicly; gated behind a
 * ?admin=true query param (obscurity only — real auth comes later).
 */
export const Route = createFileRoute("/admin/newsletter")({
  validateSearch: (search: Record<string, unknown>) => ({
    // The router may parse ?admin=true as a JSON boolean or keep it a string —
    // accept both so the admin gate actually opens with ?admin=true.
    admin: search.admin === true || search.admin === "true",
  }),
  loader: () => getNewsletterStats(),
  component: AdminNewsletter,
  head: () => ({
    meta: [
      { title: "Newsletter Admin — Retro Engineering" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminNewsletter() {
  const { admin } = Route.useSearch();
  const { count } = Route.useLoaderData();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!admin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Not found
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          This page is not publicly available.
        </p>
      </div>
    );
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setBusy(true);
    try {
      const res = await sendNewsletter({ data: { subject, body } });
      setResult({
        ok: true,
        message: `Queued for ${res.recipientCount} subscriber${res.recipientCount === 1 ? "" : "s"}. Nothing is sent until the queue is processed.`,
      });
      setSubject("");
      setBody("");
    } catch {
      setResult({
        ok: false,
        message:
          "Could not queue the newsletter — check the subject and body, and that there is at least one subscriber.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-2xl">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          Admin
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Newsletter
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          Compose a newsletter and queue it for delivery to all subscribers.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Subscribers
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
            {count}
          </p>
        </div>

        <form
          onSubmit={handleSend}
          className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="This month's engineering digest"
            className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <label
            htmlFor="body"
            className="mt-6 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Body
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={10}
            placeholder="Write the newsletter content here…"
            className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
          />
          <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Queued as a job — nothing is sent until the queue is processed.
            </p>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Queuing…" : "Send to all subscribers"}
            </button>
          </div>
          {result && (
            <p
              className={`mt-4 text-sm font-medium ${
                result.ok
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {result.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
