"use client";

import Link from "next/link";

const NAV_CARDS = [
  {
    href: "/showroom",
    title: "Showroom",
    subtitle: "Ofertare & Configurare",
    available: true,
    accent: "indigo",
    icon: (
      <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: "/management",
    title: "Management",
    subtitle: "CRM & Raportări",
    available: true,
    accent: "emerald",
    icon: (
      <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/reclamatii",
    title: "Reclamatii",
    subtitle: "Gestionare reclamații",
    available: true,
    accent: "rose",
    icon: (
      <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    href: "#",
    title: "Depozit",
    subtitle: "Gestiune stoc",
    available: false,
    accent: "slate",
    icon: (
      <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "#",
    title: "Service",
    subtitle: "Instalare & Intervenții",
    available: false,
    accent: "slate",
    icon: (
      <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
] as const;

const accentArrow: Record<string, string> = {
  indigo: "text-indigo-300 group-hover:text-indigo-500",
  emerald: "text-emerald-300 group-hover:text-emerald-500",
  rose: "text-rose-300 group-hover:text-rose-500",
};

const accentIconBg: Record<string, string> = {
  indigo: "bg-indigo-50",
  emerald: "bg-emerald-50",
  rose: "bg-rose-50",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F1E30] flex flex-col">
      <header className="pt-14 pb-12 text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg shadow-indigo-500/30">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <h1 className="text-white font-extrabold text-5xl tracking-tight">NATUREN</h1>
        <p className="text-slate-500 text-sm mt-3 tracking-widest uppercase font-medium">
          Sistem integrat de management
        </p>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 pb-16 w-full">
        <div className="grid grid-cols-2 gap-4">
          {NAV_CARDS.map((card) => {
            const iconBg = card.available
              ? accentIconBg[card.accent] ?? "bg-slate-100"
              : "bg-slate-800/40";

            if (card.available) {
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group relative rounded-2xl bg-white p-7 shadow-sm hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 border border-white/5"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                      {card.icon}
                    </div>
                    <svg
                      className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${accentArrow[card.accent] ?? "text-slate-300"}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h2 className="text-slate-900 font-bold text-xl mb-1">{card.title}</h2>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${
                    card.accent === "indigo" ? "text-indigo-500" :
                    card.accent === "emerald" ? "text-emerald-500" :
                    card.accent === "rose" ? "text-rose-500" : "text-slate-500"
                  }`}>
                    {card.subtitle}
                  </p>
                </Link>
              );
            }

            return (
              <div
                key={card.title}
                className="relative rounded-2xl bg-white/5 border border-white/10 p-7 opacity-50"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
                    {card.icon}
                  </div>
                  <span className="text-xs bg-white/10 text-slate-400 px-2.5 py-1 rounded-full font-medium">
                    În curând
                  </span>
                </div>
                <h2 className="text-slate-400 font-bold text-xl mb-1">{card.title}</h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{card.subtitle}</p>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-700 pb-6">
        {new Date().getFullYear()} Naturen · Toate drepturile rezervate
      </footer>
    </div>
  );
}
