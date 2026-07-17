// src/app/donate/page.tsx
import { Poiret_One } from "next/font/google";
import PromptPayQR from "@/components/PromptPayQR";

const poiretOne = Poiret_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-poiret",
});

export default function DonatePage() {
  return (
    <main
      className={`${poiretOne.variable} relative min-h-screen bg-black px-6 pb-12 pt-28 text-white sm:px-10`}
    >
      {/* Galaxy glow background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-[130px]" />
        <div className="absolute right-1/4 top-1/2 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h1
          className="text-4xl text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-poiret)" }}
        >
          Support the Project
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-white/60">
          ALLAround GDP is free and open. If it has been useful to you, any
          support helps keep it running and growing.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {/* PayPal */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-poiret)" }}
            >
              PayPal
            </h2>
            <p className="mt-2 text-sm text-white/60">
              For international supporters. Card or PayPal balance.
            </p>
            <a
              href="https://paypal.me/PannadhornRugseree"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full border border-white/40 bg-white/10 px-8 py-3 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_25px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.25)]"
            >
              Donate via PayPal
            </a>
          </div>

          {/* PromptPay */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <h2
              className="text-2xl"
              style={{ fontFamily: "var(--font-poiret)" }}
            >
              PromptPay
            </h2>
            <p className="mt-2 text-sm text-white/60">
              For Thai supporters. Scan with any banking app.
            </p>
            <PromptPayQR />
          </div>
        </div>
      </div>
    </main>
  );
}
