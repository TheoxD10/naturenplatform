"use client";

import { useState } from "react";
import Link from "next/link";
import Configurator from "@/app/components/Configurator";
import MeasurementsSheet from "@/app/components/MeasurementsSheet";

type ShowroomTab = "ofertare" | "masuratori";

export default function ShowroomPage() {
  const [tab, setTab] = useState<ShowroomTab>("ofertare");

  const dateLabel = new Date().toLocaleDateString("ro-RO", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ──────────────────────────────────────── */}
      <header className="bg-[#1A2E4A] shadow-xl print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: back + branding */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm font-medium group"
            >
              <svg className="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Acasă
            </Link>

            <span className="text-slate-700 select-none">|</span>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">Showroom</h1>
                <p className="text-slate-400 text-xs">Naturen</p>
              </div>
            </div>
          </div>

          {/* Right: date */}
          <span className="text-slate-500 text-xs hidden sm:block capitalize">{dateLabel}</span>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 pb-0 flex items-center gap-2 mt-1">
          {(["ofertare", "masuratori"] as ShowroomTab[]).map((t) => {
            const labels: Record<ShowroomTab, string> = {
              ofertare:   "Ofertare",
              masuratori: "Fișa Măsurători",
            };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
                  tab === t
                    ? "bg-slate-50 text-[#1A2E4A] shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────── */}
      <main className={`mx-auto px-4 py-6 ${tab === "ofertare" ? "max-w-2xl" : "max-w-[1800px]"}`}>
        {tab === "ofertare" ? <Configurator /> : <MeasurementsSheet />}
      </main>

      <footer className="text-center text-xs text-slate-400 pb-8 print:hidden">
        Prețuri fără TVA · {new Date().getFullYear()} Naturen
      </footer>
    </div>
  );
}
