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

export const Route = createFileRoute("/services")({
  loader: () => getBusinessName(),
  component: Services,
});

// ── Data ──────────────────────────────────────────────────────────────────────

const products = [
  {
    name: "Feature Sprint",
    price: "$2,500",
    description: "Scoped feature: spec, build, review, ship. 1-2 week timeline.",
    paymentLink: "https://buy.stripe.com/14A6oHcSV3CS6nE122gEg0b",
    highlight: false,
  },
  {
    name: "MVP Build",
    price: "$7,500",
    description:
      "Full product: architecture, backend, frontend, tests, deployment. 4-6 weeks.",
    paymentLink: "https://buy.stripe.com/28EcN5dWZdds3bsaCCgEg08",
    highlight: true,
  },
  {
    name: "Technical Audit",
    price: "$1,250",
    description: "Architecture review, code audit, recommendations report. 1 week.",
    paymentLink: "https://buy.stripe.com/8x214n5qt0qGaDUaCCgEg09",
    highlight: false,
  },
  {
    name: "Engineering Retainer",
    price: "$2,000/mo",
    description:
      "Monthly retainer for maintenance, bug fixes, incremental features.",
    paymentLink: "https://buy.stripe.com/cNi00jg578Xc13kaCCgEg0a",
    highlight: false,
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

function StripeIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 2.5C5.5 2.5 4 3.5 4 5s1.5 2.5 3.5 2.5c1.5 0 3 .5 3 2s-1.5 2.5-3 2.5S4.5 11.5 4 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 1.5v13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function Services() {
  const businessName = Route.useLoaderData();
  const name = businessName || "Shipwright Engineering";

  return (
    <div className="min-h-dvh">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="mb-6 inline-flex items-center gap-x-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          Transparent pricing
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
          Services{" "}
          <span className="text-indigo-600 dark:text-indigo-400">&amp; Pricing</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          Clear, upfront pricing for every engagement. No hidden fees, no surprise
          invoices — just quality engineering delivered on time.
        </p>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-500">
          Every engagement includes code review, automated testing, and a
          handoff-ready deliverable. We work async by default with weekly syncs.
        </p>
      </Section>

      {/* ── Product Cards ─────────────────────────────────────────────────── */}
      <Section className="bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <SectionHeading>What we offer</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Four ways to work with us — from quick sprints to ongoing partnerships.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.name}
                className={`flex flex-col rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-gray-950 ${
                  product.highlight
                    ? "border-indigo-300 ring-1 ring-indigo-200 dark:border-indigo-700 dark:ring-indigo-800"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              >
                {product.highlight && (
                  <span className="mb-4 inline-flex self-start rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {product.price}
                </p>
                {product.name === "Engineering Retainer" && (
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    billed monthly, cancel anytime
                  </p>
                )}
                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {product.description}
                </p>
                <a
                  href={product.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Purchase ${product.name} for ${product.price}`}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    product.highlight
                      ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-400"
                      : "bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  }`}
                >
                  <StripeIcon />
                  Buy Now
                </a>
                <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-600">
                  Secure payment via Stripe
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-6xl">
          <SectionHeading>How engagements work</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Purchase directly and we'll kick off within 48 hours — or reach out
            first to scope the details.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Purchase
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Buy the engagement that fits your needs via Stripe. You'll receive
                a confirmation within minutes.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Kickoff
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                We schedule a 30-minute call within 48 hours to align on scope,
                timeline, and deliverables.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ship
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                We build, review, test, and deliver. You get weekly updates and a
                production-ready handoff.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Custom CTA ─────────────────────────────────────────────────────── */}
      <Section className="bg-gray-50 text-center dark:bg-gray-900">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Need something custom?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Every project is different. If none of these fit exactly, let's talk
            about what you need and we'll put together a tailored proposal.
          </p>
          <div className="mt-8">
            <a
              href="/contact"
              aria-label="Get in touch for custom services"
              className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Get in touch
            </a>
          </div>
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
