import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SiteHeader } from "~/components/SiteHeader";
import { Sentry } from "~/lib/sentry";
import appCss from "~/styles/app.css?url";

const SITE_TITLE = "Retro Engineering";
const SITE_DESCRIPTION =
  "Retro Engineering — a small, focused team that ships production-quality software end-to-end. Architecture, backend, frontend, and testing.";
const SITE_URL = "https://www.theretroengineering.com";

export const Route = createRootRoute({
  head: ({ matches }) => {
    // The root route's own match is always "/", so derive the current path
    // from the deepest matched route (last element of `matches`).
    const pathname = matches[matches.length - 1]?.pathname ?? "/";
    const canonicalUrl = `${SITE_URL}${pathname}`;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "google-site-verification", content: "-Nb6pSHQF5NvGnf5Hi5RRCGH3o9pZiZGkrxKosZSyOU" },
        { title: SITE_TITLE },
        { name: "description", content: SITE_DESCRIPTION },
        // Open Graph
        { property: "og:title", content: SITE_TITLE },
        { property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: SITE_TITLE },
        { name: "twitter:description", content: SITE_DESCRIPTION },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "canonical", href: canonicalUrl },
      ],
    };
  },
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Sentry.ErrorBoundary
        fallback={
          <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Something went wrong
            </h1>
            <p className="mt-4 max-w-md text-lg text-gray-600 dark:text-gray-400">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-8 inline-flex items-center rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Refresh page
            </button>
          </div>
        }
      >
        <Outlet />
      </Sentry.ErrorBoundary>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteHeader />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
