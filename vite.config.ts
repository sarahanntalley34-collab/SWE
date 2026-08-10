import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import type { IncomingMessage } from "node:http";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// TanStack Start 1.158 doesn't auto-serve files under routes/api, so the dev
// server serves the newsletter API through a tiny middleware here (serve.ts
// does the same for the built site).
function newsletterApiPlugin(): Plugin {
  /** Collects the request body of a connect-style middleware request. */
  function readBody(req: IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk) => chunks.push(chunk as Buffer));
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      req.on("error", reject);
    });
  }

  return {
    name: "newsletter-api",
    configureServer(server) {
      server.middlewares.use("/api/newsletter-subscribers", async (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const { getNewsletterSubscribers } = await import(
            "./src/routes/api/newsletter-subscribers"
          );
          const data = await getNewsletterSubscribers();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(data));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Failed to read subscribers" }));
        }
      });

      server.middlewares.use("/api/newsletter/pending-welcome", async (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const { GET: pendingWelcomeGet } = await import(
            "./src/routes/api/newsletter-pending-welcome"
          );
          const data = await pendingWelcomeGet();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(await data.json()));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Failed to list pending welcome emails" }));
        }
      });

      server.middlewares.use("/api/newsletter/mark-welcome-sent", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const { POST: markWelcomeSentPost } = await import(
            "./src/routes/api/newsletter-mark-welcome-sent"
          );
          const body = await readBody(req);
          const response = await markWelcomeSentPost(
            new Request("http://localhost/api/newsletter/mark-welcome-sent", {
              method: "POST",
              body,
            }),
          );
          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          res.end(await response.text());
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Failed to mark welcome emails sent" }));
        }
      });
      server.middlewares.use("/api/contact", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const { POST: contactPost } = await import("./src/routes/api/contact");
          const body = await readBody(req);
          const response = await contactPost(
            new Request("http://localhost/api/contact", {
              method: "POST",
              body,
            }),
          );
          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          res.end(await response.text());
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Failed to save message" }));
        }
      });
      server.middlewares.use("/api/newsletter/subscribe", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }
        try {
          const { POST: newsletterSubscribePost } = await import(
            "./src/routes/api/newsletter-subscribe"
          );
          const body = await readBody(req);
          const response = await newsletterSubscribePost(
            new Request("http://localhost/api/newsletter/subscribe", {
              method: "POST",
              body,
            }),
          );
          res.statusCode = response.status;
          res.setHeader("Content-Type", "application/json");
          res.end(await response.text());
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Failed to subscribe" }));
        }
      });
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    // The site is reverse-proxied behind <label>.<PUBLIC_SITE_DOMAIN>; the proxy
    // masks the Host to localhost:3000, but accept any host so a dev server never
    // rejects a proxied request with "Blocked request".
    allowedHosts: true,
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    viteReact(),
    newsletterApiPlugin(),
  ],
});
