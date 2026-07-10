// src/components/WorldMap.tsx
"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";

const GEO_URL =
  "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function WorldMap() {
  return (
    <div className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden">
      <ComposableMap projectionConfig={{ scale: 140 }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#4c1d95"
                stroke="#1e1b4b"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#7c3aed", outline: "none" },
                  pressed: { fill: "#a78bfa", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
