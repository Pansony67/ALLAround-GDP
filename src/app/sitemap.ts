// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://all-around-gdp.vercel.app";

/* Lists every public page for search engines. Add new routes here when
   they ship - this file is the one place that has to know about them. */
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/explore", changeFrequency: "weekly", priority: 0.9 },
  { path: "/history", changeFrequency: "weekly", priority: 0.8 },
  { path: "/news", changeFrequency: "daily", priority: 0.7 },
  { path: "/games", changeFrequency: "monthly", priority: 0.6 },
  { path: "/games/higher-lower", changeFrequency: "monthly", priority: 0.5 },
  { path: "/donate", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
