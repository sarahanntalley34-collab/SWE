import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { blogPosts } from "~/data/blog-posts";

const getBusinessName = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const cfg = JSON.parse(await readFile("site.json", "utf8")) as {
      businessName?: string;
    };
    return cfg.businessName?.trim() ?? "";
  } catch {
    return "";
  }
});

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    const businessName = await getBusinessName();
    return { post, businessName };
  },
  component: BlogPostPage,
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [{ title: "Post Not Found — Retro Engineering" }],
      };
    }
    return {
      meta: [
        { title: `${post.title} — Retro Engineering` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: `${post.title} — Retro Engineering` },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${post.title} — Retro Engineering` },
        { name: "twitter:description", content: post.excerpt },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Post not found
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          The blog post you're looking for doesn't exist.
        </p>
        <a
          href="/blog"
          className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          ← Back to blog
        </a>
      </div>
    </div>
  ),
});

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Components ────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────

function BlogPostPage() {
  const { post, businessName } = Route.useLoaderData();
  const name = businessName || "Retro Engineering";

  return (
    <div className="min-h-dvh">
      {/* ── Article Header ────────────────────────────────────────────── */}
      <Section className="flex min-h-[40vh] flex-col items-center justify-center text-center">
        <a
          href="/blog"
          className="mb-8 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Blog
        </a>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">
          {formatDate(post.date)}
        </p>
      </Section>

      {/* ── Article Content ────────────────────────────────────────────── */}
      <Section className="bg-gray-50 dark:bg-gray-900">
        <article className="prose-custom mx-auto max-w-3xl">
          <div
            className="blog-content text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <Section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Want to work with us?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            We build production-quality software end-to-end. Let's talk about
            your project.
          </p>
          <div className="mt-8">
            <a
              href="/contact"
              aria-label="Get in touch"
              className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Get in touch
            </a>
          </div>
        </div>
      </Section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
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
            href="mailto:hello@retro.engineering"
            aria-label="Send us an email"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            hello@retro.engineering
          </a>
        </div>
      </footer>
    </div>
  );
}
