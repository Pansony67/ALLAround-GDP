// src/app/robots.ts
import type { MetadataRoute } from "next";

/* Tells crawlers what they may index. The API routes are excluded
   because they return raw JSON and the cron endpoint should never show
   up in search results. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://all-around-gdp.vercel.app/sitemap.xml",
  };
}
