import { useState } from "react";

import logo from "~/assets/logo.png";

const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Demo", href: "/demo" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const LINK_CLASSES =
  "text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:text-gray-300 dark:hover:text-white dark:focus-visible:outline-white";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8 lg:px-12"
      >
        {/* Brand: logo mark + wordmark */}
        <a
          href="/"
          aria-label="Retro Engineering home"
          className="inline-flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:focus-visible:outline-white"
          onClick={() => setMenuOpen(false)}
        >
          <img
            src={logo}
            alt="Retro Engineering logo"
            className="h-8 w-8 rounded-md object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Retro Engineering
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={LINK_CLASSES}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:outline-white sm:hidden"
        >
          {menuOpen ? (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile nav (collapsible) */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-gray-200 bg-white px-6 pb-4 pt-2 dark:border-gray-800 dark:bg-gray-950 sm:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
