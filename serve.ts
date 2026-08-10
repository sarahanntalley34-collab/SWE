// Production server for the built site. The TanStack Start build emits a portable
// fetch handler (dist/server/server.js) plus static client assets (dist/client);
// this wraps them in a Bun server on port 3000 — static files first, SSR for the
// rest. Run `bun run build` before starting. Restart it with `bun run publish`.
//
// Starting a new instance supersedes the old one: it frees the port no matter
// which user owns the current server (provisioning starts it as `engine`; a team
// member's `bun run publish` runs as their own user), so publish never collides
// with an already-running server. Every sandbox user has passwordless sudo, so
// the takeover works across user boundaries.
import * as Sentry from "@sentry/bun";
import handler from "./dist/server/server.js";

Sentry.init({
  dsn: "https://24908d5fb6f273b1f7a0aa7038387ce4@o4511724818464768.ingest.us.sentry.io/4511724822790144",
  environment: "production",
  tracesSampleRate: 0.1,
});

// Pinned, NOT read from the environment. The published preview URL
// (<label>.<PUBLIC_SITE_DOMAIN>) is reverse-proxied to 0.0.0.0:3000 inside the
// sandbox, so the default site MUST bind there. Bun auto-loads .env files, so
// honouring process.env.PORT/HOST would let a stray env var or a .env in the site
// dir silently move the site off :3000 (or onto loopback) and break the public URL.
const PORT = 3000;
const HOST = "0.0.0.0";
const CLIENT_DIR = `${import.meta.dir}/dist/client`;
const DEMO_BACKEND = "http://localhost:3001";

// Free PORT regardless of which user owns the current listener. lsof runs under
// sudo so it can see (and the kill can signal) a process owned by another user;
// the loop waits for the socket to actually release before we bind.
const freePort =
  `for _ in $(seq 1 25); do ` +
  `pids=$(lsof -t -iTCP:${String(PORT)} -sTCP:LISTEN 2>/dev/null || true); ` +
  `if [ -z "$pids" ]; then exit 0; fi; ` +
  `kill $pids 2>/dev/null || true; sleep 0.2; ` +
  `done`;

// Take over the port, re-freeing and retrying if another publish grabbed it in the
// gap between freeing and binding (last publish wins). Bun.serve throws EADDRINUSE
// synchronously, so without this a raced publish would die while the shell already
// reported success.
for (let attempt = 1; ; attempt++) {
  await Bun.$`sudo sh -c ${freePort}`.quiet().nothrow();
  try {
    Bun.serve({
      port: PORT,
      hostname: HOST,
      async fetch(req, server) {
        const url = new URL(req.url);
        const { pathname } = url;

        // WebSocket proxy: /demo/ws* → upstream demo backend
        if (pathname === "/demo/ws" || pathname.startsWith("/demo/ws/")) {
          const upstreamPath = pathname.slice("/demo".length) || "/";
          if (
            server.upgrade(req, {
              data: { type: "demo-ws", upstreamPath, search: url.search },
            })
          ) {
            return; // upgraded
          }
          return new Response("WebSocket upgrade failed", { status: 400 });
        }

        // Demo proxy: forward /demo/* to the demo backend (regular HTTP)
        if (pathname.startsWith("/demo")) {
          const upstreamPath = pathname.slice("/demo".length) || "/";
          const upstreamUrl = `${DEMO_BACKEND}${upstreamPath}${url.search}`;
          const upstreamReq = new Request(upstreamUrl, {
            method: req.method,
            headers: req.headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
          });
          try {
            return await fetch(upstreamReq);
          } catch (error) {
            Sentry.captureException(error);
            return new Response("Demo backend unavailable", { status: 502 });
          }
        }

// Newsletter API: subscribers list (JSON). TanStack Start 1.158 doesn't
// auto-serve files under routes/api, so dispatch it here explicitly.
if (pathname === "/api/newsletter-subscribers") {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { GET: newsletterSubscribersGet } = await import(
      "./src/routes/api/newsletter-subscribers.ts"
    );
    return await newsletterSubscribersGet();
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Failed to read subscribers" }, { status: 500 });
  }
}

// Newsletter API: pending welcome emails (JSON) — the lead's welcome-email
// queue, backed by the DB (welcome_sent_at IS NULL).
if (pathname === "/api/newsletter/pending-welcome") {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { GET: pendingWelcomeGet } = await import(
      "./src/routes/api/newsletter-pending-welcome.ts"
    );
    return await pendingWelcomeGet();
  } catch (error) {
    Sentry.captureException(error);
    return Response.json(
      { error: "Failed to list pending welcome emails" },
      { status: 500 },
    );
  }
}

// Newsletter API: mark welcome emails as sent (JSON POST).
if (pathname === "/api/newsletter/mark-welcome-sent") {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { POST: markWelcomeSentPost } = await import(
      "./src/routes/api/newsletter-mark-welcome-sent.ts"
    );
    return await markWelcomeSentPost(req);
  } catch (error) {
    Sentry.captureException(error);
    return Response.json(
      { error: "Failed to mark welcome emails sent" },
      { status: 500 },
    );
  }
}

        // Static files
        if (pathname !== "/") {
          const file = Bun.file(CLIENT_DIR + pathname);
          if (await file.exists()) return new Response(file);
        }

        // SSR fallback
        try {
          return await (
            handler as { fetch: (r: Request) => Response | Promise<Response> }
          ).fetch(req);
        } catch (error) {
          Sentry.captureException(error);
          throw error;
        }
      },
      websocket: {
        open(ws) {
          const data = ws.data as
            | { type?: string; upstreamPath?: string; search?: string }
            | undefined;
          if (data?.type !== "demo-ws") return;

          // Connect to the upstream demo backend WebSocket, preserving the
          // proxied path and query (/demo/ws/health → /ws/health,
          // /demo/ws?token=… → /ws?token=…).
          const upstream = new WebSocket(
            `ws://localhost:3001${data.upstreamPath || "/ws"}${data.search || ""}`,
          );
          (ws as any).__upstream = upstream;

          upstream.onmessage = (evt) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(
                typeof evt.data === "string"
                  ? evt.data
                  : new Uint8Array(evt.data as ArrayBuffer),
              );
            }
          };
          upstream.onclose = () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
          };
          upstream.onerror = () => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
          };
        },
        message(ws, message) {
          const upstream = (ws as any).__upstream as WebSocket | undefined;
          if (upstream && upstream.readyState === WebSocket.OPEN) {
            upstream.send(message);
          }
        },
        close(ws) {
          const upstream = (ws as any).__upstream as WebSocket | undefined;
          if (upstream) upstream.close();
        },
      },
    });
    break;
  } catch (err) {
    if (attempt >= 10) throw err;
    await Bun.sleep(200);
  }
}

console.log(`team-site serving on http://${HOST}:${String(PORT)}`);
