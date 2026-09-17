// src/app/history/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Space_Grotesk } from "next/font/google";
import HistoryExplorer from "@/components/HistoryExplorer";
import { DEFAULT_OG_IMAGE } from "@/lib/structured-data";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "History",
  description:
    "Track how any country's GDP has changed from 1990 to today, and compare economies side by side across 35 years of World Bank data.",
  openGraph: {
    title: "History - ALLAround GDP",
    description:
      "Track how any country's GDP has changed from 1990 to today, and compare economies side by side across 35 years of World Bank data.",
    images: DEFAULT_OG_IMAGE,
  },
};

export default function HistoryPage() {
  return (
    <main
      className={`${displayFont.variable} relative min-h-screen px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Galaxy glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            The GDP Story
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Scroll through decades of global growth, or pick a country and
            trace its own economic journey.
          </p>
        </div>

        <div className="mt-16">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center text-white/40">
                Loading...
              </div>
            }
          >
            <HistoryExplorer />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
