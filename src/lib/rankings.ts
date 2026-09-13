// src/lib/rankings.ts
import { prisma } from "@/lib/prisma";
import { countryNameToSlug } from "@/lib/country-slug";

/* Data for the /rankings page.

   Everything here comes from a single query of the newest year, then is
   sorted in memory - the table is only ~200 rows, so three sorts cost
   far less than three round trips to the database. */

export type RankedCountry = {
  rank: number;
  code: string;
  name: string;
  slug: string;
  region: string;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
  shareOfWorldPct: number | null;
};

export type Rankings = {
  year: number;
  totalCountries: number;
  worldGdpUsd: number;
  largest: RankedCountry[];
  fastestGrowing: RankedCountry[];
  richestPerCapita: RankedCountry[];
};

/* Growth and per-capita rankings are restricted to economies above this
   size. Without a floor, both lists fill up with very small economies
   whose percentages swing wildly year to year - a country going from
   $1.5B to $2B is a 33% jump that tells you nothing about the world
   economy. The threshold is shown on the page so the filter is visible
   to the reader rather than hidden in the code. */
export const MIN_GDP_FOR_RATE_RANKINGS = 10_000_000_000; // 10 billion USD

const LIST_SIZE = 20;

export async function getRankings(): Promise<Rankings | null> {
  const latestYearAgg = await prisma.gdpRecord.aggregate({
    _max: { year: true },
  });
  const year = latestYearAgg._max.year;
  if (year == null) return null;

  const rows = await prisma.gdpRecord.findMany({
    where: { year },
    select: {
      gdpUsd: true,
      gdpPerCapita: true,
      gdpGrowthPct: true,
      country: { select: { code: true, name: true, region: true } },
    },
  });

  if (rows.length === 0) return null;

  const worldGdpUsd = rows.reduce((sum, r) => sum + (r.gdpUsd ?? 0), 0);

  const base = rows.map((r) => ({
    code: r.country.code,
    name: r.country.name,
    slug: countryNameToSlug(r.country.name),
    region: r.country.region,
    gdpUsd: r.gdpUsd,
    gdpPerCapita: r.gdpPerCapita,
    gdpGrowthPct: r.gdpGrowthPct,
    shareOfWorldPct:
      r.gdpUsd != null && worldGdpUsd > 0
        ? (r.gdpUsd / worldGdpUsd) * 100
        : null,
  }));

  const withRank = (list: Omit<RankedCountry, "rank">[]): RankedCountry[] =>
    list.slice(0, LIST_SIZE).map((c, i) => ({ ...c, rank: i + 1 }));

  const largest = withRank(
    base
      .filter((c) => c.gdpUsd != null)
      .sort((a, b) => (b.gdpUsd ?? 0) - (a.gdpUsd ?? 0))
  );

  const bigEnough = base.filter(
    (c) => (c.gdpUsd ?? 0) >= MIN_GDP_FOR_RATE_RANKINGS
  );

  const fastestGrowing = withRank(
    bigEnough
      .filter((c) => c.gdpGrowthPct != null)
      .sort((a, b) => (b.gdpGrowthPct ?? 0) - (a.gdpGrowthPct ?? 0))
  );

  const richestPerCapita = withRank(
    bigEnough
      .filter((c) => c.gdpPerCapita != null)
      .sort((a, b) => (b.gdpPerCapita ?? 0) - (a.gdpPerCapita ?? 0))
  );

  return {
    year,
    totalCountries: rows.filter((r) => r.gdpUsd != null).length,
    worldGdpUsd,
    largest,
    fastestGrowing,
    richestPerCapita,
  };
}
