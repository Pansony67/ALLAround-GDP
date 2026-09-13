// src/lib/compare.ts
import { prisma } from "@/lib/prisma";
import { countryNameToSlug } from "@/lib/country-slug";
import type { CountryYear } from "@/lib/country-page";

/* Data for the /compare/[pair] pages.

   The URL is a path, not a query string - /compare/thailand-vs-viet-nam
   rather than /compare?a=THA&b=VNM - because "thailand vs vietnam gdp" is
   a phrase people actually search for, and only a real URL can rank for
   it or sit in a sitemap. */

export const PAIR_SEPARATOR = "-vs-";

export type ComparedCountry = {
  code: string;
  name: string;
  slug: string;
  region: string;
  latest: CountryYear | null;
  worldRank: number | null;
  history: CountryYear[];
};

export type ComparisonPoint = {
  year: number;
  a: number | null;
  b: number | null;
};

export type Comparison = {
  a: ComparedCountry;
  b: ComparedCountry;
  pairSlug: string;
  rankedOutOf: number;
  /** Both countries' GDP on one timeline, for the overlaid chart. */
  series: ComparisonPoint[];
  /** How many times bigger the larger economy is, e.g. 1.12. */
  gdpRatio: number | null;
  /** Year the lead changed hands most recently, if it ever did. */
  crossoverYear: number | null;
  /** Which country is ahead now. */
  leader: "a" | "b" | null;
};

export function buildPairSlug(slugA: string, slugB: string): string {
  return `${slugA}${PAIR_SEPARATOR}${slugB}`;
}

export function parsePairSlug(
  pair: string
): { slugA: string; slugB: string } | null {
  const index = pair.indexOf(PAIR_SEPARATOR);
  if (index <= 0) return null;

  const slugA = pair.slice(0, index);
  const slugB = pair.slice(index + PAIR_SEPARATOR.length);
  if (!slugA || !slugB || slugA === slugB) return null;

  return { slugA, slugB };
}

/** All pairings among the biggest economies. These are the comparisons
    worth pre-rendering and listing in the sitemap; any other pairing
    still works, it just renders on first request. */
export async function getPopularPairs(
  topN: number
): Promise<{ pairSlug: string; nameA: string; nameB: string }[]> {
  const latestYearAgg = await prisma.gdpRecord.aggregate({
    _max: { year: true },
  });
  const year = latestYearAgg._max.year;
  if (year == null) return [];

  const rows = await prisma.gdpRecord.findMany({
    where: { year, gdpUsd: { not: null } },
    orderBy: { gdpUsd: "desc" },
    take: topN,
    select: { country: { select: { name: true } } },
  });

  const names = rows.map((r) => r.country.name);
  const pairs: { pairSlug: string; nameA: string; nameB: string }[] = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      pairs.push({
        pairSlug: buildPairSlug(
          countryNameToSlug(names[i]),
          countryNameToSlug(names[j])
        ),
        nameA: names[i],
        nameB: names[j],
      });
    }
  }

  return pairs;
}

export async function getComparison(
  pair: string
): Promise<Comparison | null> {
  const parsed = parsePairSlug(pair);
  if (!parsed) return null;

  const countries = await prisma.country.findMany({
    select: { id: true, code: true, name: true, region: true },
  });

  const findBySlug = (slug: string) =>
    countries.find((c) => countryNameToSlug(c.name) === slug);

  const rowA = findBySlug(parsed.slugA);
  const rowB = findBySlug(parsed.slugB);
  if (!rowA || !rowB) return null;

  const [recordsA, recordsB, latestYearAgg] = await Promise.all([
    prisma.gdpRecord.findMany({
      where: { countryId: rowA.id },
      orderBy: { year: "asc" },
      select: {
        year: true,
        gdpUsd: true,
        gdpPerCapita: true,
        gdpGrowthPct: true,
      },
    }),
    prisma.gdpRecord.findMany({
      where: { countryId: rowB.id },
      orderBy: { year: "asc" },
      select: {
        year: true,
        gdpUsd: true,
        gdpPerCapita: true,
        gdpGrowthPct: true,
      },
    }),
    prisma.gdpRecord.aggregate({ _max: { year: true } }),
  ]);

  const latestYear = latestYearAgg._max.year;

  // Rank both countries in one pass over the newest year.
  let ranksByCountryId = new Map<string, number>();
  let rankedOutOf = 0;

  if (latestYear != null) {
    const sameYear = await prisma.gdpRecord.findMany({
      where: { year: latestYear, gdpUsd: { not: null } },
      select: { countryId: true, gdpUsd: true },
      orderBy: { gdpUsd: "desc" },
    });
    rankedOutOf = sameYear.length;
    ranksByCountryId = new Map(
      sameYear.map((r, i) => [r.countryId, i + 1])
    );
  }

  const latestOf = (records: CountryYear[]) =>
    [...records].reverse().find((r) => r.gdpUsd != null) ?? null;

  const a: ComparedCountry = {
    code: rowA.code,
    name: rowA.name,
    slug: parsed.slugA,
    region: rowA.region,
    latest: latestOf(recordsA),
    worldRank: ranksByCountryId.get(rowA.id) ?? null,
    history: recordsA,
  };

  const b: ComparedCountry = {
    code: rowB.code,
    name: rowB.name,
    slug: parsed.slugB,
    region: rowB.region,
    latest: latestOf(recordsB),
    worldRank: ranksByCountryId.get(rowB.id) ?? null,
    history: recordsB,
  };

  // Merge both histories onto one set of years for the overlaid chart.
  const years = Array.from(
    new Set([...recordsA, ...recordsB].map((r) => r.year))
  ).sort((x, y) => x - y);

  const mapA = new Map(recordsA.map((r) => [r.year, r.gdpUsd]));
  const mapB = new Map(recordsB.map((r) => [r.year, r.gdpUsd]));

  const series: ComparisonPoint[] = years.map((year) => ({
    year,
    a: mapA.get(year) ?? null,
    b: mapB.get(year) ?? null,
  }));

  // Find the most recent year the lead changed hands. This is the detail
  // that makes a comparison interesting - "Viet Nam passed Thailand in
  // 2035" says more than either country's number on its own.
  let crossoverYear: number | null = null;
  let previousLeader: "a" | "b" | null = null;

  for (const point of series) {
    if (point.a == null || point.b == null) continue;
    const leader = point.a >= point.b ? "a" : "b";
    if (previousLeader != null && leader !== previousLeader) {
      crossoverYear = point.year;
    }
    previousLeader = leader;
  }

  const gdpA = a.latest?.gdpUsd ?? null;
  const gdpB = b.latest?.gdpUsd ?? null;

  const leader: "a" | "b" | null =
    gdpA != null && gdpB != null ? (gdpA >= gdpB ? "a" : "b") : null;

  const gdpRatio =
    gdpA != null && gdpB != null && Math.min(gdpA, gdpB) > 0
      ? Math.max(gdpA, gdpB) / Math.min(gdpA, gdpB)
      : null;

  return {
    a,
    b,
    pairSlug: pair,
    rankedOutOf,
    series,
    gdpRatio,
    crossoverYear,
    leader,
  };
}
