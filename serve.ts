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

// Demo product, served in-process: the demo app is a Bun + Hono server whose
// fetch handler and WebSocket logic we drive directly, so /demo works on the
// published host without any external backend process. import.meta.main is
// false in the demo module here, so importing it does NOT bind port 3001.
import { app as demoApp, serveStatic as demoServeStatic } from "./demo/src/index.ts";
import {
  handleWebSocketOpen,
  handleWebSocketClose,
} from "./demo/src/ws/index.ts";
import {
  addRealtimeClient,
  removeRealtimeClient,
} from "./demo/src/realtime.ts";

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

// Demo backend override. The published host only receives DATABASE_URL, so the
// demo must run inside this server: DEMO_IN_PROCESS is the default. Setting
// DEMO_BACKEND_URL (e.g. a separately-run demo on localhost:3001 in dev) routes
// /demo/* through the proxy below instead, keeping the old topology available.
const DEMO_BACKEND = process.env.DEMO_BACKEND_URL ?? "http://localhost:3001";
const DEMO_IN_PROCESS = !process.env.DEMO_BACKEND_URL;

/** WebSocket upgrade data carried for /demo/ws* connections. */
type DemoWsData = {
  type?: string;
  upstreamPath?: string;
  search?: string;
  inProcess?: boolean;
};

/**
 * Dispatch a /demo/* request to the demo app in-process. Mirrors the demo
 * server's own fetch routing: static SPA assets from client/dist for GETs
 * outside /api, /health and /ws; everything else goes to the Hono app with the
 * /demo prefix stripped.
 */
async function serveDemoInProcess(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const demoPath = url.pathname.slice("/demo".length) || "/";
  try {
    if (
      req.method === "GET" &&
      !demoPath.startsWith("/api/") &&
      demoPath !== "/health" &&
      !demoPath.startsWith("/ws")
    ) {
      // serveStatic strips the /demo prefix itself and falls back to index.html.
      return demoServeStatic(url.pathname);
    }
    const demoUrl = new URL(demoPath + url.search, "http://demo.local");
    const demoReq = new Request(demoUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    });
    return await demoApp.fetch(demoReq);
  } catch (error) {
    Sentry.captureException(error);
    return new Response("Demo backend unavailable", { status: 502 });
  }
}

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

        // WebSocket: /demo/ws* → handled in-process (default) or forwarded to
        // the DEMO_BACKEND_URL override.
        if (pathname === "/demo/ws" || pathname.startsWith("/demo/ws/")) {
          const upstreamPath = pathname.slice("/demo".length) || "/";
          if (
            server.upgrade(req, {
              data: {
                type: "demo-ws",
                upstreamPath,
                search: url.search,
                inProcess: DEMO_IN_PROCESS,
              } satisfies DemoWsData,
            })
          ) {
            return; // upgraded
          }
          return new Response("WebSocket upgrade failed", { status: 400 });
        }

        // Demo product: /demo/* — serve the demo app in-process (default) or
        // proxy to DEMO_BACKEND_URL when one is configured.
        if (pathname.startsWith("/demo")) {
          if (DEMO_IN_PROCESS) {
            return await serveDemoInProcess(req);
          }
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

// Contact API: submit a contact message (JSON POST) — stored in Neon
// (`contact_messages`), with a JSONL fallback when DATABASE_URL is unset.
if (pathname === "/api/contact") {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { POST: contactPost } = await import("./src/routes/api/contact.ts");
    return await contactPost(req);
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Failed to save message" }, { status: 500 });
  }
}


// Contact API: list inquiries (JSON GET) — admin read path for the
// contact-inquiries page (/admin/contact). Plain route so it works on the
// published host, mirroring the /api/newsletter-subscribers dispatch.
if (pathname === "/api/contact-messages") {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { GET: contactMessagesGet } = await import(
      "./src/routes/api/contact-messages.ts"
    );
    return await contactMessagesGet();
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Failed to read messages" }, { status: 500 });
  }
}

// Newsletter API: subscribe (JSON POST) — the public signup form posts here.
// Plain route (not a server fn) so it works on the published host; fresh
// signups queue a welcome email, duplicates are accepted but not re-queued.
if (pathname === "/api/newsletter/subscribe") {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  try {
    const { POST: newsletterSubscribePost } = await import(
      "./src/routes/api/newsletter-subscribe.ts"
    );
    return await newsletterSubscribePost(req);
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({ error: "Failed to subscribe" }, { status: 500 });
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
          const data = ws.data as DemoWsData | undefined;
          if (data?.type !== "demo-ws") return;

          // In-process demo WebSockets: drive the demo's own WS logic directly.
          // /demo/ws/health and /demo/ws/errors are public live streams;
          // /demo/ws?token=… is the authenticated metrics feed (JWT in query).
          if (data.inProcess) {
            const demoPath = data.upstreamPath || "/ws";
            if (demoPath === "/ws/health" || demoPath === "/ws/errors") {
              addRealtimeClient(
                ws as Parameters<typeof addRealtimeClient>[0],
                demoPath === "/ws/health" ? "health" : "errors",
              );
            } else if (demoPath === "/ws") {
              const token = new URLSearchParams(data.search || "").get("token") || "";
              handleWebSocketOpen(
                ws as Parameters<typeof handleWebSocketOpen>[0],
                token,
              );
            }
            return;
          }

          // Connect to the upstream demo backend WebSocket, preserving the
          // proxied path and query (/demo/ws/health → /ws/health,
          // /demo/ws?token=… → /ws?token=…).
          const upstream = new WebSocket(
            `${DEMO_BACKEND.replace(/^http/, "ws")}${data.upstreamPath || "/ws"}${data.search || ""}`,
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
          const data = ws.data as DemoWsData | undefined;
          if (data?.type === "demo-ws" && data.inProcess) {
            removeRealtimeClient(ws as Parameters<typeof removeRealtimeClient>[0]);
            handleWebSocketClose(ws as Parameters<typeof handleWebSocketClose>[0]);
            return;
          }
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
