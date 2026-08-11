import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";

/**
 * The SaaS Technical Health Checklist — a newsletter lead magnet.
 *
 * Readers land here from blog posts (and links in the newsletter area), see a
 * preview of the checklist, and join the newsletter to unlock the full
 * printable version. The form posts to the existing plain API route
 * /api/newsletter/subscribe (NOT a server fn — server functions 403 on the
 * published host). On success the full checklist is revealed on the page.
 */
export const Route = createFileRoute("/checklist")({
  component: ChecklistPage,
  head: () => ({
    meta: [
      {
        title: "The SaaS Technical Health Checklist — Retro Engineering",
      },
      {
        name: "description",
        content:
          "A practical, no-hype checklist for SaaS founders: 20+ concrete checks across architecture, testing, monitoring, security, backups, performance, dependencies, and docs.",
      },
      {
        property: "og:title",
        content: "The SaaS Technical Health Checklist — Retro Engineering",
      },
      {
        property: "og:description",
        content:
          "20+ concrete checks across architecture, testing, monitoring, security, backups, performance, dependencies, and docs. Free with the newsletter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "The SaaS Technical Health Checklist — Retro Engineering",
      },
      {
        name: "twitter:description",
        content:
          "A practical, no-hype checklist for SaaS founders: architecture, testing, monitoring, security, backups, performance, dependencies, and docs.",
      },
    ],
  }),
});

// ── Data ─────────────────────────────────────────────────────────────────────
const CHECKLIST_CATEGORIES = [
  {
    category: "Architecture",
    items: [
      "Every deploy is fully automated from main — no manual steps, no one-person rituals.",
      "New services and abstractions earn their place: the system only grows when there is a concrete reason.",
      "The data model is written down, and schema changes go through review before they land.",
      "APIs have consistent shapes and validation — clients never have to guess at a response.",
    ],
  },
  {
    category: "Testing",
    items: [
      "The critical paths — auth, billing, data export — have automated tests that run on every pull request.",
      "A failing test blocks the deploy. Nobody has to remember to run the suite.",
      "Test data is disposable and deterministic, so tests pass today, next month, and in a fresh checkout.",
      "The suite is fast enough to run before every push. If it isn't, slow tests are treated as a bug.",
    ],
  },
  {
    category: "Monitoring & Observability",
    items: [
      "Alerts fire on real failure signals — 5xx spikes, error rate, queue depth — not on noise nobody acts on.",
      "The pages and API calls users depend on are measured, so regressions show up as numbers, not complaints.",
      "Logs are searchable from one place, and request IDs connect frontend, backend, and database.",
    ],
  },
  {
    category: "Security",
    items: [
      "Secrets live in the platform's secret store — never in the repo, docs, or chat history.",
      "Auth and authorization are enforced server-side. Hiding a button in the UI is not a permission.",
      "Dependencies are scanned for known vulnerabilities on a schedule, and every critical finding has an owner.",
    ],
  },
  {
    category: "Backups & Recovery",
    items: [
      "The database is backed up automatically — and restores are actually tested. A backup you've never restored is a hope.",
      "A recovery runbook exists, and someone has walked through it in the last six months.",
    ],
  },
  {
    category: "Performance",
    items: [
      "Slow queries show up in the database's query log and get fixed before they become outages.",
      "The screens users touch first load fast on a normal connection — measured, not assumed.",
    ],
  },
  {
    category: "Dependencies",
    items: [
      "Upgrades happen on a cadence, not only when something breaks — and breaking changes are planned for.",
      "No dependency is pinned forever 'because it works'. Every pin has a reason and a review date.",
    ],
  },
  {
    category: "Docs & Onboarding",
    items: [
      "A new engineer can run the whole stack locally from the README — no tribal knowledge required.",
      "Runbooks are written down before they're needed at 2am.",
      "Architecture decisions record the reasons behind them, so the next change starts from context, not archaeology.",
    ],
  },
];

// A few items shown before subscribing — enough to prove the checklist is real,
// without giving the whole thing away.
const PREVIEW_ITEMS = [
  "Every deploy is fully automated from main — no manual steps, no one-person rituals.",
  "The critical paths — auth, billing, data export — have automated tests that run on every pull request.",
  "Alerts fire on real failure signals — 5xx spikes, error rate, queue depth — not on noise nobody acts on.",
  "Secrets live in the platform's secret store — never in the repo, docs, or chat history.",
  "The database is backed up automatically — and restores are actually tested.",
  "Architecture decisions record the reasons behind them, so the next change starts from context, not archaeology.",
];

