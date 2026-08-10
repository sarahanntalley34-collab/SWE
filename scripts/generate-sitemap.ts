/**
 * Build-time sitemap generator.
 *
 * Regenerates public/sitemap.xml from the actual site routes and blog data so
 * the sitemap can never drift from the content:
 *   - Static pages are derived from the top-level files in src/routes/ (the
 *     TanStack Start convention: index.tsx -> "/", services.tsx -> /services,
 *     a.b.tsx -> /a/b).
 *   - Blog article URLs are derived from EVERY entry in src/data/blog-posts.ts
 *     (/blog/<slug>), each with a <lastmod> from the post's own date.
 *
 * Runs automatically before `vite build` (see package.json "build" script), and
 * is also safe to run standalone:  bun scripts/generate-sitemap.ts
 *
 * URLs use the canonical host https://www.theretroengineering.com (www only —
 * the bare apex is intentionally not served). Routes that must NOT be crawled
 * are excluded here: dynamic param routes (they are duplicates of concrete
 * URLs), the admin pages (they carry <meta name="robots" content="noindex">),
 * and the router shell (__root).
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { blogPosts } from "../src/data/blog-posts";

const SITE_URL = "https://www.theretroengineering.com";
const ROUTES_DIR = join(import.meta.dir, "../src/routes");
const OUT_FILE = join(import.meta.dir, "../public/sitemap.xml");

/** Minimal XML escaping (slugs are safe today, but never trust data). */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Map a top-level route file to its public URL path, or null when the file is
 * not a public, crawlable page (router shell, dynamic params, admin pages).
 */
function routeFileToPath(file: string): string | null {
  if (!file.endsWith(".tsx")) return null;
  const name = file.slice(0, -".tsx".length);
  if (name === "__root") return null; // HTML shell, not a page
  if (name.startsWith("$")) return null; // dynamic param route (e.g. /$slug, duplicate of /blog/<slug>)
  const path = name === "index" ? "/" : `/${name.replace(/\./g, "/")}`;
  if (path.startsWith("/admin")) return null; // admin pages are noindexed by design
  return path;
}

function buildSitemap(): string {
  const staticPaths = readdirSync(ROUTES_DIR)
    .map(routeFileToPath)
    .filter((p): p is string => p !== null)
    .sort(); // deterministic order: "/" first, then alphabetical

  const blogSlugs = blogPosts.map((post) => post.slug);
  const uniqueSlugs = new Set(blogSlugs);
  if (uniqueSlugs.size !== blogSlugs.length) {
    throw new Error("generate-sitemap: duplicate slug in src/data/blog-posts.ts");
  }
  blogSlugs.sort();

  const urls: string[] = [];
  for (const path of staticPaths) {
    urls.push(`  <url>\n    <loc>${esc(SITE_URL + path)}</loc>\n  </url>`);
  }
  for (const slug of blogSlugs) {
    const post = blogPosts.find((p) => p.slug === slug)!;
    urls.push(
      `  <url>\n    <loc>${esc(`${SITE_URL}/blog/${slug}`)}</loc>\n    <lastmod>${esc(post.date)}</lastmod>\n  </url>`,
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join("\n") +
    `\n</urlset>\n`
  );
}

const xml = buildSitemap();
await Bun.write(OUT_FILE, xml);
const staticCount = readdirSync(ROUTES_DIR)
  .map(routeFileToPath)
  .filter((p): p is string => p !== null).length;
console.log(
  `generate-sitemap: wrote ${OUT_FILE} (${staticCount} static URLs + ${blogPosts.length} blog URLs = ${
    staticCount + blogPosts.length
  } total)`,
);
