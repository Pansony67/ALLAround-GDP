// src/app/compare/[pair]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Poiret_One } from "next/font/google";
import CompareChart, {
  COMPARE_COLOR_A,
  COMPARE_COLOR_B,
} from "@/components/CompareChart";
import { codeToFlag } from "@/lib/flag";
import { formatPct, formatPerCapita, formatUsd } from "@/lib/country-page";
import {
  getComparison,
  getPopularPairs,
  type ComparedCountry,
} from "@/lib/compare";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

/* Head-to-head comparison of two economies.

   "Thailand vs Vietnam" is the kind of thing people argue about and
   screenshot, which makes this the most shareable page on the site - and
   because the URL is a real path, it can also rank for that phrase. */

export const revalidate = 86400;

// Pre-render every pairing among the ten biggest economies (45 pages).
// Any other combination still works; it just renders on first request.
const POPULAR_PAIR_DEPTH = 10;

export async function generateStaticParams() {
  try {
    const pairs = await getPopularPairs(POPULAR_PAIR_DEPTH);
    return pairs.map((p) => ({ pair: p.pairSlug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair } = await params;
  const data = await getComparison(pair);

  if (!data) return { title: "Comparison not found" };

  const title = `${data.a.name} vs ${data.b.name} GDP`;
  const gdpA = formatUsd(data.a.latest?.gdpUsd);
  const gdpB = formatUsd(data.b.latest?.gdpUsd);
  const year = data.a.latest?.year ?? data.b.latest?.year;

  const description = year
    ? `${data.a.name}'s GDP was ${gdpA} in ${year}, against ${data.b.name}'s ${gdpB}. Compare growth, GDP per capita and 35 years of history side by side.`
    : `Compare the economies of ${data.a.name} and ${data.b.name} side by side.`;

  return {
    title,
    description,
    alternates: { canonical: `/compare/${pair}` },
    openGraph: {
      title: `${title} - ALLAround GDP`,
      description,
      url: `/compare/${pair}`,
    },
  };
}

function SideCard({
  country,
  color,
  isLeader,
  rankedOutOf,
}: {
  country: ComparedCountry;
  color: string;
  isLeader: boolean;
  rankedOutOf: number;
}) {
  return (
    <div
      className="rounded-3xl border bg-white/5 p-6"
      style={{
        borderColor: isLeader ? color : "rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/country/${country.slug}`}
          className="text-xl text-white transition hover:underline"
        >
          {codeToFlag(country.code)} {country.name}
        </Link>
        <span
          className="h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-3xl text-white">
        {formatUsd(country.latest?.gdpUsd)}
      </p>
      <p className="text-xs text-white/40">
        GDP{country.latest?.year ? ` in ${country.latest.year}` : ""}
      </p>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-white/50">Per person</dt>
          <dd className="text-white">
            {formatPerCapita(country.latest?.gdpPerCapita)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">Growth</dt>
          <dd className="text-white">
            {formatPct(country.latest?.gdpGrowthPct)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">World rank</dt>
          <dd className="text-white">
            {country.worldRank != null
              ? `#${country.worldRank} of ${rankedOutOf}`
              : "No data"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">Region</dt>
          <dd className="text-right text-white">{country.region}</dd>
        </div>
      </dl>
    </div>
  );
}

export default async function ComparePairPage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const data = await getComparison(pair);

  if (!data) notFound();

  const leaderCountry =
    data.leader === "a" ? data.a : data.leader === "b" ? data.b : null;
  const trailingCountry =
    data.leader === "a" ? data.b : data.leader === "b" ? data.a : null;

  return (
    <main
      className={`${poiretOne.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <nav className="text-sm text-white/40">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="transition hover:text-white">
            Compare
          </Link>
        </nav>

        <header className="mt-8 text-center">
          <h1
            className="text-3xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            {codeToFlag(data.a.code)} {data.a.name}
            <span className="mx-3 text-white/40">vs</span>
            {codeToFlag(data.b.code)} {data.b.name}
          </h1>

          {leaderCountry && trailingCountry && data.gdpRatio && (
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
              <strong className="text-white">{leaderCountry.name}</strong>&apos;s
              economy is{" "}
              <strong className="text-white">
                {data.gdpRatio.toFixed(2)}x
              </strong>{" "}
              the size of {trailingCountry.name}&apos;s
              {data.crossoverYear != null ? (
                <>
                  {" "}
                  &mdash; the two swapped places as recently as{" "}
                  <strong className="text-white">{data.crossoverYear}</strong>.
                </>
              ) : (
                <> and has stayed ahead across the whole record.</>
              )}
            </p>
          )}
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <SideCard
            country={data.a}
            color={COMPARE_COLOR_A}
            isLeader={data.leader === "a"}
            rankedOutOf={data.rankedOutOf}
          />
          <SideCard
            country={data.b}
            color={COMPARE_COLOR_B}
            isLeader={data.leader === "b"}
            rankedOutOf={data.rankedOutOf}
          />
        </section>

        <section className="mt-14">
          <h2
            className="text-2xl text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            GDP side by side
          </h2>
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <CompareChart
              series={data.series}
              nameA={data.a.name}
              nameB={data.b.name}
            />
          </div>
        </section>

        <section className="mt-14 flex flex-wrap gap-3">
          <Link
            href={`/country/${data.a.slug}`}
            className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            {data.a.name} in detail
          </Link>
          <Link
            href={`/country/${data.b.slug}`}
            className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            {data.b.name} in detail
          </Link>
          <Link
            href="/compare"
            className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
          >
            Compare two others
          </Link>
        </section>

        <p className="mt-12 text-xs text-white/30">
          Figures from the World Bank, synced weekly. GDP is in current US
          dollars, so exchange-rate moves affect these comparisons as well as
          real growth.
        </p>
      </div>
    </main>
  );
}
