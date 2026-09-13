// src/components/GoogleAnalytics.tsx
"use client";

import Script from "next/script";

/* Google Analytics 4 for ALLAround GDP.

   Uses next/script directly rather than the @next/third-parties package
   on purpose: this repo currently carries both package-lock.json (what
   Vercel builds from) and pnpm-lock.yaml (what the local machine uses),
   so adding a dependency would put the two out of sync and break the
   deploy. This approach needs no new dependency at all.

   The measurement ID is not a secret - it is visible in the page source
   of every site running GA - so it sits here as a constant instead of an
   environment variable. That means there is nothing to configure in
   Vercel for analytics to start working; deploying is enough. To point
   the site at a different GA property later, change this one line.

   Loads in production only, so browsing the site locally with
   `pnpm run dev` does not pollute the real traffic numbers. Page views
   on client-side navigation (clicking between Globe / History / News)
   are picked up by GA4's Enhanced Measurement, which listens for
   browser history changes - that setting is already enabled on this
   property. */

const GA_MEASUREMENT_ID = "G-72K29854RL";

export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
