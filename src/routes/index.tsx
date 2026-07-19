import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";

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

export const Route = createFileRoute("/")({
  loader: () => getBusinessName(),
  component: Home,
});

// ── Data ──────────────────────────────────────────────────────────────────────

const services = [
  {
    title: "Architecture & Design",
    description:
      "System architecture, data modeling, and technical design that scales from day one.",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25M3 12h18M4.5 4.5l15 15m-15 0l15-15" />
      </svg>
    ),
  },
  {
    title: "Backend Development",
    description:
      "Robust APIs, database engineering, and server-side logic built for performance and reliability.",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7" />
      </svg>
    ),
  },
  {
    title: "Frontend Development",
    description:
      "Clean, accessible UIs with React, TypeScript, and Tailwind — responsive across every device.",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    title: "Testing & QA",
    description:
      "Comprehensive test suites — unit, integration, and E2E — so every release is confident.",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "End-to-End Delivery",
    description:
      "From first spec to deployed product — we own the full lifecycle so you don't have to.",
    icon: (
      <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
];

const steps = [
  {
    step: "01",
    title: "Spec",
    description: "We define scope, requirements, and acceptance criteria together — no ambiguity.",
  },
  {
    step: "02",
    title: "Build",
    description: "Clean, tested code lands in small, reviewable PRs. You see progress every week.",
  },
  {
    step: "03",
    title: "Review",
    description: "Every line is reviewed. QA runs automated and manual checks before anything ships.",
  },
  {
    step: "04",
    title: "Ship",
    description: "Deployed to production. Monitored. Handed off with documentation and confidence.",
  },
];

const projects = [
  {
    title: "Real-Time Metrics Dashboard",
    description:
      "Live-updating metrics dashboard with WebSocket-powered charts, JWT authentication, and role-based views. Built as a portfolio demo — admin and viewer roles with real-time CPU, memory, and request monitoring.",
    tags: ["React", "TypeScript", "WebSocket", "Recharts", "Hono", "PostgreSQL"],
    link: { href: "/demo", label: "View Demo" },
  },
  {
    title: "E-Commerce API & Storefront",
    description:
      "Headless commerce backend with inventory management, Stripe integration, and a Next.js storefront.",
    tags: ["Node.js", "Stripe", "Next.js", "PostgreSQL"],
  },
  {
    title: "Internal Tools Platform",
    description:
      "Admin panel and workflow automation tools for a logistics company — replaced a spreadsheet-driven process.",
    tags: ["React", "REST APIs", "PostgreSQL", "Tailwind CSS"],
  },
];

// ── Components ─────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
      {children}
    </h2>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`px-6 py-20 sm:px-8 lg:px-12 ${className}`}>{children}</section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function Home() {
  const businessName = Route.useLoaderData();
  const name = businessName || "Shipwright Engineering";

  return (
    <div className="min-h-dvh">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="flex min-h-dvh flex-col items-center justify-center text-center">
        <span className="mb-6 inline-flex items-center gap-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          Available for projects
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          We ship production-quality software,{" "}
          <span className="text-indigo-600 dark:text-indigo-400">end-to-end</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          A small, focused engineering team that takes your product from architecture through
          deployment — without the overhead of a larger org.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/contact"
            aria-label="Start a project with Shipwright Engineering"
            className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Start a Project
          </a>
          <a
            href="#services"
            aria-label="View our services"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            What we offer
          </a>
        </div>
      </Section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <Section id="services" className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <SectionHeading>What we do</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Full-stack engineering services for teams that need to ship — without compromise.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="mb-4 text-indigo-600 dark:text-indigo-400">{svc.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {svc.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {svc.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href="/services"
              aria-label="View pricing for our services"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              View pricing
            </a>
          </div>
        </div>
      </Section>

      {/* ── How We Work ───────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-6xl">
          <SectionHeading>How we work</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            A repeatable process that turns ideas into shipped products — predictably.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <span className="text-5xl font-bold tracking-tight text-indigo-100 dark:text-indigo-950">
                  {s.step}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {s.description}
                </p>
                {/* Divider on mobile/tablet */}
                {i < steps.length - 1 && (
                  <div className="mt-6 h-px bg-gray-200 dark:bg-gray-800 lg:hidden" />
                )}
                {/* Connector arrow on desktop */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-5 top-10 hidden lg:flex items-center text-gray-300 dark:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Portfolio ─────────────────────────────────────────────────────── */}
      <Section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <SectionHeading>Selected work</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Representative projects that showcase the kind of work we deliver.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div
                key={p.title}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {p.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {"link" in p && p.link && (
                  <div className="mt-5">
                    <a
                      href={p.link.href}
                      className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
                    >
                      {p.link.label}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA Footer ────────────────────────────────────────────────────── */}
      <Section className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Ready to ship?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Let's talk about your project. No obligation — just a conversation about what you're
            building and how we can help.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/contact"
              aria-label="Get in touch with Shipwright Engineering"
              className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
              Get in touch
            </a>
            <a
              href="#services"
              aria-label="Learn more about our services"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Learn more
            </a>
          </div>
        </div>
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 px-6 py-8 dark:border-gray-800 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a
              href="/services"
              aria-label="Services and pricing"
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              Services
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
            href="mailto:hello@shipwright.engineering"
            aria-label="Send us an email"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            hello@shipwright.engineering
          </a>
        </div>
      </footer>
    </div>
  );
}
