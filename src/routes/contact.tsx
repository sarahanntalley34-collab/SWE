import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile } from "node:fs/promises";
import { useState, type FormEvent } from "react";

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

export const Route = createFileRoute("/contact")({
  loader: () => getBusinessName(),
  component: Contact,
});

// ── Validation ─────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.message.trim()) {
    errors.message = "A brief project description is required.";
  }

  return errors;
}

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

function Contact() {
  const businessName = Route.useLoaderData();
  const name = businessName || "Shipwright Engineering";

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Success — show confirmation and clear form
    setSubmitted(true);
    setForm({ name: "", email: "", company: "", message: "" });
    setErrors({});
  };

  const inputClasses =
    "block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20";

  const errorClasses = "mt-1.5 text-sm text-red-600 dark:text-red-400";

  if (submitted) {
    return (
      <div className="min-h-dvh">
        <Section className="flex min-h-dvh flex-col items-center justify-center text-center">
          <div className="mx-auto max-w-lg">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950">
              <svg
                className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Thanks for reaching out
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              We'll be in touch within 24 hours.
            </p>
            <div className="mt-8">
              <a
                href="/"
                aria-label="Back to home page"
                className="inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
              >
                Back to home
              </a>
            </div>
          </div>
        </Section>

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

  return (
    <div className="min-h-dvh">
      <Section className="flex min-h-dvh flex-col items-center justify-center">
        <div className="mx-auto w-full max-w-lg">
          <SectionHeading>Start a project</SectionHeading>
          <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            Tell us what you're building. No obligation — just a conversation about
            your project and how we can help.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your full name"
                className={`mt-2 ${inputClasses}`}
              />
              {errors.name && <p className={errorClasses}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="you@company.com"
                className={`mt-2 ${inputClasses}`}
              />
              {errors.email && <p className={errorClasses}>{errors.email}</p>}
            </div>

            {/* Company (optional) */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Company <span className="text-sm font-normal text-gray-400">(optional)</span>
              </label>
              <input
                id="company"
                type="text"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Your company or organization"
                className={`mt-2 ${inputClasses}`}
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Project description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Tell us about your project, timeline, and anything else you think we should know."
                className={`mt-2 resize-y ${inputClasses}`}
              />
              {errors.message && <p className={errorClasses}>{errors.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 sm:w-auto"
            >
              Send message
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
            Prefer email?{" "}
            <a
              href="mailto:hello@shipwright.engineering"
              aria-label="Send us an email instead"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              hello@shipwright.engineering
            </a>
          </p>
        </div>
      </Section>

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
