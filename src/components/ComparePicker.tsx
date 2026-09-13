// src/components/ComparePicker.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildPairSlug } from "@/lib/compare";

/* Two dropdowns and a button that sends the reader to /compare/a-vs-b.

   Client component because it has to hold the two selections, but it
   navigates to a real URL rather than rendering results inline - that
   way every comparison is a linkable, shareable page. */

type Option = { slug: string; name: string; code: string };

export default function ComparePicker({
  countries,
  defaultA,
  defaultB,
}: {
  countries: Option[];
  defaultA?: string;
  defaultB?: string;
}) {
  const router = useRouter();
  const [a, setA] = useState(defaultA ?? "");
  const [b, setB] = useState(defaultB ?? "");

  const canCompare = a !== "" && b !== "" && a !== b;

  const selectClass =
    "w-full rounded-2xl border border-white/15 bg-[#12121c] px-4 py-3 text-white outline-none transition focus:border-purple-400/60";

  const sorted = useMemo(
    () => [...countries].sort((x, y) => x.name.localeCompare(y.name)),
    [countries]
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-white/40">
            First country
          </span>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">Choose a country</option>
            {sorted.map((c) => (
              <option key={c.code} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <span className="hidden pb-3 text-center text-white/40 sm:block">
          vs
        </span>

        <label className="block">
          <span className="text-xs uppercase tracking-[0.2em] text-white/40">
            Second country
          </span>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">Choose a country</option>
            {sorted.map((c) => (
              <option key={c.code} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        disabled={!canCompare}
        onClick={() => router.push(`/compare/${buildPairSlug(a, b)}`)}
        className="mt-6 w-full rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10 disabled:hover:text-white sm:w-auto"
      >
        Compare
      </button>

      {a !== "" && a === b && (
        <p className="mt-3 text-sm text-white/50">
          Pick two different countries.
        </p>
      )}
    </div>
  );
}
