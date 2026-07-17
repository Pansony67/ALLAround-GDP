// src/components/HistoryExplorer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { codeToFlag } from "@/lib/flag";
import { wikipediaEconomyUrl } from "@/lib/wikipedia";
import { getCountryNarrative } from "@/lib/country-narratives";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  CartesianGrid,
} from "recharts";

type WorldPoint = {
  year: number;
  totalGdpUsd: number;
  countryCount: number;
};

type CountryPoint = {
  year: number;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

type CountrySummary = {
  code: string;
  name: string;
  region: string;
};

type Step = {
  year: number;
  title: string;
  body: string;
  image?: string;
  flag?: string;
};

type TooltipValue = number | string | (number | string)[];

function formatWorldTooltip(value: TooltipValue): [string, string] {
  return [`$${(Number(value) / 1e12).toFixed(2)}T`, "Global GDP"];
}

function formatCountryTooltip(value: TooltipValue): [string, string] {
  return [`$${(Number(value) / 1e9).toFixed(2)}B`, "GDP"];
}

function formatYearLabel(label: unknown): string {
  return `Year ${label}`;
}

function pctChange(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

function findYear<T extends { year: number }>(
  data: T[],
  year: number
): T | undefined {
  return data.find((d) => d.year === year);
}

function buildWorldSteps(data: WorldPoint[]): Step[] {
  if (data.length === 0) return [];
  const first = data[0];
  const last = data[data.length - 1];
  const y1996 = findYear(data, 1996);
  const y1998 = findYear(data, 1998);
  const y2008 = findYear(data, 2008);
  const y2009 = findYear(data, 2009);
  const y2019 = findYear(data, 2019);
  const y2020 = findYear(data, 2020);

  const steps: Step[] = [];

  steps.push({
    year: first.year,
    title: `${first.year} -- Where the Data Begins`,
    body: `This dataset starts in ${first.year}, tracking ${first.countryCount} countries with a combined GDP of $${(first.totalGdpUsd / 1e12).toFixed(1)} trillion.`,
  });

  if (y1996 && y1998) {
    steps.push({
      year: 1997,
      image: "/images/history/crisis-1997.jpg",
      title: "1997 -- The Asian Financial Crisis",
      body: `Currency collapses swept through Thailand, Indonesia, and South Korea. Global GDP still grew overall, from $${(y1996.totalGdpUsd / 1e12).toFixed(1)}T in 1996 to $${(y1998.totalGdpUsd / 1e12).toFixed(1)}T by 1998, even as several Asian economies contracted sharply.`,
    });
  }

  const y2000 = findYear(data, 2000);
  const y2001 = findYear(data, 2001);
  if (y2000 && y2001) {
    const change = pctChange(y2000.totalGdpUsd, y2001.totalGdpUsd);
    steps.push({
      year: 2000,
      image: "/images/history/dotcom-2000.jpg",
      title: "2000 -- The Dot-Com Crash",
      body: `The tech bubble burst as internet valuations collapsed. Global GDP moved ${change >= 0 ? "up" : "down"} ${Math.abs(change).toFixed(1)}% from 2000 to 2001 as the shock rippled through markets.`,
    });
  }

  if (y2008 && y2009) {
    const change = pctChange(y2008.totalGdpUsd, y2009.totalGdpUsd);
    steps.push({
      year: 2008,
      image: "/images/history/crisis-2008.jpg",
      title: "2008 -- The Global Financial Crisis",
      body: `Triggered by the collapse of major financial institutions in the US, the crisis pushed global GDP ${change < 0 ? "down" : "up"} ${Math.abs(change).toFixed(1)}% from 2008 to 2009 -- one of the deepest dips in this dataset.`,
    });
  }

  if (y2019 && y2020) {
    const change = pctChange(y2019.totalGdpUsd, y2020.totalGdpUsd);
    steps.push({
      year: 2020,
      image: "/images/history/covid-2020.jpg",
      title: "2020 -- COVID-19 Shock",
      body: `Lockdowns and travel bans froze economies worldwide. Global GDP ${change < 0 ? "fell" : "rose"} ${Math.abs(change).toFixed(1)}% that year -- the sharpest single-year move in this dataset.`,
    });
  }

  if (y2020) {
    const changeSinceCovid = pctChange(y2020.totalGdpUsd, last.totalGdpUsd);
    steps.push({
      year: last.year,
      title: `${last.year} -- Where We Are Now`,
      body: `Since the 2020 low, global GDP has grown ${changeSinceCovid.toFixed(1)}%, reaching $${(last.totalGdpUsd / 1e12).toFixed(1)} trillion across ${last.countryCount} countries.`,
    });
  }

  return steps;
}


type WorldSummary = {
  startYear: number;
  endYear: number;
  startTotal: number;
  endTotal: number;
  multiple: number;
  countryCount: number;
};

function buildWorldSummary(data: WorldPoint[]): WorldSummary | null {
  if (data.length === 0) return null;
  const first = data[0];
  const last = data[data.length - 1];
  return {
    startYear: first.year,
    endYear: last.year,
    startTotal: first.totalGdpUsd,
    endTotal: last.totalGdpUsd,
    multiple: last.totalGdpUsd / first.totalGdpUsd,
    countryCount: last.countryCount,
  };
}

function buildCountrySteps(records: CountryPoint[], countryName: string, countryCode: string): Step[] {
  const decades = [1990, 2000, 2010, 2020];
  const steps: Step[] = [];

  for (const decadeStart of decades) {
    const decadeEnd = decadeStart + 9;
    const inDecade = records.filter(
      (r) => r.year >= decadeStart && r.year <= decadeEnd && r.gdpUsd != null
    );
    if (inDecade.length < 2) continue;

    const first = inDecade[0];
    const last = inDecade[inDecade.length - 1];
    const change = pctChange(first.gdpUsd as number, last.gdpUsd as number);
    const statLine = `${countryName}'s GDP moved from $${((first.gdpUsd as number) / 1e9).toFixed(1)}B in ${first.year} to $${((last.gdpUsd as number) / 1e9).toFixed(1)}B in ${last.year}, a change of ${change >= 0 ? "+" : ""}${change.toFixed(1)}%.`;

    const narrative = getCountryNarrative(countryCode, decadeStart);

    steps.push({
      year: first.year,
      flag: codeToFlag(countryCode),
      title: `${decadeStart}s`,
      body: narrative ? `${narrative} ${statLine}` : statLine,
    });
  }

  return steps;
}

function useActiveStepIndex(count: number) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, count);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [count]);

  return { active, refs };
}

