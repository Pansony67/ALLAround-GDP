// src/components/HigherLowerGame.tsx
"use client";

import { useEffect, useState } from "react";
import { codeToFlag } from "@/lib/flag";

type CountryData = {
  code: string;
  name: string;
  region: string;
  year: number;
  gdpUsd: number | null;
  gdpPerCapita: number | null;
  gdpGrowthPct: number | null;
};

type Mode = "gdpUsd" | "gdpPerCapita";

const MODE_LABELS: Record<Mode, string> = {
  gdpUsd: "Total GDP",
  gdpPerCapita: "GDP per Capita",
};

function formatValue(mode: Mode, value: number): string {
  if (mode === "gdpUsd") {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  return `$${Math.round(value).toLocaleString()}`;
}

function highScoreKey(mode: Mode) {
  return `higherLowerHighScore_${mode}`;
}

function pickRandom(pool: CountryData[], excludeCode?: string): CountryData {
  const filtered = excludeCode ? pool.filter((c) => c.code !== excludeCode) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function CountryCard({
  country,
  mode,
  revealed,
  outcome,
}: {
  country: CountryData;
  mode: Mode;
  revealed: boolean;
  outcome?: "correct" | "wrong" | null;
}) {
  const value = mode === "gdpUsd" ? country.gdpUsd : country.gdpPerCapita;

  const borderClass =
    outcome === "correct"
      ? "border-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.25)]"
      : outcome === "wrong"
      ? "border-rose-400/60 shadow-[0_0_30px_rgba(251,113,133,0.25)]"
      : "border-white/10";

  return (
    <div
      className={`flex w-full max-w-xs flex-col items-center rounded-3xl border ${borderClass} bg-white/5 p-5 text-center backdrop-blur-sm transition-all duration-500 sm:p-8`}
    >
      <span className="text-4xl sm:text-5xl">
        {codeToFlag(country.code) || "\u{1F3F3}\uFE0F"}
      </span>
      <h3 className="mt-3 text-lg font-semibold text-white sm:mt-4 sm:text-xl">
        {country.name}
      </h3>
      <p className="mt-1 text-xs text-white/40">{country.region}</p>
      <div className="mt-4 flex h-10 items-center justify-center sm:mt-6 sm:h-12">
        {revealed && value != null ? (
          <span className="text-xl font-bold text-white sm:text-2xl">
            {formatValue(mode, value)}
          </span>
        ) : (
          <span className="text-3xl text-white/20">?</span>
        )}
      </div>
    </div>
  );
}

export default function HigherLowerGame() {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<Mode | null>(null);
  const [left, setLeft] = useState<CountryData | null>(null);
  const [right, setRight] = useState<CountryData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [outcome, setOutcome] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data: CountryData[]) => setCountries(data))
      .catch((err) => console.error("Failed to load countries:", err))
      .finally(() => setLoading(false));
  }, []);

  function poolFor(selectedMode: Mode): CountryData[] {
    return countries.filter(
      (c) => (selectedMode === "gdpUsd" ? c.gdpUsd : c.gdpPerCapita) != null
    );
  }

  function startGame(selectedMode: Mode) {
    const pool = poolFor(selectedMode);
    if (pool.length < 2) return;

    const first = pickRandom(pool);
    const second = pickRandom(pool, first.code);

    setMode(selectedMode);
    setLeft(first);
    setRight(second);
    setRevealed(false);
    setOutcome(null);
    setScore(0);
    setGameOver(false);

    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(highScoreKey(selectedMode))
        : null;
    setHighScore(stored ? parseInt(stored, 10) : 0);
  }

  function handleGuess(guessHigher: boolean) {
    if (!mode || !left || !right || revealed) return;

    const leftVal = (mode === "gdpUsd" ? left.gdpUsd : left.gdpPerCapita) as number;
    const rightVal = (mode === "gdpUsd" ? right.gdpUsd : right.gdpPerCapita) as number;

    const isTie = rightVal === leftVal;
    const actuallyHigher = rightVal > leftVal;
    const correct = isTie || guessHigher === actuallyHigher;

    setRevealed(true);
    setOutcome(correct ? "correct" : "wrong");

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        window.localStorage.setItem(highScoreKey(mode), String(newScore));
      }
      setTimeout(() => {
        const pool = poolFor(mode);
        const next = pickRandom(pool, right.code);
        setLeft(right);
        setRight(next);
        setRevealed(false);
        setOutcome(null);
      }, 1400);
    } else {
      setTimeout(() => setGameOver(true), 1400);
    }
  }

  function restart() {
    if (mode) startGame(mode);
  }

  function changeMode() {
    setMode(null);
    setGameOver(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-white/40">
        Loading countries...
      </div>
    );
  }

  // Mode selection screen
  if (!mode) {
    return (
      <div className="text-center">
        <p className="text-white/60">Pick what you want to compare:</p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => startGame("gdpUsd")}
            className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/5 px-8 py-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/10 sm:w-64"
          >
            <p className="text-lg font-semibold text-white">Total GDP</p>
            <p className="mt-1 text-sm text-white/50">
              Which economy is bigger overall
            </p>
          </button>
          <button
            onClick={() => startGame("gdpPerCapita")}
            className="w-full max-w-xs rounded-2xl border border-white/15 bg-white/5 px-8 py-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/10 sm:w-64"
          >
            <p className="text-lg font-semibold text-white">GDP per Capita</p>
            <p className="mt-1 text-sm text-white/50">
              Which country is wealthier per person
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="text-center">
        <p className="text-sm uppercase tracking-wide text-rose-300">
          Game Over
        </p>
        <p className="mt-2 text-5xl font-bold text-white">{score}</p>
        <p className="mt-1 text-sm text-white/50">
          {MODE_LABELS[mode]} &middot; High score: {highScore}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={restart}
            className="rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
          >
            Play Again
          </button>
          <button
            onClick={changeMode}
            className="rounded-full px-8 py-3 text-white/60 transition hover:text-white"
          >
            Change Mode
          </button>
        </div>
      </div>
    );
  }

  // Main gameplay screen
  if (!left || !right) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60 sm:mb-8 sm:gap-6">
        <span>
          {MODE_LABELS[mode]} &middot; Score{" "}
          <span className="font-semibold text-white">{score}</span>
        </span>
        <span className="h-4 w-px bg-white/15" />
        <span>
          High Score <span className="font-semibold text-white">{highScore}</span>
        </span>
      </div>

      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-stretch sm:gap-4">
        <CountryCard country={left} mode={mode} revealed />
        <div className="flex items-center justify-center text-2xl font-bold text-white/20">
          VS
        </div>
        <CountryCard
          country={right}
          mode={mode}
          revealed={revealed}
          outcome={outcome}
        />
      </div>

      {!revealed && (
        <div className="mt-6 flex gap-3 sm:mt-10 sm:gap-4">
          <button
            onClick={() => handleGuess(true)}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
          >
            Higher &uarr;
          </button>
          <button
            onClick={() => handleGuess(false)}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black"
          >
            Lower &darr;
          </button>
        </div>
      )}

      {revealed && outcome && (
        <p
          className={`mt-6 text-lg font-semibold sm:mt-8 ${
            outcome === "correct" ? "text-emerald-300" : "text-rose-300"
          }`}
        >
          {outcome === "correct" ? "Correct!" : "Wrong!"}
        </p>
      )}
    </div>
  );
}
