// src/app/country/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Poiret_One } from "next/font/google";
import { codeToFlag } from "@/lib/flag";
import { getAllCountrySlugs } from "@/lib/country-page";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

/* Index of every country page.

   Its real job is to be the one page that links to all ~200 country
   pages, so a crawler arriving at the site can reach every one of them
   in two clicks. Readers get an A-Z directory out of it too. */

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "All Countries",
  description:
    "Browse GDP, growth rate and GDP per capita for every country, from 1990 to today, sourced from World Bank data.",
  alternates: { canonical: "/country" },
  openGraph: {
    title: "All Countries - ALLAround GDP",
    description:
      "Browse GDP, growth and GDP per capita for every country, from World Bank data.",
  },
};

export default async function CountryIndexPage() {
  let countries: { slug: string; name: string; code: string }[] = [];

  try {
    countries = await getAllCountrySlugs();
  } catch {
    // A database hiccup should show an empty directory, not a crash.
    countries = [];
  }

  // Group A-Z so a 200-item list is actually scannable.
  const groups = new Map<string, typeof countries>();
  for (const c of countries) {
    const letter = c.name.charAt(0).toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), c]);
  }
  const letters = Array.from(groups.keys()).sort();

  return (
    <main
      className={`${poiretOne.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            All Countries
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            {countries.length > 0
              ? `GDP, growth and per-capita figures for ${countries.length} countries.`
              : "Country data is being loaded. Please try again shortly."}
          </p>
        </div>

        {letters.length > 0 && (
          <nav className="mt-10 flex flex-wrap justify-center gap-2">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/60 transition hover:border-white/40 hover:text-white"
              >
                {letter}
              </a>
            ))}
          </nav>
        )}

        <div className="mt-12 space-y-10">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/40">
                {letter}
              </h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(groups.get(letter) ?? []).map((c) => (
                  <Link
                    key={c.code}
                    href={`/country/${c.slug}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition-all duration-200 hover:border-purple-400/50 hover:bg-white/10 hover:text-white"
                  >
                    {codeToFlag(c.code)} {c.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
