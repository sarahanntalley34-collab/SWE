import * as Sentry from "@sentry/react";

// The client bundle imports this module through the root route. Keeping the
// initialization here lets TanStack Start report render and route errors while
// avoiding a second initialization during SSR.
if (typeof window !== "undefined") {
  Sentry.init({
    dsn: "https://24908d5fb6f273b1f7a0aa7038387ce4@o4511724818464768.ingest.us.sentry.io/4511724822790144",
    environment: "production",
    tracesSampleRate: 0.1,
  });
}

export { Sentry };
