// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

/* The image that shows up whenever the site is shared on Discord,
   LinkedIn, Slack, X, iMessage and so on. Next renders this at build
   time and serves it as a PNG, so there is no binary asset to keep in
   sync with the design.

   Note on styling: this is rendered by satori, not a browser. It only
   understands flexbox (no grid), every element with more than one child
   needs an explicit display:flex, and blur filters are not supported -
   the galaxy glow below is done with radial-gradient backgrounds, which
   fade out softly on their own. */

export const alt = "ALLAround GDP - Explore the World Economy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          position: "relative",
        }}
      >
        {/* Galaxy glows, mirroring the ones used across the site */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 700,
            height: 700,
            backgroundImage:
              "radial-gradient(circle, rgba(147,51,234,0.45) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -140,
            width: 760,
            height: 760,
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: 8,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            WORLD BANK DATA
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 104,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            ALLAround GDP
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              lineHeight: 1.4,
              textAlign: "center",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Explore how the world&apos;s economies have grown since 1990.
          </div>

          <div
            style={{
              marginTop: 56,
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.25)",
              backgroundColor: "rgba(255,255,255,0.08)",
              padding: "14px 34px",
              fontSize: 26,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            all-around-gdp.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
