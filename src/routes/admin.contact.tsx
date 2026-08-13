import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ContactMessage } from "~/lib/contact";

/**
 * Internal contact-inquiries admin page. Not linked publicly; gated behind a
 * ?admin=true query param (obscurity only — real auth comes later). The gate
 * mirrors src/routes/admin.newsletter.tsx exactly.
 *
 * The list is fetched client-side from GET /api/contact-messages (a plain
 * route dispatched from serve.ts in production and the vite dev middleware in
 * dev — server functions 403 on the published host).
 */
export const Route = createFileRoute("/admin/contact")({
  validateSearch: (search: Record<string, unknown>) => ({
    // The router may parse ?admin=true as a JSON boolean or keep it a string —
    // accept both so the admin gate actually opens with ?admin=true.
    admin: search.admin === true || search.admin === "true",
  }),
  component: AdminContact,
  head: () => ({
    meta: [
      { title: "Contact Inquiries — Retro Engineering" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; messages: ContactMessage[] };

function AdminContact() {
  const { admin } = Route.useSearch();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ status: "loading" });
      try {
        const res = await fetch("/api/contact-messages");
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = (await res.json()) as { messages?: ContactMessage[] };
        if (!cancelled) {
          setState({ status: "ready", messages: data.messages ?? [] });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error ? error.message : "Could not load inquiries",
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <div className="min-h-dvh bg-gray-50 px-6 py-16 dark:bg-gray-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          Admin
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Contact Inquiries
        </h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          Messages submitted through the contact form, newest first.
        </p>

        <div className="mt-8">
          {state.status === "loading" && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading inquiries…
            </p>
          )}
          {state.status === "error" && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Could not load inquiries: {state.message}
            </p>
          )}
          {state.status === "ready" && state.messages.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No inquiries yet.
            </p>
          )}
          {state.status === "ready" && state.messages.length > 0 && (
            <ul className="grid gap-4">
              {state.messages.map((m) => (
                <li
                  key={m.id ?? `${m.email}-${m.submittedAt}`}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {m.name}
                      {m.company ? (
                        <span className="font-normal text-gray-500 dark:text-gray-400">
                          {" "}
                          · {m.company}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(m.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
                    {m.email}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {m.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
