// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Globe", href: "/explore" },
  { label: "Countries", href: "/country" },
  { label: "Rankings", href: "/rankings" },
  { label: "Compare", href: "/compare" },
  { label: "History", href: "/history" },
  { label: "News", href: "/news" },
  { label: "Games", href: "/games" },
  { label: "Donate", href: "/donate" },
];

const EXTERNAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Pansony67" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/pannadhorn-rugseree-90a8b6403/",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/pancantalk/?theme=dark",
  },
];

/* The phone tab bar shows four destinations plus More. These four are
   the ones a first-time visitor actually opens; everything else lives
   in the More sheet, which is also where the social links go. */
const TAB_HREFS = ["/", "/explore", "/rankings", "/compare"];

const TAB_ICONS: Record<string, string> = {
  "/": "M3 9l7-6 7 6v8a1 1 0 01-1 1h-4v-5H8v5H4a1 1 0 01-1-1z",
  "/explore":
    "M10 2a8 8 0 100 16 8 8 0 000-16zM2 10h16M10 2c2.5 2.2 2.5 13.8 0 16M10 2C7.5 4.2 7.5 15.8 10 18",
  "/rankings": "M3 16h3v-5H3zM8.5 16h3V4h-3zM14 16h3V8h-3z",
  "/compare": "M6 4v12M14 4v12M3 7l3-3 3 3M11 13l3 3 3-3",
};

const MORE_ICON = "M4 10h.01M10 10h.01M16 10h.01";

function TabIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const tabs = NAV_LINKS.filter((l) => TAB_HREFS.includes(l.href));
  const moreLinks = NAV_LINKS.filter((l) => !TAB_HREFS.includes(l.href));

  // When the reader is on a page that has no tab of its own - Countries,
  // News, Donate - More is the thing that should look selected.
  const moreIsActive = moreLinks.some((l) => isActive(l.href));

  return (
    <>
      {/* ---------------------------------------------------------------
          Desktop and tablet: the original floating pill, untouched.
          Twelve links sit on one line comfortably from 640px up.
          --------------------------------------------------------------- */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 top-0 z-50 hidden justify-center px-4 pt-4 sm:flex"
      >
        <div className="flex flex-wrap items-center justify-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-2 backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                isActive(link.href)
                  ? "bg-white text-black"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <span className="mx-1 h-4 w-px bg-white/15" />

          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-1.5 text-sm text-white/70 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ---------------------------------------------------------------
          Phone: a slim wordmark bar at the top and an app-style tab bar
          at the bottom, where a thumb actually reaches.

          The floating pill cannot work at this width - wrapping twelve
          pills at 390px made the nav 174px tall, which covered the page
          heading, since every page only reserves pt-28 (112px).
          --------------------------------------------------------------- */}
      <div className="sm:hidden">
        <nav
          aria-label="Main"
          className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 px-5 py-3.5 backdrop-blur-md"
        >
          <Link
            href="/"
            className="text-sm uppercase tracking-[0.18em] text-white/90"
          >
            ALLAround GDP
          </Link>
        </nav>

        {/* Scrim: tapping anywhere outside the sheet closes it. */}
        {moreOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
        )}

        {moreOpen && (
          <div
            id="mobile-more-sheet"
            /* Any tap inside closes it too: the component stays mounted
               across client-side navigations, so a tapped link would
               otherwise leave the sheet open on the new page. */
            onClick={() => setMoreOpen(false)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-[#07070c]/95 px-5 pb-24 pt-5 backdrop-blur-xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

            <div className="grid grid-cols-2 gap-2">
              {moreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`rounded-2xl px-4 py-3 text-sm transition ${
                    isActive(link.href)
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-5 flex justify-between border-t border-white/10 pt-4">
              {EXTERNAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.18em] text-white/45"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <nav
          aria-label="Primary"
          /* pb-[env(safe-area-inset-bottom)] keeps the labels clear of
             the home indicator on a notched iPhone. */
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-md"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-stretch px-2 pt-1">
            {tabs.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-1 py-2 transition ${
                  isActive(link.href) ? "text-white" : "text-white/45"
                }`}
              >
                <TabIcon path={TAB_ICONS[link.href]} />
                <span className="text-[10px] tracking-wide">{link.label}</span>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              aria-controls="mobile-more-sheet"
              className={`flex flex-1 flex-col items-center gap-1 py-2 transition ${
                moreOpen || moreIsActive ? "text-white" : "text-white/45"
              }`}
            >
              <TabIcon path={MORE_ICON} />
              <span className="text-[10px] tracking-wide">More</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
