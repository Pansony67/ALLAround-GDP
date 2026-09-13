// src/app/compare/[pair]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { codeToFlag } from "@/lib/flag";
import { formatUsd } from "@/lib/country-page";
import { getComparison } from "@/lib/compare";

/* Share card for a head-to-head.

   This is the piece that makes a comparison worth posting: the preview
   itself shows both flags and both numbers, so the argument is visible
   before anyone clicks.

   satori constraints apply (flexbox only, explicit display:flex on any
   multi-child element, no blur filter) - same as the other cards. */

export const alt = "Country comparison - ALLAround GDP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PINK = "#f0abfc";
const BLUE = "#7dd3fc";

export default async function CompareOpengraphImage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;

  let data = null;
  try {
    data = await getComparison(pair);
  } catch {
    data = null;
  }

  if (!data) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
            color: "#ffffff",
            fontSize: 56,
          }}
        >
          ALLAround GDP
        </div>
      ),
      { ...size }
    );
  }

  const side = (
    name: string,
    code: string,
    gdp: number | null | undefined,
    rank: number | null,
    color: string
  ) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 460,
      }}
    >
      <div style={{ fontSize: 88 }}>{codeToFlag(code)}</div>
      <div
        style={{
          marginTop: 10,
          fontSize: 42,
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        {name}
      </div>
      <div style={{ marginTop: 14, fontSize: 62, fontWeight: 700, color }}>
        {formatUsd(gdp)}
      </div>
      {rank != null && (
        <div
          style={{
            marginTop: 12,
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {`World rank #${rank}`}
        </div>
      )}
    </div>
  );

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
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -140,
            width: 720,
            height: 720,
            backgroundImage:
              "radial-gradient(circle, rgba(147,51,234,0.4) 0%, rgba(0,0,0,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -140,
            width: 720,
            height: 720,
            backgroundImage:
              "radial-gradient(circle, rgba(37,99,235,0.4) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {side(
            data.a.name,
            data.a.code,
            data.a.latest?.gdpUsd,
            data.a.worldRank,
            PINK
          )}

          <div
            style={{
              display: "flex",
              fontSize: 40,
              color: "rgba(255,255,255,0.4)",
              margin: "0 10px",
            }}
          >
            vs
          </div>

          {side(
            data.b.name,
            data.b.code,
            data.b.latest?.gdpUsd,
            data.b.worldRank,
            BLUE
          )}
        </div>

        <div
          style={{
            marginTop: 50,
            fontSize: 24,
            color: "rgba(255,255,255,0.45)",
          }}
        >
          all-around-gdp.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
