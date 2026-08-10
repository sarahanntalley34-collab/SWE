import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// TanStack Start 1.158 doesn't auto-serve files under routes/api, so the dev
// server serves the newsletter API through a tiny middleware here (serve.ts
// does the same for the built site).
function newsletterApiPlugin(): Plugin {
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
