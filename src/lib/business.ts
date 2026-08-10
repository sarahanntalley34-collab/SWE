import siteJson from "../../site.json";

/**
 * Static business name baked in at build time.
 *
 * `site.json` lives at the repo root and is imported as a JSON module, so this
 * is a plain constant — NOT a server function. Route loaders must stay
 * synchronous (server functions 403 on the live host's client-side
 * navigation, which is what broke in-page navigation before this fix).
 */
export const BUSINESS_NAME =
  (siteJson.businessName ?? "").trim() || "Retro Engineering";
