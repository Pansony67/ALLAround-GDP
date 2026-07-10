// src/components/WorldMap.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";

const GEO_URL = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

type CountryData = {
  code: string;
  name: string;
  region: string;
  year: number;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

export default function WorldMap() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selected, setSelected] = useState<CountryData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch((err) => console.error("Failed to load country data:", err));
  }, []);

  function findCountryByGeoName(geoName: string): CountryData | undefined {
    return countries.find(
      (c) => c.name.toLowerCase() === geoName.toLowerCase()
    );
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
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full max-w-md mx-auto">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search country..."
          className="w-full px-4 py-2 rounded-lg bg-slate-900 text-slate-50 border border-violet-800 focus:outline-none focus:border-violet-500"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-slate-900 border border-violet-800 rounded-lg overflow-hidden">
            {suggestions.map((c) => (
              <li key={c.code}>
                <button
                  onClick={() => handleSelectFromSearch(c)}
                  className="w-full text-left px-4 py-2 hover:bg-violet-800 text-slate-50 text-sm"
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden">
        <ComposableMap projectionConfig={{ scale: 140 }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const match = findCountryByGeoName(geo.properties.name);
                const isSelected = selected?.code === match?.code;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (match) setSelected(match);
                    }}
                    fill={isSelected ? "#a78bfa" : "#4c1d95"}
                    stroke="#1e1b4b"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", cursor: match ? "pointer" : "default" },
                      hover: { fill: "#7c3aed", outline: "none" },
                      pressed: { fill: "#a78bfa", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {selected && (
        <div className="bg-slate-900 text-slate-50 rounded-xl p-6 border border-violet-800">
          <h2 className="text-xl font-semibold mb-2">
            {selected.name} ({selected.region})
          </h2>
          <p className="text-sm text-slate-400 mb-4">Year: {selected.year}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400">GDP</p>
              <p className="text-lg font-medium">
                {selected.gdpUsd
                  ? `$${(selected.gdpUsd / 1e9).toFixed(1)}B`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">GDP per capita</p>
              <p className="text-lg font-medium">
                {selected.gdpPerCapita
                  ? `$${selected.gdpPerCapita.toFixed(0)}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Growth</p>
              <p className="text-lg font-medium">
                {selected.gdpGrowthPct
                  ? `${selected.gdpGrowthPct.toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}