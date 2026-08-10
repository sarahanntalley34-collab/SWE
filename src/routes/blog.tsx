import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { NewsletterSignup } from "~/components/NewsletterSignup";
import { blogPosts } from "~/data/blog-posts";
import { BUSINESS_NAME } from "~/lib/business";

export const Route = createFileRoute("/blog")({
  loader: () => BUSINESS_NAME,
  component: Blog,
  head: () => ({
    meta: [
      { title: "Blog — Retro Engineering" },
      {
        name: "description",
        content:
          "Engineering insights from Retro Engineering — deep-dives on architecture, real-time systems, SaaS development, and lessons from shipping production software.",
      },
      { property: "og:title", content: "Blog — Retro Engineering" },
      {
        property: "og:description",
        content:
          "Engineering insights from Retro Engineering — deep-dives on architecture, real-time systems, SaaS development, and lessons from shipping production software.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Blog — Retro Engineering" },
      {
        name: "twitter:description",
        content:
          "Engineering insights from Retro Engineering — deep-dives on architecture, real-time systems, SaaS development, and lessons from shipping production software.",
      },
    ],
  }),
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Components ─────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
      {children}
    </h2>
  );
}

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

// ── Page ───────────────────────────────────────────────────────────────────────

function Blog() {
  const businessName = Route.useLoaderData();
  const name = businessName || "Retro Engineering";

  // This route doubles as the layout for the article route (src/routes/blog/$slug.tsx,
  // id "/blog/$slug"), which is registered as a child of "/blog" in the route tree.
  // When the leaf matched route is the article child, render it through <Outlet />
  // instead of this listing; /blog itself (leaf === "/blog") renders the grid below.
  const leafRouteId = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId,
  });
  if (leafRouteId === "/blog/$slug") {
    return <Outlet />;
  }

  // Newest first (dates are ISO YYYY-MM-DD, so lexicographic == chronological).
  const sortedPosts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="min-h-dvh">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <span className="mb-6 inline-flex items-center gap-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          Engineering insights
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Blog{" "}
          <span className="text-indigo-600 dark:text-indigo-400">&amp; Writing</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Deep-dives on architecture, real-time systems, SaaS development, and
          lessons learned from shipping production software.
        </p>
      </Section>

      {/* ── Blog Posts Grid ───────────────────────────────────────────────── */}
      <Section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <SectionHeading>Latest posts</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Thoughts and technical write-ups from the Retro Engineering team.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPosts.map((post) => (
              <div
                key={post.slug}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-500">
                  {formatDate(post.date)}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {post.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5">
                  <a
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Read more{" "}
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Newsletter CTA ─────────────────────────────────────────────────── */}
      <Section className="text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Get engineering insights in your inbox
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            One email per week — practical advice on architecture, shipping, and
            running a lean engineering team. No spam, unsubscribe anytime.
          </p>
          <NewsletterSignup className="mt-6" />
        </div>
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 px-6 py-8 dark:border-gray-800 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/"
              aria-label="Back to home"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Home
            </a>
            <a
              href="/services"
              aria-label="Services and pricing"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Services
            </a>
            <a
              href="/blog"
              aria-label="Read our blog"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Blog
            </a>
            <a
              href="/contact"
              aria-label="Contact us"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Contact
            </a>
          </div>
          <a
            href="mailto:retro-engineering-71ae8222@ctomail.io"
            aria-label="Send us an email"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            retro-engineering-71ae8222@ctomail.io
          </a>
        </div>
      </footer>
    </div>
  );
}
