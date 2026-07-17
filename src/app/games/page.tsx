// src/app/games/page.tsx
import Link from "next/link";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const GAMES = [
  {
    href: "/games/higher-lower",
    title: "Higher / Lower",
    description: "Guess whether the next country's GDP is higher or lower.",
    available: true,
  },
  {
    href: "/games/battle",
    title: "Country Battle",
    description: "Pick a stat, face off against a random country, win the round.",
    available: false,
  },
];

export default function GamesPage() {
  return (
    <main
      className={`${orbitron.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Galaxy glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      </div>

      <div
        className="relative z-10 mx-auto max-w-4xl"
        style={{ fontFamily: "var(--font-orbitron)" }}
      >
        <div className="text-center">
          <h1
            className="text-4xl text-white sm:text-5xl"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            GDP Games
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Test how well you actually know the world economy.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {GAMES.map((game) =>
            game.available ? (
              <Link
                key={game.href}
                href={game.href}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/10"
              >
                <h2
                  className="text-2xl text-white"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  {game.title}
                </h2>
                <p className="mt-2 text-sm text-white/60">{game.description}</p>
                <span className="mt-6 inline-block text-sm text-violet-300 transition group-hover:text-violet-200">
                  Play &rarr;
                </span>
              </Link>
            ) : (
              <div
                key={game.href}
                className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 opacity-50"
              >
                <h2
                  className="text-2xl text-white"
                  style={{ fontFamily: "var(--font-orbitron)" }}
                >
                  {game.title}
                </h2>
                <p className="mt-2 text-sm text-white/60">{game.description}</p>
                <span className="mt-6 inline-block text-sm text-white/30">
                  Coming soon
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
