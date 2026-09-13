// src/components/CompareChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { ComparisonPoint } from "@/lib/compare";

/* Two economies on one timeline.

   A line chart rather than the filled area used elsewhere on the site:
   with two overlapping series, fills hide whichever country is behind,
   and the whole point of this page is seeing where the lines cross. */

export const COMPARE_COLOR_A = "#f0abfc"; // pink, matches the site's charts
export const COMPARE_COLOR_B = "#7dd3fc"; // sky blue, clearly distinct

type TooltipValue = number | string | (number | string)[];

function formatValue(value: TooltipValue): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "No data";
  return Math.abs(n) >= 1e12
    ? `$${(n / 1e12).toFixed(2)}T`
    : `$${(n / 1e9).toFixed(1)}B`;
}

export default function CompareChart({
  series,
  nameA,
  nameB,
}: {
  series: ComparisonPoint[];
  nameA: string;
  nameB: string;
}) {
  // Only plot years where at least one country reported something.
  const data = series.filter((p) => p.a != null || p.b != null);

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm text-white/40">
        No overlapping GDP history for these two countries.
      </div>
    );
  }

  return (
    <div className="h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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
            formatter={((value: TooltipValue, name: string) => [
              formatValue(value),
              name,
            ]) as never}
            labelFormatter={((label: unknown) => `Year ${label}`) as never}
          />
          <Legend
            wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}
          />
          <Line
            type="monotone"
            dataKey="a"
            name={nameA}
            stroke={COMPARE_COLOR_A}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="b"
            name={nameB}
            stroke={COMPARE_COLOR_B}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
