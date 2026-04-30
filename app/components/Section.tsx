"use client";

import { ReactNode } from "react";

interface SectionProps {
  title: string;
  icon?: string;
  children: ReactNode;
}

export default function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-50 border-b border-slate-200 px-5 py-3">
        {icon && <span className="text-base">{icon}</span>}
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}
