// src/app/page.tsx
import Link from "next/link";
import { Poiret_One, Inter } from "next/font/google";
import RevealOnScroll from "@/components/RevealOnScroll";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const techStack = [
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Prisma",
  "Neon Postgres",
  "Recharts",
  "Vercel",
];

const features = [
  {
    title: "Interactive World Map",
    description:
      "Click any country to instantly see its GDP, growth rate, and per-capita numbers.",
  },
  {
    title: "35 Years of Data",
    description:
      "Historical GDP data from 1990 to today, sourced directly from the World Bank.",
  },
  {
    title: "Always Up To Date",
    description:
      "Automated weekly sync keeps the numbers fresh, no manual updates needed.",
  },
];

export default function HomePage() {
  return (
    <main
      className={`${poiretOne.variable} ${inter.variable} relative overflow-x-hidden bg-black`}
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {/* Galaxy glow background for the lower sections */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-[120vh] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute right-1/4 top-[180vh] h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute left-1/2 top-[240vh] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[120px]" />
      </div>

      {/* Hero section */}
      <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/earth-background.mp4"
          poster="/images/earth-hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Center: title + Get Started button */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
          <h1
            className="animate-fade-in-up text-5xl text-white sm:text-7xl"
            style={{ fontFamily: "var(--font-poiret)", animationDelay: "0.2s" }}
          >
            ALLAround GDP
          </h1>
          <Link
            href="/explore"
            className="animate-fade-in-up rounded-full border border-white/40 bg-white/10 px-10 py-3 text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.25)]"
            style={{ animationDelay: "0.6s" }}
          >
            Get Started
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* What is this */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <RevealOnScroll>
          <h2
            className="text-3xl text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            What is ALLAround GDP?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            ALLAround GDP is an interactive way to explore how economies around
            the world have grown over time. Search any country, compare GDP
            trends, and see the story behind the numbers -- all powered by real
            World Bank data.
          </p>
        </RevealOnScroll>
      </section>

      {/* Features grid */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="grid gap-10 sm:grid-cols-3">
          {features.map((feature, i) => (
            <RevealOnScroll key={feature.title} delay={i * 150}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]">
                <h3 className="text-xl text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {feature.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="relative z-10 border-t border-white/10 px-6 py-24 sm:py-32">
        <RevealOnScroll className="mx-auto max-w-4xl text-center">
          <h2
            className="text-3xl text-white sm:text-4xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            Built With
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 transition-all duration-300 hover:border-blue-400/50 hover:bg-white/10 hover:text-white"
              >
                {tech}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 px-6 py-32 text-center sm:py-40">
        <RevealOnScroll>
          <h2
            className="text-3xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-poiret)" }}
          >
            Ready to explore?
          </h2>
          <Link
            href="/explore"
            className="mt-8 inline-block rounded-full border border-white/40 bg-white/10 px-10 py-3 text-lg text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.25)]"
          >
            Get Started
          </Link>
        </RevealOnScroll>
      </section>
    </main>
  );
}
