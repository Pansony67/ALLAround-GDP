// src/app/compare/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Poiret_One } from "next/font/google";
import ComparePicker from "@/components/ComparePicker";
import { getAllCountrySlugs } from "@/lib/country-page";
import { getPopularPairs } from "@/lib/compare";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

/* Entry point for comparisons: a picker, plus a grid of the matchups
   between the biggest economies so there is something to click straight
   away (and so crawlers have links to follow into the pair pages). */

export const revalidate = 86400;

// Enough pairs to fill the grid without turning it into a wall of links.
const SUGGESTED_PAIR_DEPTH = 8;

export const metadata: Metadata = {
  title: "Compare Economies",
  description:
    "Put any two countries side by side: GDP, growth rate, GDP per capita and 35 years of history on one chart.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare Economies - ALLAround GDP",
    description:
      "Put any two countries side by side: GDP, growth, GDP per capita and 35 years of history.",
    url: "/compare",
  },
};

export default async function ComparePage() {
  let countries: { slug: string; name: string; code: string }[] = [];
  let pairs: { pairSlug: string; nameA: string; nameB: string }[] = [];

  try {
    [countries, pairs] = await Promise.all([
      getAllCountrySlugs(),
      getPopularPairs(SUGGESTED_PAIR_DEPTH),
    ]);
  } catch {
    countries = [];
    pairs = [];
  }

  return (
    <main
      className={`${poiretOne.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            Compare Economies
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Put any two countries side by side and see where their lines
            cross.
          </p>
        </header>

        <section className="mt-10">
          {countries.length > 0 ? (
            <ComparePicker countries={countries} />
          ) : (
            <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/40">
              Country list is being loaded. Please try again shortly.
            </p>
          )}
        </section>

        {pairs.length > 0 && (
          <section className="mt-16">
            <h2
              className="text-2xl text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-poiret)" }}
            >
              Popular matchups
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Every pairing among the largest economies.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pairs.map((p) => (
                <Link
                  key={p.pairSlug}
                  href={`/compare/${p.pairSlug}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition-all duration-200 hover:border-purple-400/50 hover:bg-white/10 hover:text-white"
                >
                  {p.nameA} <span className="text-white/40">vs</span> {p.nameB}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 flex flex-wrap gap-3">
          <Link
            href="/rankings"
            className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            See the rankings
          </Link>
          <Link
            href="/country"
            className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Browse all countries
          </Link>
        </section>
      </div>
    </main>
  );
}
