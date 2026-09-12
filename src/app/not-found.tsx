// src/app/not-found.tsx
import Link from "next/link";
import { Poiret_One } from "next/font/google";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

/* Branded 404. Without this, a mistyped URL falls back to Next's stock
   black-and-white error page, which looks like the site is broken. */
export default function NotFound() {
  return (
    <main
      className={`${poiretOne.variable} relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 py-28 text-center text-white`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          Error 404
        </p>
        <h1
          className="mt-6 text-4xl text-white sm:text-6xl"
          style={{ fontFamily: "var(--font-poiret)" }}
        >
          Off the map
        </h1>
        <p className="mt-4 max-w-md text-white/60">
          This page does not exist. It may have moved, or the link that brought
          you here might be out of date.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
          >
            Back home
          </Link>
          <Link
            href="/explore"
            className="rounded-full border border-white/20 px-8 py-3 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            Explore the globe
          </Link>
        </div>
      </div>
    </main>
  );
}