const TOTAL_ITEM_COUNT = CHECKLIST_CATEGORIES.reduce(
  (sum, c) => sum + c.items.length,
  0,
);

// ── Components ───────────────────────────────────────────────────────────────
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`px-6 py-20 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChecklistBlock() {
  return (
    <div className="space-y-10">
      {CHECKLIST_CATEGORIES.map((group) => (
        <div key={group.category}>
          <h3 className="mb-4 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {group.category}
          </h3>
          <ul className="space-y-3">
            {group.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-base leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <CheckIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
function ChecklistPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        throw new Error(`Subscribe failed (${res.status})`);
      }
      setSubscribed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Section className="flex flex-col items-center justify-center bg-gray-50 text-center dark:bg-gray-900">
        <span className="mb-6 inline-flex items-center rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          Free for newsletter subscribers
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          The SaaS Technical Health Checklist
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Most SaaS problems are the same twenty problems — deploy rituals,
          untested critical paths, alerts nobody acts on, backups nobody has
          restored. This checklist names them plainly, in plain language, so
          you can check your own product in an afternoon.
        </p>
        <p className="mt-4 max-w-2xl text-sm text-gray-500 dark:text-gray-500">
          {TOTAL_ITEM_COUNT} concrete checks across {CHECKLIST_CATEGORIES.length}{" "}
          categories: architecture, testing, monitoring, security, backups,
          performance, dependencies, and docs. No scores, no hype — just things
          worth being able to say yes to.
        </p>
      </Section>

      {/* ── Capture (hidden when subscribed / when printing) ─────────── */}
      {!subscribed && (
        <Section className="no-print">
          <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Get the full checklist
            </h2>
            <p className="mt-3 text-center text-base text-gray-600 dark:text-gray-400">
              Join the newsletter — get the checklist and a weekly post on
              shipping SaaS.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                aria-label="Email address"
                className="block w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Subscribing…" : "Get the checklist"}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <p className="mt-6 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-500">
              One email a week on shipping SaaS — practical advice, no spam,
              unsubscribe anytime. Your email is only used to send the
              newsletter and the checklist.
            </p>
          </div>
          {/* Preview — enough to prove it's real */}
          <div className="mx-auto mt-16 max-w-2xl">
            <h2 className="text-center text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              A preview of what's inside
            </h2>
            <ul className="mt-6 space-y-3">
              {PREVIEW_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base leading-relaxed text-gray-600 dark:text-gray-400"
                >
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-500">
              …and {TOTAL_ITEM_COUNT - PREVIEW_ITEMS.length} more, organized by
              category and printable.
            </p>
          </div>
        </Section>
      )}

      {/* ── Full checklist (revealed after subscribing) ──────────────── */}
      {subscribed && (
        <Section className="bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              ✓ You're subscribed — here's the full checklist
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              Work through it in an afternoon. Use the button below to print it
              or save it as a PDF — that's your printable copy.
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
            >
              Print / Save as PDF
            </button>
          </div>
          <div className="checklist-print mx-auto mt-14 max-w-2xl">
            <div className="mb-10 border-b border-gray-200 pb-6 dark:border-gray-800">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                The SaaS Technical Health Checklist
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                {TOTAL_ITEM_COUNT} checks across {CHECKLIST_CATEGORIES.length}{" "}
                categories — from Retro Engineering's newsletter.
              </p>
            </div>
            <ChecklistBlock />
          </div>
        </Section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="no-print border-t border-gray-200 px-6 py-8 dark:border-gray-800 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Retro Engineering. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/" aria-label="Back to home" className="hover:text-gray-700 dark:hover:text-gray-300">
              Home
            </a>
            <a href="/services" aria-label="Services and pricing" className="hover:text-gray-700 dark:hover:text-gray-300">
              Services
            </a>
            <a href="/blog" aria-label="Read our blog" className="hover:text-gray-700 dark:hover:text-gray-300">
              Blog
            </a>
            <a href="/contact" aria-label="Contact us" className="hover:text-gray-700 dark:hover:text-gray-300">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
