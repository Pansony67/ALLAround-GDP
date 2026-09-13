// src/app/country/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { codeToFlag } from "@/lib/flag";
import {
  formatPct,
  formatPerCapita,
  formatUsd,
  getCountryPageData,
} from "@/lib/country-page";

/* Per-country share card.

   Sharing /country/thailand now previews Thailand's actual numbers
   instead of the generic site card, which is the difference between a
   link people scroll past and one they click.

   satori (what renders this) only understands flexbox, needs an explicit
   display:flex on anything with multiple children, and has no blur
   filter - the glow is a radial-gradient, same trick as the site-wide
   card in src/app/opengraph-image.tsx. */

export const alt = "Country GDP - ALLAround GDP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CountryOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data = null;
  try {
    data = await getCountryPageData(slug);
  } catch {
    data = null;
  }

  const name = data?.name ?? "ALLAround GDP";
  const flag = data ? codeToFlag(data.code) : "";
  const year = data?.latest?.year;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#000000",
          position: "relative",
          padding: "0 80px",
        }}
      >
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

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 8,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {year ? `GDP ${year}` : "WORLD BANK DATA"}
          </div>

          <div
            style={{
              marginTop: 20,
              fontSize: 84,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {flag ? `${flag} ${name}` : name}
          </div>

          {data?.latest?.gdpUsd != null && (
            <div
              style={{
                marginTop: 12,
                fontSize: 92,
                fontWeight: 700,
                color: "#f0abfc",
              }}
            >
              {formatUsd(data.latest.gdpUsd)}
            </div>
          )}

          {data && (
            <div
              style={{
                marginTop: 34,
                display: "flex",
                alignItems: "center",
              }}
            >
              {data.worldRank != null && (
                <div
                  style={{
                    display: "flex",
                    marginRight: 20,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.25)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    padding: "12px 28px",
                    fontSize: 26,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {`Rank #${data.worldRank} in the world`}
                </div>
              )}
              {data.latest?.gdpPerCapita != null && (
                <div
                  style={{
                    display: "flex",
                    marginRight: 20,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.25)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    padding: "12px 28px",
                    fontSize: 26,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {`${formatPerCapita(data.latest.gdpPerCapita)} per person`}
                </div>
              )}
              {data.latest?.gdpGrowthPct != null && (
                <div
                  style={{
                    display: "flex",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.25)",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    padding: "12px 28px",
                    fontSize: 26,
                    color: "rgba(255,255,255,0.85)",
                  }}
                >
                  {`${formatPct(data.latest.gdpGrowthPct)} growth`}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 44,
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
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
