// src/lib/country-page.ts
import { prisma } from "@/lib/prisma";
import { countryNameToSlug } from "@/lib/country-slug";

/* Data loading for the /country/[slug] pages.

   Lives in its own module because three separate things need the same
   figures and they must agree with each other: the page itself, the
   generateMetadata export (which puts the GDP number in the search
   result snippet), and opengraph-image.tsx (which paints it onto the
   share card). Fetching it in one place keeps them from drifting. */

export type CountryYear = {
  year: number;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

export type CountryNeighbour = {
  name: string;
  slug: string;
  code: string;
  gdpUsd: number | null;
};

export type CountryPageData = {
  code: string;
  name: string;
  slug: string;
  region: string;
  latest: CountryYear | null;
  /** 1 = largest economy in the dataset for the latest year. */
  worldRank: number | null;
  /** How many countries the rank is out of. */
  rankedOutOf: number;
  /** Share of world GDP for the latest year, as a percentage. */
  shareOfWorldPct: number | null;
  history: CountryYear[];
  /** Other countries in the same region, largest first. */
  neighbours: CountryNeighbour[];
};

/** Every country that should get a page. Used by the index page,
    generateStaticParams and the sitemap. */
export async function getAllCountrySlugs(): Promise<
  { slug: string; name: string; code: string }[]
> {
  const countries = await prisma.country.findMany({
    select: { code: true, name: true },
    orderBy: { name: "asc" },
  });

  return countries.map((c) => ({
    code: c.code,
    name: c.name,
    slug: countryNameToSlug(c.name),
  }));
}

/** The biggest economies by latest GDP.

    Used to decide which country pages get pre-rendered at deploy time.
    Pre-rendering all ~200 would mean hundreds of database round trips and
    hundreds of generated share images during the build, which is slow and
    risks exhausting the database connection pool. The rest render on first
    request and are then cached, which readers never notice. */
export async function getTopCountrySlugs(
  limit: number
): Promise<{ slug: string; name: string; code: string }[]> {
  const latestYearAgg = await prisma.gdpRecord.aggregate({
    _max: { year: true },
  });
  const latestYear = latestYearAgg._max.year;
  if (latestYear == null) return [];

  const rows = await prisma.gdpRecord.findMany({
    where: { year: latestYear, gdpUsd: { not: null } },
    orderBy: { gdpUsd: "desc" },
    take: limit,
    select: { country: { select: { code: true, name: true } } },
  });

  return rows.map((r) => ({
    code: r.country.code,
    name: r.country.name,
    slug: countryNameToSlug(r.country.name),
  }));
}

/** Loads everything one country page needs. Returns null when the slug
    does not match a country, so the page can render a 404. */
export async function getCountryPageData(
  slug: string
): Promise<CountryPageData | null> {
  // Slugs are derived, not stored, so the lookup is name -> slug rather
  // than a direct where clause. The country table is only ~200 rows, so
  // scanning it is cheaper than adding a column and a migration.
  const countries = await prisma.country.findMany({
    select: { id: true, code: true, name: true, region: true },
  });

  const country = countries.find((c) => countryNameToSlug(c.name) === slug);
  if (!country) return null;

  const [records, latestYearAgg] = await Promise.all([
    prisma.gdpRecord.findMany({
      where: { countryId: country.id },
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

  const history: CountryYear[] = records;

  // "Latest" means the most recent year this country actually has a GDP
  // figure for, which is not always the dataset's newest year - some
  // countries report late or stop reporting entirely.
  const latest =
    [...history].reverse().find((r) => r.gdpUsd != null) ?? null;

  let worldRank: number | null = null;
  let rankedOutOf = 0;
  let shareOfWorldPct: number | null = null;

  const latestYear = latestYearAgg._max.year;

  if (latestYear != null && latest != null) {
    // Rank against the dataset's newest year so every country is compared
    // on the same basis.
    const sameYear = await prisma.gdpRecord.findMany({
      where: { year: latestYear, gdpUsd: { not: null } },
      select: { countryId: true, gdpUsd: true },
    });

    rankedOutOf = sameYear.length;

    const worldTotal = sameYear.reduce((sum, r) => sum + (r.gdpUsd ?? 0), 0);
    const mine = sameYear.find((r) => r.countryId === country.id);

    if (mine?.gdpUsd != null) {
      const bigger = sameYear.filter(
        (r) => (r.gdpUsd ?? 0) > (mine.gdpUsd ?? 0)
      ).length;
      worldRank = bigger + 1;
      if (worldTotal > 0) {
        shareOfWorldPct = (mine.gdpUsd / worldTotal) * 100;
      }
    }
  }

  // Regional neighbours double as internal links, which is how a visitor
  // (and a crawler) discovers the rest of the country pages.
  const regionRows = await prisma.country.findMany({
    where: { region: country.region, NOT: { id: country.id } },
    select: {
      code: true,
      name: true,
      gdpRecords: {
        where: latestYear != null ? { year: latestYear } : undefined,
        select: { gdpUsd: true },
        take: 1,
      },
    },
  });

  const neighbours: CountryNeighbour[] = regionRows
    .map((c) => ({
      code: c.code,
      name: c.name,
      slug: countryNameToSlug(c.name),
      gdpUsd: c.gdpRecords[0]?.gdpUsd ?? null,
    }))
    .sort((a, b) => (b.gdpUsd ?? -1) - (a.gdpUsd ?? -1))
    .slice(0, 8);

  return {
    code: country.code,
    name: country.name,
    slug,
    region: country.region,
    latest,
    worldRank,
    rankedOutOf,
    shareOfWorldPct,
    history,
    neighbours,
  };
}

/* ---------- formatting helpers, shared with the share image ---------- */

/** 577000000000 -> "$577.0B", 21000000000000 -> "$21.0T" */
export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "No data";
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** 12345.6 -> "$12,346" */
export function formatPerCapita(value: number | null | undefined): string {
  if (value == null) return "No data";
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** 3.456 -> "+3.5%" */
export function formatPct(value: number | null | undefined): string {
  if (value == null) return "No data";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/** The decade key used by country-narratives.ts (1997 -> 1990). */
export function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}
