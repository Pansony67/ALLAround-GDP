// src/components/CountryGdpChart.tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CountryYear } from "@/lib/country-page";

/* GDP-over-time chart for a country page. Client component because
   recharts measures the DOM to size itself.

   Styling deliberately matches CountryChart in HistoryExplorer (same
   pink gradient fill, same translucent grid and tooltip) so the two
   charts read as the same product rather than two different ones. */

type TooltipValue = number | string | (number | string)[];

function formatTooltip(value: TooltipValue): [string, string] {
  const n = Number(value);
  const text =
    Math.abs(n) >= 1e12
      ? `$${(n / 1e12).toFixed(2)}T`
      : `$${(n / 1e9).toFixed(2)}B`;
  return [text, "GDP"];
}

function formatYearLabel(label: unknown): string {
  return `Year ${label}`;
}

export default function CountryGdpChart({ data }: { data: CountryYear[] }) {
  const chartData = data.filter((d) => d.gdpUsd != null);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/40">
        No GDP history available for this country.
      </div>
    );
  }

  return (
    <div className="h-[260px] sm:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="countryPageGdpFill" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={(v: number) =>
              Math.abs(v) >= 1e12
                ? `$${(v / 1e12).toFixed(1)}T`
                : `$${(v / 1e9).toFixed(0)}B`
            }
            width={60}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,15,25,0.9)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              color: "#fff",
            }}
            formatter={formatTooltip as never}
            labelFormatter={formatYearLabel as never}
          />
          <Area
            type="monotone"
            dataKey="gdpUsd"
            stroke="#f0abfc"
            strokeWidth={2}
            fill="url(#countryPageGdpFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
