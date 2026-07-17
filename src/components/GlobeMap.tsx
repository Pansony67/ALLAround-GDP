// src/components/GlobeMap.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { numericIdToAlpha3 } from "@/lib/country-codes";
import { wikipediaEconomyUrl } from "@/lib/wikipedia";

const GEO_URL = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";
const EARTH_NIGHT_TEXTURE =
  "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const NIGHT_SKY_TEXTURE =
  "https://unpkg.com/three-globe/example/img/night-sky.png";

type CountryData = {
  code: string;
  name: string;
  region: string;
  year: number;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

type CountryFeature = Feature<Geometry, { name: string }>;

const CONTINENTS = [
  { name: "World", lat: 15, lng: 100, altitude: 2.5 },
  { name: "Asia", lat: 30, lng: 90, altitude: 1.8 },
  { name: "Africa", lat: 5, lng: 20, altitude: 1.8 },
  { name: "Europe", lat: 52, lng: 15, altitude: 1.5 },
  { name: "North America", lat: 45, lng: -100, altitude: 1.8 },
  { name: "South America", lat: -18, lng: -60, altitude: 1.8 },
  { name: "Oceania", lat: -25, lng: 140, altitude: 1.8 },
];

function Sparkline({
  points,
}: {
  points: { year: number; gdpUsd: number | null }[];
}) {
  const valid = points.filter(
    (p): p is { year: number; gdpUsd: number } => p.gdpUsd != null
  );
  if (valid.length < 2) return null;

  const width = 240;
  const height = 56;
  const min = Math.min(...valid.map((p) => p.gdpUsd));
  const max = Math.max(...valid.map((p) => p.gdpUsd));
  const range = max - min || 1;
  const stepX = width / (valid.length - 1);

  const coords = valid.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.gdpUsd - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GlobeMap() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [countries, setCountries] = useState<CountryData[]>([]);
  const [geoFeatures, setGeoFeatures] = useState<CountryFeature[]>([]);
  const [selected, setSelected] = useState<CountryData | null>(null);
  const [hovered, setHovered] = useState<CountryFeature | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [continentIndex, setContinentIndex] = useState(0);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [historyPoints, setHistoryPoints] = useState<
    { year: number; gdpUsd: number | null }[]
  >([]);

  const continent = CONTINENTS[continentIndex];

  // Load GDP data from our API
  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((err) => console.error("Failed to load country data:", err));
  }, []);

  // Load country shapes (TopoJSON -> GeoJSON)
  useEffect(() => {
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((topo: Topology) => {
        const fc = feature(
          topo,
          topo.objects.countries
        ) as unknown as FeatureCollection<Geometry, { name: string }>;
        setGeoFeatures(fc.features);
      })
      .catch((err) => console.error("Failed to load geo shapes:", err));
  }, []);

  // Keep globe sized to its container
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setSize({ width: rect.width, height: 600 });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Slow auto-rotate for ambience
  useEffect(() => {
    const controls = globeRef.current?.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
    }
  }, [geoFeatures.length]);

  const gdpByCode = useMemo(() => {
    const map = new Map<string, CountryData>();
    for (const c of countries) map.set(c.code.toUpperCase(), c);
    return map;
  }, [countries]);

  useEffect(() => {
    if (!selected) {
      setHistoryPoints([]);
      return;
    }
    fetch(`/api/history?country=${selected.code}`)
      .then((res) => res.json())
      .then((data: { records: { year: number; gdpUsd: number | null }[] }) => {
        setHistoryPoints(data.records ?? []);
      })
      .catch((err) => {
        console.error("Failed to load country sparkline:", err);
        setHistoryPoints([]);
      });
  }, [selected]);

  const gdpByName = useMemo(() => {
    const map = new Map<string, CountryData>();
    for (const c of countries) map.set(c.name.toLowerCase(), c);
    return map;
  }, [countries]);

  function countryForFeature(f: CountryFeature): CountryData | undefined {
    // Primary match: numeric ISO id on the map geometry -> alpha-3 code.
    // This is exact and unambiguous, unlike matching by display name.
    const alpha3 = numericIdToAlpha3(f.id);
    if (alpha3) {
      const byCode = gdpByCode.get(alpha3);
      if (byCode) return byCode;
    }
    // Fallback for any geometry missing a usable id: try name match.
    return gdpByName.get(f.properties.name.toLowerCase());
  }

  const rank = useMemo(() => {
    if (!selected) return null;
    const ranked = countries
      .filter((c): c is CountryData & { gdpUsd: number } => c.gdpUsd != null)
      .sort((a, b) => b.gdpUsd - a.gdpUsd);
    const idx = ranked.findIndex((c) => c.code === selected.code);
    return idx === -1 ? null : { position: idx + 1, total: ranked.length };
  }, [countries, selected]);

  const regionComparison = useMemo(() => {
    if (!selected || selected.gdpPerCapita == null) return null;
    const peers = countries.filter(
      (c) => c.region === selected.region && c.gdpPerCapita != null
    );
    if (peers.length === 0) return null;
    const avg =
      peers.reduce((sum, c) => sum + (c.gdpPerCapita as number), 0) /
      peers.length;
    const diffPct = ((selected.gdpPerCapita - avg) / avg) * 100;
    return { avg, diffPct };
  }, [countries, selected]);

  // No GDP color overlay -- just highlight on hover / selection so the
  // night-earth texture shows through everywhere else.
  function capColorFor(f: CountryFeature): string {
    const c = countryForFeature(f);
    const isHovered = hovered === f;
    const isSelected = selected && c && selected.code === c.code;
    if (isSelected) return "rgba(255,255,255,0.55)";
    if (isHovered) return "rgba(255,255,255,0.22)";
    return "rgba(255,255,255,0)";
  }

  function stopAutoRotate() {
    const controls = globeRef.current?.controls();
    if (controls) controls.autoRotate = false;
  }

  function flyTo(index: number) {
    stopAutoRotate();
    const c = CONTINENTS[index];
    globeRef.current?.pointOfView(
      { lat: c.lat, lng: c.lng, altitude: c.altitude },
      1200
    );
  }

  function goToPrevContinent() {
    const next = (continentIndex - 1 + CONTINENTS.length) % CONTINENTS.length;
    setContinentIndex(next);
    flyTo(next);
  }

  function goToNextContinent() {
    const next = (continentIndex + 1) % CONTINENTS.length;
    setContinentIndex(next);
    flyTo(next);
  }

  const suggestions =
    searchQuery.trim().length > 0
      ? countries
          .filter((c) =>
            c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
          .slice(0, 8)
      : [];

  function handleSelectFromSearch(country: CountryData) {
    setSelected(country);
    setSearchQuery("");
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Search */}
      <div className="relative mx-auto w-full max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country..."
          className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-slate-50 backdrop-blur-sm transition focus:border-violet-400/60 focus:outline-none"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-sm">
            {suggestions.map((c) => (
              <li key={c.code}>
                <button
                  onClick={() => handleSelectFromSearch(c)}
                  className="w-full px-5 py-3 text-left text-sm text-slate-50 transition hover:bg-violet-600/40"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Continent selector */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={goToPrevContinent}
          aria-label="Previous continent"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-50 backdrop-blur-sm transition hover:border-violet-400/60 hover:bg-violet-600/30"
        >
          {"<"}
        </button>
        <span className="min-w-[11rem] text-center text-xl font-medium tracking-wide text-white">
          {continent.name}
        </span>
        <button
          onClick={goToNextContinent}
          aria-label="Next continent"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-slate-50 backdrop-blur-sm transition hover:border-violet-400/60 hover:bg-violet-600/30"
        >
          {">"}
        </button>
      </div>

      {/* Globe */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(124,58,237,0.2)]"
      >
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          globeImageUrl={EARTH_NIGHT_TEXTURE}
          backgroundImageUrl={NIGHT_SKY_TEXTURE}
          showAtmosphere
          atmosphereColor="#7c3aed"
          atmosphereAltitude={0.18}
          polygonsData={geoFeatures}
          polygonCapColor={(f) => capColorFor(f as CountryFeature)}
          polygonSideColor={() => "rgba(0,0,0,0)"}
          polygonStrokeColor={() => "rgba(255,255,255,0.35)"}
          polygonAltitude={(f) =>
            hovered === (f as CountryFeature) ? 0.02 : 0.004
          }
          polygonsTransitionDuration={250}
          onPolygonHover={(f) => setHovered((f as CountryFeature) ?? null)}
          onPolygonClick={(f) => {
            stopAutoRotate();
            const c = countryForFeature(f as CountryFeature);
            if (c) setSelected(c);
          }}
          polygonLabel={(f) => {
            const c = countryForFeature(f as CountryFeature);
            if (!c) return (f as CountryFeature).properties.name;
            const gdp = c.gdpUsd ? `$${(c.gdpUsd / 1e9).toFixed(1)}B` : "N/A";
            return `${c.name}: ${gdp}`;
          }}
        />

        {/* Hint */}
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs text-white/60 backdrop-blur-sm">
          Drag to rotate &middot; Scroll to zoom
        </div>
      </div>

      {/* Selected country panel */}
      {selected && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-slate-50 backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="mb-1 text-2xl font-semibold">
                {selected.name}{" "}
                <span className="text-base font-normal text-white/50">
                  ({selected.region})
                </span>
              </h2>
              <p className="text-sm text-white/50">Year: {selected.year}</p>
            </div>
            {rank && (
              <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-200">
                #{rank.position} of {rank.total} by GDP
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-white/50">GDP</p>
              <p className="mt-1 text-xl font-medium">
                {selected.gdpUsd
                  ? `$${(selected.gdpUsd / 1e9).toFixed(1)}B`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-white/50">GDP per capita</p>
              <p className="mt-1 text-xl font-medium">
                {selected.gdpPerCapita
                  ? `$${selected.gdpPerCapita.toFixed(0)}`
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="text-white/50">Growth</p>
              <p className="mt-1 text-xl font-medium">
                {selected.gdpGrowthPct
                  ? `${selected.gdpGrowthPct.toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
          </div>

          {regionComparison && (
            <p className="mt-4 text-sm text-white/60">
              GDP per capita is{" "}
              <span
                className={
                  regionComparison.diffPct >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
                }
              >
                {regionComparison.diffPct >= 0 ? "+" : ""}
                {regionComparison.diffPct.toFixed(0)}%
              </span>{" "}
              vs. the {selected.region} average.
            </p>
          )}

          {historyPoints.length >= 2 && (
            <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="mb-2 text-xs text-white/50">
                GDP trend, {historyPoints[0].year}-
                {historyPoints[historyPoints.length - 1].year}
              </p>
              <Sparkline points={historyPoints} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <a
              href={`/history?country=${selected.code}`}
              className="inline-flex items-center gap-1 text-sm text-violet-300 transition hover:text-violet-200"
            >
              View full history &rarr;
            </a>
            <a
              href={wikipediaEconomyUrl(selected.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-white/50 transition hover:text-white"
            >
              Learn more on Wikipedia &#8599;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
