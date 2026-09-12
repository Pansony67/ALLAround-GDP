// src/components/Footer.tsx
import Link from "next/link";

/* Site footer. Deliberately a server component - it is static, so there
   is no reason to ship JS for it. Mirrors the glassy dark look used by
   Navbar and the page cards (white/10 borders, white/5 fills) so it
   reads as part of the same design system rather than bolted on.

   The data-source block matters beyond looks: this site republishes
   World Bank, Currents, Wikipedia and Natural Earth data, and crediting
   the source is both the honest thing to do and what a reviewer looks
   for in a data project. */

const SITE_LINKS = [
  { label: "Globe", href: "/explore" },
  { label: "History", href: "/history" },
  { label: "News", href: "/news" },
  { label: "Games", href: "/games" },
  { label: "Donate", href: "/donate" },
];

const SOCIAL_LINKS = [
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

const DATA_SOURCES = [
  {
    label: "World Bank Open Data",
    href: "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD",
    note: "GDP, growth and per-capita figures",
  },
  {
    label: "Currents API",
    href: "https://currentsapi.services/",
    note: "Economy and business headlines",
  },
  {
    label: "Wikipedia",
    href: "https://en.wikipedia.org/wiki/Lists_of_countries_by_GDP",
    note: "Country economy background",
  },
  {
    label: "Natural Earth",
    href: "https://www.naturalearthdata.com/",
    note: "Map and country boundaries",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <p className="text-xl text-white">ALLAround GDP</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
              An interactive way to explore how the world&apos;s economies have
              grown since 1990, built on real World Bank data.
            </p>
            <p className="mt-4 text-sm text-white/40">
              Built by{" "}
              <a
                href="https://github.com/Pansony67"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 underline-offset-4 transition hover:text-white hover:underline"
              >
                Pannadhorn Rugseree
              </a>
            </p>
          </div>

          {/* Site links */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Explore
            </p>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Connect
            </p>
            <ul className="mt-4 space-y-2.5">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 transition hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data sources */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Data sources
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {DATA_SOURCES.map((source) => (
              <li key={source.label} className="text-sm">
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 underline-offset-4 transition hover:text-white hover:underline"
                >
                  {source.label}
                </a>
                <span className="text-white/40"> &mdash; {source.note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} Pannadhorn Rugseree. Figures are provided as-is for
            educational use.
          </p>
          <p>Built with Next.js, Prisma and Vercel.</p>
        </div>
      </div>
    </footer>
  );
}
