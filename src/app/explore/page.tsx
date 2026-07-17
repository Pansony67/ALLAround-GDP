// src/app/explore/page.tsx
import { Poiret_One } from "next/font/google";
import GlobeMap from "@/components/GlobeMapLazy";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

export default function ExplorePage() {
  return (
    <main
      className={`${poiretOne.variable} relative min-h-screen overflow-hidden bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Galaxy glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            Explore GDP by Country
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Drag the globe, click a country, or search below. Colors show
            relative GDP -- the brighter the country, the larger its economy.
          </p>
        </div>

        <div className="mt-12">
          <GlobeMap />
        </div>
      </div>
    </main>
  );
}
