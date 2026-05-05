"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const MODULES = [
  {
    href: "/showroom",
    title: "Showroom",
    subtitle: "Ofertare & Configurare",
    desc: "Configurați uși, generați oferte PDF și administrați coșul de produse.",
    available: true,
    accent: "indigo",
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/management",
    title: "Management",
    subtitle: "CRM & Raportări",
    desc: "Rapoarte zilnice, analize de vânzări și dashboard de performanță.",
    available: true,
    accent: "emerald",
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/reclamatii",
    title: "Reclamații",
    subtitle: "Suport & Gestionare",
    desc: "Urmăriți și rezolvați reclamațiile clienților cu sistem de prioritizare.",
    available: true,
    accent: "rose",
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    href: "#",
    title: "Depozit",
    subtitle: "Gestiune stoc",
    desc: "Inventar complet, intrări-ieșiri și gestionarea stocului de produse.",
    available: false,
    accent: "amber",
    icon: (
      <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "#",
    title: "Service",
    subtitle: "Instalare & Intervenții",
    desc: "Programarea intervențiilor tehnice și urmărirea activității de service.",
    available: false,
    accent: "sky",
    icon: (
      <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
] as const;

const ACCENT = {
  indigo:  { gradient: "from-indigo-600 to-indigo-500",  text: "text-indigo-400",  arrow: "group-hover:text-indigo-400"  },
  emerald: { gradient: "from-emerald-600 to-emerald-500", text: "text-emerald-400", arrow: "group-hover:text-emerald-400" },
  rose:    { gradient: "from-rose-600 to-rose-500",       text: "text-rose-400",    arrow: "group-hover:text-rose-400"    },
  amber:   { gradient: "from-amber-600 to-amber-500",     text: "text-slate-600",   arrow: ""                             },
  sky:     { gradient: "from-sky-600 to-sky-500",         text: "text-slate-600",   arrow: ""                             },
} as const;

export default function Home() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const dateLabel = new Date().toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const available = MODULES.filter((m) => m.available);
  const upcoming  = MODULES.filter((m) => !m.available);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg,#0b1929 0%,#0d1f35 50%,#0b1929 100%)",
        backgroundImage: [
          "radial-gradient(ellipse at 15% 60%, rgba(79,70,229,0.10) 0%, transparent 55%)",
          "radial-gradient(ellipse at 85% 20%, rgba(16,185,129,0.07) 0%, transparent 50%)",
          "radial-gradient(ellipse at 50% 100%, rgba(244,63,94,0.05) 0%, transparent 40%)",
        ].join(", "),
      }}
    >
      {/* ── Hero ───────────────────────────────────────── */}
      <header className="pt-16 pb-10 text-center px-4 animate-fade-in">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-slate-400 mb-8 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span>Sistem activ</span>
          {time && (
            <>
              <span className="text-slate-700">·</span>
              <span className="font-mono tracking-tight">{time}</span>
            </>
          )}
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-2xl shadow-indigo-500/40 ring-1 ring-white/10">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <h1 className="text-white font-black text-5xl tracking-tight mb-2">NATUREN</h1>
        <p className="text-slate-500 text-xs tracking-[0.25em] uppercase font-medium mb-1.5">
          Sistem integrat de management
        </p>
        <p className="text-slate-700 text-xs capitalize">{dateLabel}</p>
      </header>

      {/* ── Modules ────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl mx-auto px-5 pb-16 w-full">
        {/* Active — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {available.map((m, i) => {
            const ac = ACCENT[m.accent];
            return (
              <Link
                key={m.title}
                href={m.href}
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.08] hover:shadow-2xl hover:border-white/20 animate-fade-in"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                {/* Arrow */}
                <svg
                  className={`absolute top-5 right-5 h-4 w-4 text-slate-700 transition-all duration-200 group-hover:translate-x-0.5 ${ac.arrow}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>

                {/* Icon */}
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${ac.gradient} shadow-lg mb-4 shrink-0`}>
                  {m.icon}
                </div>

                <h2 className="text-white font-bold text-lg leading-snug mb-0.5">{m.title}</h2>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${ac.text}`}>{m.subtitle}</p>
                <p className="text-slate-500 text-xs leading-relaxed mt-auto">{m.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* Upcoming — 2 columns */}
        {upcoming.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {upcoming.map((m) => (
              <div
                key={m.title}
                className="relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 opacity-40 cursor-not-allowed select-none"
              >
                <span className="absolute top-4 right-4 text-xs bg-white/10 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                  În curând
                </span>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 mb-4">
                  {m.icon}
                </div>
                <h2 className="text-slate-500 font-bold text-base mb-0.5">{m.title}</h2>
                <p className="text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">{m.subtitle}</p>
                <p className="text-slate-700 text-xs leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center pb-8 px-4">
        <span className="text-slate-800 text-xs">{new Date().getFullYear()} Naturen · Toate drepturile rezervate</span>
      </footer>
    </div>
  );
}
