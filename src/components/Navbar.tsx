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

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      {/* ---------------------------------------------------------------
          Desktop: the original single pill, unchanged. Twelve links fit
          comfortably from 640px up.
          --------------------------------------------------------------- */}
      <div className="hidden justify-center sm:flex">
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
      </div>

      {/* ---------------------------------------------------------------
          Phone: one compact bar plus a menu. Wrapping twelve pills at
          390px produced a 174px-tall nav that covered the page heading,
          because every page sets pt-28 (112px). Closed, this bar is
          about 56px, which clears that padding with room to spare.
          --------------------------------------------------------------- */}
      <div className="sm:hidden">
        <div
          className={`border border-white/15 bg-black/60 backdrop-blur-md transition-[border-radius] ${
            open ? "rounded-3xl" : "rounded-full"
          }`}
        >
          <div className="flex items-center justify-between py-2 pl-5 pr-2">
            <Link
              href="/"
              className="text-sm tracking-[0.18em] text-white/90 uppercase"
            >
              ALLAround GDP
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav-panel"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                viewBox="0 0 20 20"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {open ? (
                  <>
                    <path d="M5 5l10 10" />
                    <path d="M15 5L5 15" />
                  </>
                ) : (
                  <>
                    <path d="M3 6h14" />
                    <path d="M3 10h14" />
                    <path d="M3 14h14" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {open && (
            <div
              id="mobile-nav-panel"
              /* Closing on any tap inside the panel covers the case that
                 matters - the component stays mounted across client-side
                 navigations, so a tapped link would otherwise leave the
                 menu open on the page it just opened. */
              onClick={() => setOpen(false)}
              className="max-h-[70vh] overflow-y-auto border-t border-white/10 px-3 pb-3 pt-3"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`rounded-2xl px-4 py-2.5 text-sm transition ${
                      isActive(link.href)
                        ? "bg-white text-black"
                        : "bg-white/5 text-white/80"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                {EXTERNAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 px-4 py-2 text-xs tracking-wide text-white/60"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
