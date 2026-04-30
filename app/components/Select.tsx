"use client";

interface SelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function Select({ label, value, options, onChange, disabled }: SelectProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      <label
        className={`w-40 shrink-0 text-sm font-medium ${disabled ? "text-slate-400" : "text-slate-700"}`}
      >
        {label}
      </label>
      <div className="relative flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || options.length === 0}
          className={`
            w-full appearance-none rounded-lg border px-3 py-2 pr-8 text-sm outline-none transition
            ${disabled || options.length === 0
              ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              : "border-slate-300 bg-white text-slate-800 cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }
          `}
        >
          <option value="">— selectează —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
      </div>
    </div>
  );
}
