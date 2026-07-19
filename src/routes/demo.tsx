import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
});

function DemoPage() {
  return (
    <div className="min-h-dvh">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            Portfolio Demo
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            Real-Time Metrics Dashboard
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Live-updating metrics dashboard with WebSocket-powered charts, JWT
            authentication, and role-based views. Monitor CPU, memory, and
            request metrics in real time — switch between admin and viewer roles
            to see how the dashboard adapts.
          </p>
        </div>
      </section>

      {/* ── Demo Credentials ──────────────────────────────────────────────── */}
      <section className="px-6 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Demo Credentials
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Choose a role below to explore the dashboard. Each role sees a
            different set of metrics and controls.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* Admin Card */}
            <div className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-900 dark:bg-gray-950">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin
                </h3>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Full access — CPU, Memory, Requests, and all controls.
              </p>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <CredentialRow label="Email" value="admin@demo.com" />
                <CredentialRow label="Password" value="password123" />
              </div>
            </div>

            {/* Viewer Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Viewer
                </h3>
              </div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Read-only access — CPU and Memory charts only.
              </p>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                <CredentialRow label="Email" value="viewer@demo.com" />
                <CredentialRow label="Password" value="password123" />
              </div>
            </div>
          </div>

          {/* ── Note ──────────────────────────────────────────────────────── */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                Demo mode:
              </span>{" "}
              This demo backend runs in demo mode — no database required. Log in
              with the credentials above to see the live dashboard.
            </p>
          </div>

          {/* ── Launch Button ─────────────────────────────────────────────── */}
          <div className="mt-10 text-center">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Launch Demo
            </a>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              Opens the dashboard frontend in a new tab.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 px-6 py-8 dark:border-gray-800 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} Retro Engineering. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Home
            </a>
            <a
              href="/services"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Services
            </a>
            <a
              href="/contact"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Contact
            </a>
          </div>
          <a
            href="mailto:hello@retro.engineering"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            hello@retro.engineering
          </a>
        </div>
      </footer>
    </div>
  );
}

function CredentialRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
        {label}
      </span>
      <code className="rounded bg-white px-2.5 py-1 text-xs font-mono text-gray-900 dark:bg-gray-800 dark:text-gray-200">
        {value}
      </code>
    </div>
  );
}
