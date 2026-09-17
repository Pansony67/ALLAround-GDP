// src/app/country/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import CountryGdpChart from "@/components/CountryGdpChart";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { codeToFlag } from "@/lib/flag";
import { wikipediaEconomyUrl } from "@/lib/wikipedia";
import { getCountryNarrative } from "@/lib/country-narratives";
import {
  decadeOf,
  formatPct,
  formatPerCapita,
  formatUsd,
  getTopCountrySlugs,
  getCountryPageData,
} from "@/lib/country-page";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

/* One page per country - the main way this site gets found.

   Until now every figure lived behind a click on the 3D globe, which
   means Google had nothing to index: seven pages for a database holding
   ~200 countries. Each of these pages is a real URL with the country's
   name in the title, so a search for "Thailand GDP" can actually land
   here, and the neighbour links at the bottom give both readers and
   crawlers a path to the rest. */

// Re-generate a page at most once a day; the underlying data is synced
// weekly by the cron job, so anything tighter is wasted work.
export const revalidate = 86400;

// Pre-render only the largest economies - the ones people actually
// search for. Building all ~200 would mean hundreds of database queries
// and hundreds of generated share images on every deploy. Everything
// else renders on first request and is cached from then on.
const PRERENDERED_COUNTRIES = 30;

export async function generateStaticParams() {
  try {
    const countries = await getTopCountrySlugs(PRERENDERED_COUNTRIES);
    return countries.map((c) => ({ slug: c.slug }));
  } catch {
    // If the database is unreachable at build time, render every page on
    // first request instead of failing the deploy outright.
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCountryPageData(slug);

  if (!data) {
    return { title: "Country not found" };
  }

  const gdp = formatUsd(data.latest?.gdpUsd);
  const year = data.latest?.year;
  const rank =
    data.worldRank != null ? `, ranked #${data.worldRank} in the world` : "";

  // The description doubles as the Google result snippet, so it leads
  // with the number someone searching "<country> GDP" actually wants.
  const description = year
    ? `${data.name}'s GDP was ${gdp} in ${year}${rank}. Explore GDP, growth rate and GDP per capita from 1990 to today, from World Bank data.`
    : `Explore ${data.name}'s GDP, growth rate and GDP per capita from World Bank data.`;

  return {
    title: `${data.name} GDP`,
    description,
    alternates: { canonical: `/country/${slug}` },
    openGraph: {
      title: `${data.name} GDP - ALLAround GDP`,
      description,
      url: `/country/${slug}`,
    },
  };
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-2xl text-white sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
    </div>
  );
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCountryPageData(slug);

  if (!data) notFound();

  const flag = codeToFlag(data.code);
  const latestYear = data.latest?.year;
  const narrative = latestYear
    ? getCountryNarrative(data.code, decadeOf(latestYear))
    : undefined;

  const firstWithData = data.history.find((r) => r.gdpUsd != null);
  const growthSinceStart =
    firstWithData?.gdpUsd && data.latest?.gdpUsd && firstWithData.gdpUsd > 0
      ? data.latest.gdpUsd / firstWithData.gdpUsd
      : null;

  return (
    <main
      className={`${displayFont.variable} relative min-h-screen px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Machine-readable version of the breadcrumb below, so the search
          result shows Home > Countries > <country> instead of the URL. */}
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Countries", path: "/country" },
          { name: `${data.name} GDP`, path: `/country/${slug}` },
        ])}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Breadcrumb - also tells crawlers where this page sits. */}
        <nav className="text-sm text-white/40">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/country" className="transition hover:text-white">
            Countries
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/70">{data.name}</span>
        </nav>

        <header className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            {data.region}
          </p>
          <h1
            className="mt-3 text-4xl text-white sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {flag && <span className="mr-3">{flag}</span>}
            {data.name} GDP
          </h1>
          {latestYear && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/70">
              {data.name}&apos;s economy was worth{" "}
              <strong className="text-white">
                {formatUsd(data.latest?.gdpUsd)}
              </strong>{" "}
              in {latestYear}
              {data.worldRank != null && (
                <>
                  , making it the{" "}
                  <strong className="text-white">
                    {data.worldRank}
                    {ordinalSuffix(data.worldRank)} largest
                  </strong>{" "}
                  economy of the {data.rankedOutOf} tracked here
                </>
              )}
              .
            </p>
          )}
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="GDP"
            value={formatUsd(data.latest?.gdpUsd)}
            hint={latestYear ? `in ${latestYear}` : undefined}
          />
          <Stat
            label="GDP per capita"
            value={formatPerCapita(data.latest?.gdpPerCapita)}
            hint={latestYear ? `in ${latestYear}` : undefined}
          />
          <Stat
            label="Growth rate"
            value={formatPct(data.latest?.gdpGrowthPct)}
            hint="year on year"
          />
          <Stat
            label="Share of world GDP"
            value={
              data.shareOfWorldPct != null
                ? `${data.shareOfWorldPct.toFixed(2)}%`
                : "No data"
            }
            hint={
              data.worldRank != null
                ? `rank #${data.worldRank} of ${data.rankedOutOf}`
                : undefined
            }
          />
        </section>

        <section className="mt-14">
          <h2
            className="text-2xl text-white sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            GDP over time
          </h2>
          {firstWithData && data.latest && growthSinceStart && (
            <p className="mt-2 text-sm text-white/50">
              From {formatUsd(firstWithData.gdpUsd)} in {firstWithData.year} to{" "}
              {formatUsd(data.latest.gdpUsd)} in {data.latest.year} &mdash; a{" "}
              {growthSinceStart.toFixed(1)}x change.
            </p>
          )}
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <CountryGdpChart data={data.history} />
          </div>
        </section>

        {narrative && (
          <section className="mt-14">
            <h2
              className="text-2xl text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What shaped the {decadeOf(latestYear ?? 0)}s
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/70">
              {narrative}
            </p>
          </section>
        )}

        {data.neighbours.length > 0 && (
          <section className="mt-14">
            <h2
              className="text-2xl text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Other economies in {data.region}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.neighbours.map((n) => (
                <Link
                  key={n.code}
                  href={`/country/${n.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/50 hover:bg-white/10"
                >
                  <p className="text-white">
                    {codeToFlag(n.code)} {n.name}
                  </p>
                  <p className="mt-1 text-sm text-white/50">
                    {formatUsd(n.gdpUsd)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-14 flex flex-wrap gap-3">
          <Link
            href={`/history?country=${data.code}`}
            className="rounded-full border border-white/40 bg-white/10 px-7 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
          >
            Compare on the timeline
          </Link>
          <Link
            href="/explore"
            className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Find it on the globe
          </Link>
          <a
            href={wikipediaEconomyUrl(data.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/20 px-7 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Read the background
          </a>
        </section>

        <p className="mt-12 text-xs text-white/30">
          Figures from the World Bank, synced weekly. Provided as-is for
          educational use.
        </p>
      </div>
    </main>
  );
}

function ordinalSuffix(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
