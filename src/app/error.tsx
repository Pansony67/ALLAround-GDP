// src/app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

/* Route-level error boundary. Has to be a client component - Next needs
   to be able to re-render it in the browser and hand it a reset().
   Shows a friendly page instead of a stack trace if a page throws (for
   example if the database or the news API is unreachable). */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the browser console and in Vercel's logs so the real
    // cause is still recoverable even though the user never sees it.
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-28 text-center text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          Something went wrong
        </p>
        <h1 className="mt-6 text-3xl text-white sm:text-5xl">
          We could not load this page
        </h1>
        <p className="mt-4 max-w-md text-white/60">
          This is usually temporary. Try again in a moment, and if it keeps
          happening the data source may be down.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-8 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
