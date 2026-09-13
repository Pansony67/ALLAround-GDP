// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllCountrySlugs } from "@/lib/country-page";

const SITE_URL = "https://all-around-gdp.vercel.app";

/* Lists every public page for search engines. The static routes are
   listed by hand; the country pages are pulled from the database, so
   adding a country to the data automatically adds it to the sitemap. */

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/explore", changeFrequency: "weekly", priority: 0.9 },
  { path: "/country", changeFrequency: "weekly", priority: 0.9 },
  { path: "/history", changeFrequency: "weekly", priority: 0.8 },
  { path: "/news", changeFrequency: "daily", priority: 0.7 },
  { path: "/games", changeFrequency: "monthly", priority: 0.6 },
  { path: "/games/higher-lower", changeFrequency: "monthly", priority: 0.5 },
  { path: "/donate", changeFrequency: "yearly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let countryEntries: MetadataRoute.Sitemap = [];
  try {
    const countries = await getAllCountrySlugs();
    countryEntries = countries.map((c) => ({
      url: `${SITE_URL}/country/${c.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // If the database is unreachable, still serve the static sitemap
    // rather than returning an error page to the crawler.
    countryEntries = [];
  }

  return [...staticEntries, ...countryEntries];
}
