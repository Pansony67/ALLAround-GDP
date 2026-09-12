// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/* Security headers.

   Everything in this list is enforced and safe for this app: none of it
   affects how pages render, it only tells the browser what it may do
   with them. Content-Security-Policy is the one exception - see the
   note below it.

   poweredByHeader is turned off further down so the app stops
   advertising "X-Powered-By: Next.js" on every response. */
const securityHeaders = [
  // Stop the browser guessing a response's type (MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nothing here is meant to be embedded in someone else's iframe.
  { key: "X-Frame-Options", value: "DENY" },
  // Send the full URL to our own pages, only the origin cross-site.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This app never needs any of these device APIs.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Vercel already serves HTTPS only; this makes browsers remember it.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

/* Content-Security-Policy, deliberately in REPORT-ONLY mode.

   Report-Only means the browser checks every request against this
   policy and logs anything that violates it to the devtools console,
   but blocks nothing. That matters here because this app legitimately
   loads a lot of third-party content at runtime:

     - news thumbnails come from whatever domains the Currents API
       returns, which is not a list we can know ahead of time
     - the 3D globe pulls its earth/night-sky textures and the
       world-atlas country boundaries from unpkg.com
     - WebGL builds textures as blob: and data: URLs

   An enforcing policy that gets any of that wrong silently breaks the
   globe or the news images with no error on screen. So: run it in
   report-only first, open the site, click through the globe/news/games
   pages with devtools open, and see what (if anything) gets reported.

   Once the console stays clean, change the key below from
   "Content-Security-Policy-Report-Only" to "Content-Security-Policy"
   to start actually enforcing it.

   'unsafe-inline' stays for script/style either way: Next injects
   inline hydration data, and this codebase uses inline style={{...}}
   throughout. 'unsafe-eval' is added in development only, because
   `next dev` needs eval() for Fast Refresh and readable stack traces. */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // https: is required - news image hosts are not known in advance.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  // World Bank + Currents APIs, and unpkg for globe textures/topojson.
  "connect-src 'self' https://api.worldbank.org https://api.currentsapi.services https://unpkg.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
