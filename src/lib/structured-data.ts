// src/lib/structured-data.ts
/**
 * schema.org objects for the site.
 *
 * These are what let Google show more than a blue link: breadcrumbs
 * under the result, the site name rendered properly, and - for the
 * Dataset block - a listing in Google Dataset Search, which is a
 * separate front door that a plain page never reaches.
 *
 * Everything here describes what the site actually publishes. Nothing
 * is claimed that the pages do not show.
 */

export const SITE_URL = "https://all-around-gdp.vercel.app";
export const SITE_NAME = "ALLAround GDP";

const AUTHOR = {
  "@type": "Person",
  name: "Pannadhorn Rugseree",
  url: "https://github.com/Pansony67",
};

/** Site identity. Safe to render on every page. */
export function websiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "All Around GDP",
    url: `${SITE_URL}/`,
    description:
      "An interactive world GDP explorer built on World Bank data, covering 1990 to today.",
    inLanguage: "en",
    publisher: AUTHOR,
  };
}

/**
 * The data itself, for Google Dataset Search. The World Bank publishes
 * its indicators under CC BY 4.0, which is what the license field
 * points at - the site is a derived view of that data, not a new source.
 */
export function datasetJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "World GDP by country, 1990 to today",
    description:
      "GDP in current US dollars, GDP per capita and annual GDP growth for every country the World Bank reports on, from 1990 to the most recent year, refreshed weekly.",
    url: `${SITE_URL}/`,
    keywords: [
      "GDP",
      "gross domestic product",
      "GDP per capita",
      "economic growth",
      "world economy",
      "World Bank",
    ],
    creator: AUTHOR,
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD",
    temporalCoverage: "1990/..",
    spatialCoverage: "World",
    measurementTechnique: "World Bank national accounts data",
    variableMeasured: [
      "GDP (current US$)",
      "GDP per capita (current US$)",
      "GDP growth (annual %)",
    ],
  };
}

/**
 * Breadcrumbs. Google renders these in place of the raw URL under a
 * result, so "Home > Countries > Thailand GDP" shows instead of
 * all-around-gdp.vercel.app/country/thailand.
 */
export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${SITE_URL}${step.path}`,
    })),
  };
}

/**
 * Fallback share image, for pages that do not generate their own card.
 *
 * Next.js replaces the whole `openGraph` object when a page declares
 * one, rather than merging field by field - so a page that sets only a
 * title and description silently loses the image declared in the root
 * layout. Every such page spreads this in explicitly.
 */
export const DEFAULT_OG_IMAGE = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: `${SITE_NAME} - Explore the World Economy`,
  },
];