function ScrollySteps({
  steps,
  onlyActiveMatters,
}: {
  steps: Step[];
  onlyActiveMatters?: boolean;
}) {
  const { active, refs } = useActiveStepIndex(steps.length);
  void onlyActiveMatters;

  return (
    <div className="flex flex-col gap-[28vh] py-[12vh] lg:gap-[40vh] lg:py-[20vh]">
      {steps.map((step, i) => (
        <div
          key={step.year}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-500 ${
            active === i
              ? "border-violet-400/50 opacity-100"
              : "border-white/5 opacity-40"
          }`}
        >
          {/* Faint earth background on every card */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
            style={{ backgroundImage: "url('/images/earth-hero-poster.jpg')" }}
          />
          {/* Tint so text stays readable */}
          <div
            className={`absolute inset-0 transition-colors duration-500 ${
              active === i ? "bg-white/[0.06]" : "bg-black/40"
            }`}
          />

          {/* Optional event image (World mode) */}
          {step.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={step.image}
              alt={step.title}
              className="relative z-10 h-36 w-full object-cover sm:h-48"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          <div className="relative z-10 p-6 sm:p-8">
            <p className="text-sm text-violet-300">
              {step.flag ? `${step.flag} ` : ""}
              {step.year}
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-3 leading-relaxed text-white/70">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WorldChart({ data, activeYear }: { data: WorldPoint[]; activeYear: number | null }) {
  const point = activeYear != null ? findYear(data, activeYear) : undefined;

  return (
    <div className="h-[200px] sm:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="worldGdpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis
          dataKey="year"
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
          tickFormatter={(v: number) => `$${(v / 1e12).toFixed(0)}T`}
          width={50}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15,15,25,0.9)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={formatWorldTooltip as never}
          labelFormatter={formatYearLabel as never}
        />
        <Area
          type="monotone"
          dataKey="totalGdpUsd"
          stroke="#a78bfa"
          strokeWidth={2}
          fill="url(#worldGdpFill)"
        />
        {point && (
          <ReferenceDot
            x={point.year}
            y={point.totalGdpUsd}
            r={6}
            fill="#ffffff"
            stroke="#a78bfa"
            strokeWidth={2}
          />
        )}
      </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


function TimelineProgress({
  data,
  activeYear,
}: {
  data: WorldPoint[];
  activeYear: number | null;
}) {
  if (data.length === 0) return null;
  const minYear = data[0].year;
  const maxYear = data[data.length - 1].year;
  const year = activeYear ?? maxYear;
  const pct = ((year - minYear) / (maxYear - minYear)) * 100;

  return (
    <div className="mt-4 sm:mt-6">
      <div className="relative h-1 rounded-full bg-white/10">
        <div
          className="absolute -top-1 h-3 w-3 -translate-x-1/2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)] transition-all duration-500"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-white/40">
        <span>{minYear}</span>
        <span className="text-violet-300">{year}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
}

function LiveStatCallout({ point }: { point: WorldPoint | undefined }) {
  if (!point) return null;
  return (
    <div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3 text-center sm:mt-6 sm:p-4">
      <p className="text-xs uppercase tracking-wide text-white/50">
        Global GDP in {point.year}
      </p>
      <p className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
        ${(point.totalGdpUsd / 1e12).toFixed(1)}T
      </p>
      <p className="mt-1 hidden text-xs text-white/40 sm:block">
        {point.countryCount} countries tracked
      </p>
    </div>
  );
}

function FactTicker({ facts }: { facts: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (facts.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % facts.length);
    }, 3500);
    return () => clearInterval(id);
  }, [facts.length]);

  if (facts.length === 0) return null;

  return (
    <p
      key={index}
      className="mt-6 hidden animate-fade-in-up text-center text-xs text-white/30 sm:block"
      style={{ animationDuration: "0.6s" }}
    >
      {facts[index]}
    </p>
  );
}

function CountryChart({ data, activeYear }: { data: CountryPoint[]; activeYear: number | null }) {
  const chartData = data.filter((d) => d.gdpUsd != null);
  const point = activeYear != null ? findYear(chartData, activeYear) : undefined;

  return (
    <div className="h-[200px] sm:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="countryGdpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f0abfc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis
          dataKey="year"
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
        />
        <YAxis
          stroke="rgba(255,255,255,0.4)"
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
          tickFormatter={(v: number) => `$${(v / 1e9).toFixed(0)}B`}
          width={55}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15,15,25,0.9)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            color: "#fff",
          }}
          formatter={formatCountryTooltip as never}
          labelFormatter={formatYearLabel as never}
        />
        <Area
          type="monotone"
          dataKey="gdpUsd"
          stroke="#f0abfc"
          strokeWidth={2}
          fill="url(#countryGdpFill)"
        />
        {point && point.gdpUsd != null && (
          <ReferenceDot
            x={point.year}
            y={point.gdpUsd}
            r={6}
            fill="#ffffff"
            stroke="#f0abfc"
            strokeWidth={2}
          />
        )}
      </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function HistoryExplorer() {
  const [mode, setMode] = useState<"world" | "country">("world");

  const [worldData, setWorldData] = useState<WorldPoint[]>([]);
  const [worldSteps, setWorldSteps] = useState<Step[]>([]);
  const [worldSummary, setWorldSummary] = useState<WorldSummary | null>(null);
  const worldActive = useActiveStepIndex(worldSteps.length);

  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null);
  const [countryRecords, setCountryRecords] = useState<CountryPoint[]>([]);
  const [countrySteps, setCountrySteps] = useState<Step[]>([]);
  const countryActive = useActiveStepIndex(countrySteps.length);

  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data: WorldPoint[]) => {
        setWorldData(data);
        setWorldSteps(buildWorldSteps(data));
        setWorldSummary(buildWorldSummary(data));
      })
      .catch((err) => console.error("Failed to load world history:", err));

    fetch("/api/countries")
      .then((res) => res.json())
      .then((data: CountrySummary[]) => setCountries(data))
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  useEffect(() => {
    if (countries.length === 0) return;
    const code = searchParams.get("country");
    if (!code) return;
    const match = countries.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (match) {
      setMode("country");
      setSelectedCountry(match);
    }
  }, [countries, searchParams]);

  useEffect(() => {
    if (!selectedCountry) return;
    fetch(`/api/history?country=${selectedCountry.code}`)
      .then((res) => res.json())
      .then((data: { records: CountryPoint[] }) => {
        setCountryRecords(data.records);
        setCountrySteps(buildCountrySteps(data.records, selectedCountry.name, selectedCountry.code));
      })
      .catch((err) => console.error("Failed to load country history:", err));
  }, [selectedCountry]);

  const suggestions = useMemo(
    () =>
      searchQuery.trim().length > 0
        ? countries
            .filter((c) =>
              c.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
            )
            .slice(0, 8)
        : [],
    [countries, searchQuery]
  );

  const worldFacts = useMemo(() => {
    if (!worldSummary) return [];
    return [
      `${worldSummary.endYear - worldSummary.startYear} years of GDP history tracked`,
      `${worldSummary.countryCount} countries in the dataset`,
      "Powered by real World Bank data",
      "Updated automatically every week",
    ];
  }, [worldSummary]);

  const worldActiveYear =
    worldSteps.length > 0 ? worldSteps[worldActive.active]?.year ?? null : null;
  const countryActiveYear =
    countrySteps.length > 0 ? countrySteps[countryActive.active]?.year ?? null : null;

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Mode toggle */}
      <div className="mx-auto flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
        <button
          onClick={() => setMode("world")}
          className={`rounded-full px-5 py-2 text-sm transition ${
            mode === "world"
              ? "bg-violet-600 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          World
        </button>
        <button
          onClick={() => setMode("country")}
          className={`rounded-full px-5 py-2 text-sm transition ${
            mode === "country"
              ? "bg-violet-600 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          Country
        </button>
      </div>

      {mode === "country" && (
        <div className="relative mx-auto w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search a country..."
            className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-slate-50 backdrop-blur-sm transition focus:border-violet-400/60 focus:outline-none"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-sm">
              {suggestions.map((c) => (
                <li key={c.code}>
                  <button
                    onClick={() => {
                      setSelectedCountry(c);
                      setSearchQuery("");
                    }}
                    className="w-full px-5 py-3 text-left text-sm text-slate-50 transition hover:bg-violet-600/40"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mode === "world" && (
        <>
          {/* Intro */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="text-lg leading-relaxed text-white/70">
              Since 1990, the world economy has been through booms, crashes, and
              recoveries. Scroll down to follow the global GDP line through the
              moments that shaped it.
            </p>
            <div className="mt-8 flex justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-bounce opacity-60"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="lg:grid lg:gap-10 lg:grid-cols-2">
            <div className="sticky top-16 z-20 mb-6 lg:top-24 lg:mb-0 lg:h-fit">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-4 backdrop-blur-md sm:p-6 lg:bg-white/5 lg:backdrop-blur-sm">
                {/* Decorative dot pattern */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "radial-gradient(white 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative">
                  <p className="mb-2 text-sm text-white/50">
                    Global GDP over time
                  </p>
                  {worldData.length > 0 ? (
                    <>
                      <WorldChart data={worldData} activeYear={worldActiveYear} />
                      <TimelineProgress data={worldData} activeYear={worldActiveYear} />
                      <LiveStatCallout
                        point={
                          worldActiveYear != null
                            ? findYear(worldData, worldActiveYear)
                            : worldData[worldData.length - 1]
                        }
                      />
                      <FactTicker facts={worldFacts} />
                    </>
                  ) : (
                    <div className="flex h-[340px] items-center justify-center text-white/40">
                      Loading...
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ScrollySteps steps={worldSteps} />
          </div>

          {/* Summary numbers */}
          {worldSummary && (
            <div className="mx-auto mt-24 max-w-4xl">
              <h3
                className="mb-10 text-center text-2xl text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-poiret)" }}
              >
                The Big Picture
              </h3>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                  <p className="text-4xl font-semibold text-white">
                    {worldSummary.multiple.toFixed(1)}x
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Global GDP grew this many times over
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                  <p className="text-4xl font-semibold text-white">
                    {worldSummary.startYear}-{worldSummary.endYear}
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Years of data tracked
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
                  <p className="text-4xl font-semibold text-white">
                    {worldSummary.countryCount}
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Countries in the latest year
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mx-auto mt-24 max-w-2xl text-center">
            <h3
              className="text-2xl text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-poiret)" }}
            >
              Want to go deeper?
            </h3>
            <p className="mt-3 text-white/60">
              Explore any country on the interactive 3D globe.
            </p>
            <a
              href="/explore"
              className="mt-8 inline-block rounded-full border border-white/40 bg-white/10 px-10 py-3 text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.25)]"
            >
              Open the Globe
            </a>
          </div>
        </>
      )}

      {mode === "country" && (
        <>
          {!selectedCountry && (
            <p className="text-center text-white/50">
              Search for a country above to see its GDP story.
            </p>
          )}
          {selectedCountry && (
            <div className="lg:grid lg:gap-10 lg:grid-cols-2">
              <div className="sticky top-16 z-20 mb-6 lg:top-24 lg:mb-0 lg:h-fit">
                <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 backdrop-blur-md sm:p-6 lg:bg-white/5 lg:backdrop-blur-sm">
                  <p className="mb-2 text-sm text-white/50">
                    {selectedCountry.name} GDP over time
                  </p>
                  {countryRecords.length > 0 ? (
                    <CountryChart data={countryRecords} activeYear={countryActiveYear} />
                  ) : (
                    <div className="flex h-[340px] items-center justify-center text-white/40">
                      Loading...
                    </div>
                  )}
                  <a
                    href={wikipediaEconomyUrl(selectedCountry.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm text-white/50 transition hover:text-white"
                  >
                    Learn more on Wikipedia &#8599;
                  </a>
                </div>
              </div>
              <ScrollySteps steps={countrySteps} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
