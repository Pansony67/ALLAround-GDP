// src/app/games/higher-lower/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import HigherLowerGame from "@/components/HigherLowerGame";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Higher / Lower",
  description:
    "Guess whether the next country's GDP is higher or lower, and see how long a streak you can build.",
  openGraph: {
    title: "Higher / Lower - ALLAround GDP",
    description:
      "Guess whether the next country's GDP is higher or lower, and see how long a streak you can build.",
  },
};

export default function HigherLowerPage() {
  return (
    <main
      className={`${displayFont.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Galaxy glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
        >
          &larr; All games
        </Link>

        <div className="mt-8 text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Higher / Lower
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Is the next country&apos;s number higher or lower? Keep your streak
            alive.
          </p>
        </div>

        <div className="mt-16">
          <HigherLowerGame />
        </div>
      </div>
    </main>
  );
}
