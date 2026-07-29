import * as Sentry from "@sentry/react";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: "https://2e05bb98bbea6685d50a76dace3e7f7a@o4511803722498048.ingest.us.sentry.io/4511804922658816",
  environment: isProduction ? "production" : "development",
  tracesSampleRate: isProduction ? 0.1 : 1.0,
});

export { Sentry };
