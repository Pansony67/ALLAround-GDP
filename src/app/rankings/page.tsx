// src/app/rankings/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { codeToFlag } from "@/lib/flag";
import { formatPct, formatPerCapita, formatUsd } from "@/lib/country-page";
import {
  getRankings,
  MIN_GDP_FOR_RATE_RANKINGS,
  type RankedCountry,
} from "@/lib/rankings";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

/* Three leaderboards of the world economy.

   Rankings are the most linkable thing a dataset like this can produce -
   "the 20 largest economies" is a question people actually type into a
   search box - and every row here is a link into a country page, which
   gives both readers and crawlers another route through the site. */

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "World Economy Rankings",
  description:
    "The largest economies, the fastest growing, and the highest GDP per capita - ranked from World Bank data and updated weekly.",
  alternates: { canonical: "/rankings" },
  openGraph: {
    title: "World Economy Rankings - ALLAround GDP",
    description:
      "The largest economies, the fastest growing, and the highest GDP per capita, ranked from World Bank data.",
    url: "/rankings",
  },
};

function RankTable({
  rows,
  valueLabel,
  valueOf,
  secondaryLabel,
  secondaryOf,
}: {
  rows: RankedCountry[];
  valueLabel: string;
  valueOf: (c: RankedCountry) => string;
  secondaryLabel: string;
  secondaryOf: (c: RankedCountry) => string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/40">
        No data available for this ranking.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
      {/* Column headings, hidden on phones where the rows stack instead. */}
      <div className="hidden border-b border-white/10 px-6 py-3 text-xs uppercase tracking-[0.2em] text-white/40 sm:grid sm:grid-cols-[3rem_1fr_8rem_8rem]">
        <span>#</span>
        <span>Country</span>
        <span className="text-right">{valueLabel}</span>
        <span className="text-right">{secondaryLabel}</span>
      </div>

      <ol>
        {rows.map((c) => (
          <li key={c.code} className="border-b border-white/5 last:border-b-0">
            <Link
              href={`/country/${c.slug}`}
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-4 py-3 transition hover:bg-white/5 sm:grid-cols-[3rem_1fr_8rem_8rem] sm:px-6"
            >
              <span
                className={`text-sm ${
                  c.rank <= 3 ? "text-purple-300" : "text-white/40"
                }`}
              >
                {c.rank}
              </span>
              <span className="truncate text-white">
                {codeToFlag(c.code)} {c.name}
              </span>
              <span className="text-right text-white">{valueOf(c)}</span>
              <span className="hidden text-right text-sm text-white/50 sm:block">
                {secondaryOf(c)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionHeading({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="mb-6">
      <h2
        className="text-2xl text-white sm:text-3xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      {note && <p className="mt-2 text-sm text-white/50">{note}</p>}
    </div>
  );
}

export default async function RankingsPage() {
  let data = null;
  try {
    data = await getRankings();
  } catch {
    data = null;
  }

  return (
    <main
      className={`${displayFont.variable} relative min-h-screen px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <header className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            World Economy Rankings
          </h1>
          {data ? (
            <p className="mx-auto mt-3 max-w-2xl text-white/60">
              Based on {data.totalCountries} economies in {data.year}, worth{" "}
              {formatUsd(data.worldGdpUsd)} between them.
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-xl text-white/60">
              Rankings are being loaded. Please try again shortly.
            </p>
          )}
        </header>

        {data && (
          <>
            <section className="mt-14">
              <SectionHeading
                title="Largest economies"
                note={`By total GDP in ${data.year}.`}
              />
              <RankTable
                rows={data.largest}
                valueLabel="GDP"
                valueOf={(c) => formatUsd(c.gdpUsd)}
                secondaryLabel="Share of world"
                secondaryOf={(c) =>
                  c.shareOfWorldPct != null
                    ? `${c.shareOfWorldPct.toFixed(2)}%`
                    : "-"
                }
              />
            </section>

            <section className="mt-16">
              <SectionHeading
                title="Fastest growing"
                note={`Year-on-year GDP growth in ${data.year}. Limited to economies above ${formatUsd(
                  MIN_GDP_FOR_RATE_RANKINGS
                )} - without that floor the list fills with very small economies whose percentages swing wildly from year to year.`}
              />
              <RankTable
                rows={data.fastestGrowing}
                valueLabel="Growth"
                valueOf={(c) => formatPct(c.gdpGrowthPct)}
                secondaryLabel="GDP"
                secondaryOf={(c) => formatUsd(c.gdpUsd)}
              />
            </section>

            <section className="mt-16">
              <SectionHeading
                title="Highest GDP per capita"
                note={`Economic output per person in ${data.year}, among economies above ${formatUsd(
                  MIN_GDP_FOR_RATE_RANKINGS
                )}.`}
              />
              <RankTable
                rows={data.richestPerCapita}
                valueLabel="Per person"
                valueOf={(c) => formatPerCapita(c.gdpPerCapita)}
                secondaryLabel="GDP"
                secondaryOf={(c) => formatUsd(c.gdpUsd)}
              />
            </section>

            <section className="mt-16 flex flex-wrap gap-3">
              <Link
                href="/country"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
              >
                Browse all countries
              </Link>
              <Link
                href="/explore"
                className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
              >
                See them on the globe
              </Link>
            </section>
          </>
        )}

        <p className="mt-12 text-xs text-white/30">
          Figures from the World Bank, synced weekly. GDP is measured in
          current US dollars, which means rankings can shift with exchange
          rates as well as with real growth.
        </p>
      </div>
    </main>
  );
}
