"use client";

import { useEffect, useRef, useState } from "react";
import {
  FINISAJ_ORDER,
  NONE_OPT,
  DESCHIDERI,
} from "../data/constants";
import { useConfiguratorOptions } from "../hooks/useConfiguratorOptions";
import { generateOfferPdf, type OfferItem } from "../lib/generatePdf";
import { upsertOrder, type DoorLineItem } from "../lib/offerStore";
import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DoorsData = Record<string, any>;

function sortModels(models: string[]) {
  return [...models].sort((a, b) => {
    const pa = a.match(/^(.*)\s(\d+(?:\.\d+)?)$/);
    const pb = b.match(/^(.*)\s(\d+(?:\.\d+)?)$/);
    if (pa && pb && pa[1] === pb[1]) return parseFloat(pa[2]) - parseFloat(pb[2]);
    return a.localeCompare(b);
  });
}

function Combo({
  value, options, onChange, placeholder = "— selectează —", disabled, className = "",
  optionPrices, onAddOption, onSetOptionPrice, onDeleteOption, isDeletable,
}: {
  value: string; options: string[]; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; className?: string;
  optionPrices?: Record<string, number | null>;
  onAddOption?: (label: string, price: number | null) => void;
  onSetOptionPrice?: (label: string, price: number) => void;
  onDeleteOption?: (label: string) => void;
  isDeletable?: (label: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingPriceFor, setEditingPriceFor] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState("");
  const [localExtras, setLocalExtras] = useState<{ label: string; price: number | null }[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setQuery(""); setAddMode(false); setEditingPriceFor(null); setEditingPriceVal("");
      }
    }
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, [open]);

  const localLabels = localExtras.map(e => e.label);
  const allOptions = [...options, ...localLabels.filter(l => !options.includes(l))];
  const allPrices: Record<string, number | null> = {
    ...optionPrices,
    ...Object.fromEntries(localExtras.map(e => [e.label, e.price])),
  };

  const isDisabled = !!disabled;
  const filtered = query
    ? allOptions.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : allOptions;

  const selectedPrice = value ? allPrices[value] : undefined;
  const selectedHasPrice = !!(value && selectedPrice !== undefined);

  function select(v: string) {
    onChange(v); setOpen(false); setQuery(""); setAddMode(false); setEditingPriceFor(null); setEditingPriceVal("");
  }

  function submitAdd() {
    const label = newLabel.trim();
    if (!label) return;
    const parsed = parseFloat(newPrice);
    const price = newPrice.trim() !== "" && !isNaN(parsed) ? parsed : null;
    setLocalExtras(prev => prev.some(e => e.label === label) ? prev : [...prev, { label, price }]);
    onAddOption?.(label, price);
    if (price !== null) onSetOptionPrice?.(label, price);
    setNewLabel(""); setNewPrice("");
    select(label); // auto-select and close
  }

  function submitPriceEdit(option: string) {
    const parsed = parseFloat(editingPriceVal);
    if (!isNaN(parsed) && parsed >= 0) {
      setLocalExtras(prev => {
        const exists = prev.find(e => e.label === option);
        return exists
          ? prev.map(e => e.label === option ? { ...e, price: parsed } : e)
          : [...prev, { label: option, price: parsed }];
      });
      onSetOptionPrice?.(option, parsed);
    }
    setEditingPriceFor(null); setEditingPriceVal("");
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-1.5 w-full rounded-lg border px-4 py-3 text-sm transition ${
          isDisabled
            ? "border-slate-200 bg-slate-50 cursor-not-allowed"
            : open
              ? "border-indigo-500 ring-2 ring-indigo-100 bg-white"
              : "border-slate-300 bg-white hover:border-indigo-400 cursor-pointer"
        }`}
        onClick={() => { if (!isDisabled) { setOpen(o => !o); if (!open) setTimeout(() => inputRef.current?.focus(), 30); } }}
      >
        <input
          ref={inputRef}
          className={`flex-1 bg-transparent outline-none text-sm min-w-0 ${isDisabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-slate-800"}`}
          value={open ? query : value}
          placeholder={open ? "Caută…" : (value ? "" : placeholder)}
          readOnly={!open}
          disabled={isDisabled}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => !isDisabled && setOpen(true)}
          onClick={e => e.stopPropagation()}
        />
        {/* Price display in closed state */}
        {!open && selectedHasPrice && (
          selectedPrice !== null ? (
            <span className="text-xs font-bold tabular-nums text-emerald-600 shrink-0 whitespace-nowrap">{selectedPrice} EUR</span>
          ) : (
            <span className="text-xs text-amber-500 shrink-0 italic font-medium">adaugă preț</span>
          )
        )}
        <span className="text-slate-400 text-[10px] shrink-0 pointer-events-none">▾</span>
      </div>

      {open && (
        <div
          className="absolute z-[200] top-full left-0 right-0 mt-0.5 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Always-visible add option */}
          <div className="border-b border-slate-100">
            {!addMode ? (
              <button
                onClick={() => setAddMode(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                </svg>
                Adaugă opțiune
              </button>
            ) : (
              <div className="px-3 py-2.5 bg-indigo-50">
                <p className="text-xs font-semibold text-indigo-700 mb-1.5">Opțiune personalizată</p>
                <div className="flex gap-1.5 items-center">
                  <input
                    autoFocus
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") submitAdd(); if (e.key === "Escape") setAddMode(false); }}
                    placeholder="Denumire…"
                    className="flex-1 rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-400"
                  />
                  <input
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    type="number" min="0" placeholder="EUR (opt.)"
                    className="w-20 rounded-lg border border-indigo-200 bg-white px-2 py-1.5 text-xs text-slate-900 outline-none text-center"
                  />
                  <button
                    onClick={() => submitAdd()}
                    disabled={!newLabel.trim()}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 hover:bg-indigo-700 transition"
                  >✓</button>
                  <button
                    onClick={() => setAddMode(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >✕</button>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-auto max-h-60">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-slate-400 text-center">Niciun rezultat</div>
            ) : (
              filtered.map(o => {
                const hasPrice = o in allPrices;
                const price = allPrices[o];
                const sel = o === value;
                const isEditingThis = editingPriceFor === o;
                const isConfirmingDelete = confirmDelete === o;

                if (isConfirmingDelete) {
                  return (
                    <div key={o} className="flex items-center gap-2 px-3 py-2 bg-red-50 border-b border-red-100">
                      <span className="flex-1 text-xs text-red-700 font-medium truncate">Șterge &ldquo;{o}&rdquo;?</span>
                      <button
                        onClick={() => { onDeleteOption?.(o); setConfirmDelete(null); setOpen(false); }}
                        className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                      >Da</button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition"
                      >Nu</button>
                    </div>
                  );
                }

                if (isEditingThis) {
                  return (
                    <div key={o} className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border-b border-amber-100">
                      <span className="flex-1 text-sm text-slate-700 truncate">{o}</span>
                      <input
                        autoFocus
                        type="number" min="0" placeholder="EUR"
                        value={editingPriceVal}
                        onChange={e => setEditingPriceVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") { e.preventDefault(); submitPriceEdit(o); }
                          if (e.key === "Escape") { setEditingPriceFor(null); setEditingPriceVal(""); }
                        }}
                        className="w-20 rounded border border-amber-300 bg-white px-2 py-1 text-xs text-slate-900 text-center outline-none"
                      />
                      <button
                        onClick={() => submitPriceEdit(o)}
                        className="px-2 py-1 rounded bg-amber-500 text-white text-xs font-bold hover:bg-amber-600"
                      >✓</button>
                      <button
                        onClick={() => { setEditingPriceFor(null); setEditingPriceVal(""); }}
                        className="p-1 text-slate-400 hover:text-slate-600 text-xs"
                      >✕</button>
                    </div>
                  );
                }

                return (
                  <div
                    key={o}
                    onClick={() => select(o)}
                    className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition ${
                      sel ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex-1 leading-snug truncate">{o}</span>
                    {hasPrice && price !== null && (
                      <span className={`ml-2 text-xs font-bold tabular-nums shrink-0 ${sel ? "text-indigo-500" : "text-emerald-600"}`}>
                        {price} EUR
                      </span>
                    )}
                    {hasPrice && price === null && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setEditingPriceFor(o); setEditingPriceVal("");
                        }}
                        className="ml-2 text-xs text-amber-500 hover:text-amber-700 font-medium shrink-0 italic underline-offset-2 underline"
                      >
                        adaugă preț
                      </button>
                    )}
                    {onDeleteOption && (!isDeletable || isDeletable(o)) && (
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDelete(o); }}
                        className="opacity-0 group-hover:opacity-100 ml-1.5 p-0.5 rounded text-slate-300 hover:text-red-500 transition shrink-0"
                        title="Șterge"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceBadge({ price, currency = "EUR", selected = false }: {
  price: number | null; currency?: string; selected?: boolean;
}) {
  if (price === null && !selected) return <div className="w-24" />;
  if (price === null) return (
    <div className="flex items-center justify-end">
      <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400 whitespace-nowrap">
        Fără preț
      </span>
    </div>
  );
  return (
    <div className="flex items-center justify-end">
      <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 whitespace-nowrap">
        {price} {currency}
      </span>
    </div>
  );
}

function StepSection({
  step, title, icon, accent = "indigo", children,
}: {
  step: number; title: string; icon?: string; accent?: "indigo" | "blue" | "slate";
  children: React.ReactNode;
}) {
  const accentMap = {
    indigo: { badge: "bg-indigo-600 text-white", bar: "bg-indigo-50 border-indigo-100", label: "text-indigo-700" },
    blue:   { badge: "bg-blue-500 text-white",   bar: "bg-blue-50 border-blue-100",   label: "text-blue-700"   },
    slate:  { badge: "bg-slate-600 text-white",  bar: "bg-slate-50 border-slate-200", label: "text-slate-600"  },
  };
  const ac = accentMap[accent];
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 ${ac.bar} border-b px-5 py-3`}>
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${ac.badge}`}>
          {step}
        </span>
        {icon && <span className="text-base">{icon}</span>}
        <span className={`text-xs font-bold uppercase tracking-widest ${ac.label}`}>{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-xs font-medium text-slate-500 mb-1 block">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </span>
  );
}

function Input({ label, value, onChange, onBlur, placeholder, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-4">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export default function Configurator() {
  const {
    loading: optionsLoading,
    ferMap, balModels, balCulori,
    manereModels, manereTips,
    getManereColLabels, manerePriceFromLabel,
    costuriLabels, costuriMap,
    culori,
    doorPriceOverrides,
    upsertCosturiItem,
    updateDoorPriceOverride,
    deleteCosturiItem,
    deleteDoorPriceOverride,
    euroCourse,
    updateEuroCourse,
  } = useConfiguratorOptions();

  const [doorsData, setDoorsData] = useState<DoorsData>({});
  const [doorsLoading, setDoorsLoading] = useState(true);
  const loading = doorsLoading || optionsLoading;

  // ── Current door form ──────────────────────────────────────
  const [finisaj, setFinisaj]     = useState("");
  const [colectie, setColectie]   = useState("");
  const [model, setModel]         = useState("");
  const [culoare, setCuloare]     = useState("");
  const [deschidere, setDeschidere] = useState("");
  const [usaObs, setUsaObs]       = useState("");
  const [currentQty, setCurrentQty] = useState(1);

  const [addToc, setAddToc]       = useState(false);
  const [tocFinisaj, setTocFinisaj] = useState("");
  const [tocColectie, setTocColectie] = useState("");
  const [tocModel, setTocModel]   = useState("");
  const [tocObs, setTocObs]       = useState("");

  const [nrBal, setNrBal]         = useState("");
  const [balMod, setBalMod]       = useState("");
  const [balCol, setBalCol]       = useState("");

  const [manMod, setManMod]       = useState("");
  const [manTip, setManTip]       = useState("");
  const [manCol, setManCol]       = useState("");

  const [costVars, setCostVars]   = useState<string[]>([""]);
  // Per-session prices for variable-price cost items (label → EUR)
  const [costCustomPrices, setCostCustomPrices] = useState<Record<string, string>>({});

  // Toc tunel manual pricing
  const [tocTunelPrice, setTocTunelPrice]       = useState("");
  const [tocTunelFaraFalt, setTocTunelFaraFalt] = useState(false);


  // ── Stable offer document ID for Firestore auto-save ──────
  const [offerId] = useState(() => `offer-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // ── Cart ───────────────────────────────────────────────────
  const [cartDoors, setCartDoors] = useState<DoorLineItem[]>([]);

  // ── Offer details ──────────────────────────────────────────
  const [offerNumber, setOfferNumber]   = useState(() => String(Math.floor(Math.random() * 1000) + 3000));
  const [offerDate, setOfferDate]       = useState(() => new Date().toLocaleDateString("ro-RO"));
  const [buyerName, setBuyerName]       = useState("");
  const [buyerPhone, setBuyerPhone]     = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [exchangeRate, setExchangeRate] = useState("4.97");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [agent, setAgent]               = useState("Magazin Oradea");
  const [advancePercent, setAdvancePercent] = useState("50");

  useEffect(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d) => { setDoorsData(d); setDoorsLoading(false); });
  }, []);

  // Sync EUR rate from hook once loaded
  useEffect(() => {
    if (euroCourse !== null) setExchangeRate(String(euroCourse));
  }, [euroCourse]);

  // ── Cascades ──────────────────────────────────────────────
  const finisajOpts = (() => {
    const all = Object.keys(doorsData).filter((k) => k !== "TOC_V2");
    return [...FINISAJ_ORDER.filter((f) => all.includes(f)), ...all.filter((f) => !FINISAJ_ORDER.includes(f))];
  })();
  const colectieOpts = finisaj ? Object.keys(doorsData[finisaj] ?? {}).sort() : [];
  const culoriOpts   = (finisaj && colectie)
    ? (culori[finisaj]?.[colectie] ?? [])
    : [];
  const modelOpts    = (finisaj && colectie)
    ? sortModels([
        ...Object.keys(doorsData[finisaj]?.[colectie] ?? {}),
        ...Object.keys(doorPriceOverrides)
          .filter(k => k.startsWith(`${finisaj}|${colectie}|`))
          .map(k => k.slice(`${finisaj}|${colectie}|`.length))
          .filter(m => !(m in (doorsData[finisaj]?.[colectie] ?? {}))),
      ])
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tocV2 = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
  const tocTipOpts      = Object.keys(tocV2);
  const tocAllReglaj    = tocFinisaj ? Object.keys(tocV2[tocFinisaj] ?? {}).filter((k) => k !== "__") : [];
  const tocShowReglaj   = tocAllReglaj.length >= 2;
  const effectiveTocColectie = tocShowReglaj
    ? tocColectie
    : tocAllReglaj.length === 1
    ? tocAllReglaj[0]
    : "__";
  const tocFinisajOpts  = (tocFinisaj && effectiveTocColectie)
    ? Object.keys(tocV2[tocFinisaj]?.[effectiveTocColectie] ?? {})
    : [];

  // ── All cost options (from Firestore) ────────────────────
  const allCostLabels = costuriLabels;
  const allCostPrices: Record<string, number | null> = {
    ...costuriMap,
    // Merge per-session custom prices so edited prices show correctly in dropdown
    ...Object.fromEntries(
      Object.entries(costCustomPrices).map(([k, v]) => [k, parseFloat(v) || null])
    ),
  };

  // ── Option price maps for combos ──────────────────────────
  const modelPrices: Record<string, number | null> = Object.fromEntries(
    modelOpts.map(m => {
      const overrideKey = `${finisaj}|${colectie}|${m}`;
      return [m, doorPriceOverrides[overrideKey] ?? (doorsData[finisaj]?.[colectie]?.[m] ?? null)];
    })
  );
  const tocAllReglajPrices: Record<string, number | null> = Object.fromEntries(
    tocAllReglaj.map(rk => {
      const vals = Object.values(tocV2[tocFinisaj]?.[rk] ?? {}) as number[];
      return [rk, vals.length > 0 ? vals[0] : null];
    })
  );
  const tocFinisajPrices: Record<string, number | null> = Object.fromEntries(
    tocFinisajOpts.map(fk => [fk, tocV2[tocFinisaj]?.[effectiveTocColectie]?.[fk] ?? null])
  );

  // ── Current door prices ────────────────────────────────────
  const usaPrice = (finisaj && colectie && model)
    ? (doorPriceOverrides[`${finisaj}|${colectie}|${model}`] ?? doorsData[finisaj]?.[colectie]?.[model] ?? null)
    : null;
  const tocPrice  = (tocFinisaj && tocFinisaj !== "Toc tunel" && effectiveTocColectie && tocModel)
    ? (tocV2[tocFinisaj]?.[effectiveTocColectie]?.[tocModel] ?? null)
    : null;
  const effectiveTocPrice = tocFinisaj === "Toc tunel"
    ? (parseFloat(tocTunelPrice) || null)
    : tocPrice;
  const ferPrice  = (nrBal && balMod && balCol)
    ? (ferMap[`${nrBal.startsWith("2") ? "2" : "3"}|${balMod}|${balCol}`] ?? null)
    : null;
  const manColOpts    = (manMod && manTip) ? getManereColLabels(manMod, manTip) : [];
  const hasRealColors = manColOpts.some((l) => l.includes("–"));
  const manPrice  = (manMod && manTip && manCol) ? manerePriceFromLabel(manMod, manTip, manCol) : null;

  useEffect(() => {
    if (manTip && manColOpts.length > 0 && !hasRealColors && !manCol) {
      setManCol(manColOpts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manTip, manColOpts.length, hasRealColors]);

  // Auto-save buyer info to Firestore whenever it changes (debounced 1.5s)
  useEffect(() => {
    if (!buyerName && !buyerPhone && cartDoors.length === 0) return;
    const t = setTimeout(() => saveOfferSnapshot(cartDoors), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerName, buyerPhone, buyerAddress, agent, offerNumber, offerDate, exchangeRate, discountPercent, deliveryDays, advancePercent]);

  const currentCostParts = costVars
    .filter(v => v && v !== NONE_OPT)
    .map(v => {
      const p = allCostPrices[v];
      if (typeof p === "number") return p;
      const cp = parseFloat(costCustomPrices[v] ?? "0");
      return isNaN(cp) ? 0 : cp;
    });

  const currentDoorUnitTotal =
    (usaPrice ?? 0) +
    (addToc && effectiveTocPrice ? effectiveTocPrice : 0) +
    (ferPrice ?? 0) +
    (manPrice ?? 0) +
    currentCostParts.reduce((s, p) => s + p, 0);

  const currentDoorTotal = currentDoorUnitTotal * currentQty;

  const cartTotal  = cartDoors.reduce((s, d) => s + d.totalEur * (d.qty ?? 1), 0);
  const grandTotal = cartTotal + currentDoorTotal;
  const rate       = parseFloat(exchangeRate) || 4.97;

  // ── Form handlers ──────────────────────────────────────────
  function resetHw() {
    setNrBal(""); setBalMod(""); setBalCol("");
    setManMod(""); setManTip(""); setManCol("");
    setCostVars([""]); setCostCustomPrices({});
  }
  function resetDoorForm() {
    setFinisaj(""); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); setUsaObs("");
    setAddToc(false); setTocFinisaj(""); setTocColectie(""); setTocModel(""); setTocObs("");
    setTocTunelPrice(""); setTocTunelFaraFalt(false);
    setCurrentQty(1);
    resetHw();
  }

  function handleFinisaj(v: string)  { setFinisaj(v); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleColectie(v: string) { setColectie(v); setModel(""); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleModel(v: string)    { setModel(v); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleNrBal(v: string)    { setNrBal(v); setBalMod(""); setBalCol(""); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleBalMod(v: string)   { setBalMod(v); setBalCol(""); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleBalCol(v: string)   { setBalCol(v); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleManMod(v: string)   { setManMod(v); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleManTip(v: string)   { setManTip(v); setManCol(""); setCostVars([""]); }
  function handleCost(idx: number, val: string) {
    const next = [...costVars.slice(0, idx), val];
    if (val && val !== NONE_OPT) next.push("");
    setCostVars(next);
  }
  function handleAddToc(checked: boolean) {
    setAddToc(checked);
    if (!checked) {
      setTocFinisaj(""); setTocColectie(""); setTocModel(""); setTocObs("");
      setTocTunelPrice(""); setTocTunelFaraFalt(false);
    }
  }
  function handleTocTip(v: string) {
    setTocTunelPrice(""); setTocTunelFaraFalt(false);
    if (v === "Toc tunel") { setTocFinisaj(v); setTocColectie(""); setTocModel(""); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toc = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
    const allR = Object.keys(toc[v] ?? {}).filter((k) => k !== "__");
    const newReglaj = allR.length === 1 ? allR[0] : "";
    const effReglaj = allR.length === 0 ? "__" : newReglaj;
    const fins = effReglaj ? Object.keys(toc[v]?.[effReglaj] ?? {}) : [];
    setTocFinisaj(v); setTocColectie(newReglaj);
    setTocModel(fins.length === 1 ? fins[0] : "");
  }

  function handleAddCostOption(label: string, price: number | null) {
    upsertCosturiItem(label, price);
    if (price !== null) setCostCustomPrices(p => ({...p, [label]: String(price)}));
  }
  function handleSetCostOptionPrice(label: string, price: number) {
    upsertCosturiItem(label, price);
    setCostCustomPrices(p => ({...p, [label]: String(price)}));
  }
  function handleSetModelPrice(modelName: string, price: number) {
    const key = `${finisaj}|${colectie}|${modelName}`;
    updateDoorPriceOverride(key, price);
  }
  function handleAddModelOption(label: string, price: number | null) {
    if (price !== null) handleSetModelPrice(label, price);
  }
  function handleDeleteCostOption(label: string) {
    deleteCosturiItem(label);
    setCostVars(prev => prev.map(v => v === label ? "" : v));
  }
  function handleDeleteModelOption(modelName: string) {
    const key = `${finisaj}|${colectie}|${modelName}`;
    deleteDoorPriceOverride(key);
    if (model === modelName) setModel("");
  }
  function handleTocReglaj(v: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toc = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
    const fins = v ? Object.keys(toc[tocFinisaj]?.[v] ?? {}) : [];
    setTocColectie(v); setTocModel(fins.length === 1 ? fins[0] : "");
  }

  // ── Firestore auto-save ────────────────────────────────────
  function saveOfferSnapshot(doors: DoorLineItem[]) {
    setDoc(doc(db, "offers", offerId), {
      offerNumber,
      offerDate,
      buyerName,
      buyerPhone,
      buyerAddress,
      agent,
      eurRate: parseFloat(exchangeRate) || 4.97,
      discountPercent: parseFloat(discountPercent) || 0,
      deliveryDays,
      advancePercent: parseFloat(advancePercent) || 50,
      totalEur: doors.reduce((s, d) => s + d.totalEur * (d.qty ?? 1), 0),
      doorsCount: doors.reduce((s, d) => s + (d.qty ?? 1), 0),
      doors,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  }

  // ── Cart actions ───────────────────────────────────────────
  function handleAddDoor() {
    if (usaPrice === null) return;
    const activeCostVars = costVars.filter(v => v && v !== NONE_OPT);
    const savedCustomPrices: Record<string, number> = {};
    for (const v of activeCostVars) {
      const p = parseFloat(costCustomPrices[v] ?? "");
      if (!isNaN(p) && p > 0) savedCustomPrices[v] = p;
    }
    const door: DoorLineItem = {
      id: `door-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      finisaj, colectie, model, culoare, deschidere, usaObs,
      usaPrice: usaPrice ?? 0,
      addToc,
      tocFinisaj, tocColectie, tocModel,
      tocObs: tocFinisaj === "Toc tunel" && tocTunelFaraFalt ? "Toc reglabil fara falt" : tocObs,
      tocPrice: (addToc && effectiveTocPrice) ? effectiveTocPrice : 0,
      nrBal, balMod, balCol, ferPrice: ferPrice ?? 0,
      manMod, manTip, manCol, manPrice: manPrice ?? 0,
      costVars: activeCostVars,
      costCustomPrices: savedCustomPrices,
      totalEur: currentDoorUnitTotal,
      qty: currentQty,
      dimUsa: "",
      golInitialLatime: "", golInitialInaltime: "",
      grosimePerete: "", reglajToc: "",
      golFinisatLatime: "", golFinisatInaltime: "",
      scurtare: "", tipBroasca: "", umplere: "", observatii: "",
    };
    const newDoors = [...cartDoors, door];
    setCartDoors(newDoors);
    saveOfferSnapshot(newDoors);
    resetDoorForm();
  }

  function handleRemoveDoor(id: string) {
    const newDoors = cartDoors.filter((d) => d.id !== id);
    setCartDoors(newDoors);
    saveOfferSnapshot(newDoors);
  }

  function handleDuplicateDoor(door: DoorLineItem) {
    const newDoors = [...cartDoors, { ...door, id: `door-${Date.now()}-dup-${Math.random().toString(36).slice(2)}` }];
    setCartDoors(newDoors);
    saveOfferSnapshot(newDoors);
  }

  function handleUpdateQty(id: string, qty: number) {
    const newDoors = cartDoors.map((d) => d.id === id ? { ...d, qty: Math.max(1, qty) } : d);
    setCartDoors(newDoors);
    saveOfferSnapshot(newDoors);
  }

  function handleFullReset() {
    resetDoorForm();
    setCartDoors([]);
  }

  // ── PDF ───────────────────────────────────────────────────
  function handleGeneratePdf() {
    const currActiveCostVars = costVars.filter(v => v && v !== NONE_OPT);
    const currSavedCustomPrices: Record<string, number> = {};
    for (const v of currActiveCostVars) {
      const p = parseFloat(costCustomPrices[v] ?? "");
      if (!isNaN(p) && p > 0) currSavedCustomPrices[v] = p;
    }
    const currentAsItem: DoorLineItem | null = usaPrice ? {
      id: `door-current-${Date.now()}`,
      finisaj, colectie, model, culoare, deschidere, usaObs,
      usaPrice: usaPrice ?? 0,
      addToc, tocFinisaj, tocColectie, tocModel,
      tocObs: tocFinisaj === "Toc tunel" && tocTunelFaraFalt ? "Toc reglabil fara falt" : tocObs,
      tocPrice: (addToc && effectiveTocPrice) ? effectiveTocPrice : 0,
      nrBal, balMod, balCol, ferPrice: ferPrice ?? 0,
      manMod, manTip, manCol, manPrice: manPrice ?? 0,
      costVars: currActiveCostVars,
      costCustomPrices: currSavedCustomPrices,
      totalEur: currentDoorUnitTotal,
      qty: currentQty,
      dimUsa: "",
      golInitialLatime: "", golInitialInaltime: "",
      grosimePerete: "", reglajToc: "",
      golFinisatLatime: "", golFinisatInaltime: "",
      scurtare: "", tipBroasca: "", umplere: "", observatii: "",
    } : null;

    const doorsForPdf = currentAsItem ? [...cartDoors, currentAsItem] : cartDoors;
    if (doorsForPdf.length === 0) return;

    const items: OfferItem[] = [];
    for (const d of doorsForPdf) {
      const q = d.qty ?? 1;
      items.push({
        name: `Usa ${d.finisaj} ${d.model}`,
        obs: [d.usaObs, d.culoare, d.deschidere].filter(Boolean).join(", ") || undefined,
        um: "buc",
        qty: q,
        priceRon: d.usaPrice * rate,
      });
      if (d.addToc && d.tocPrice) {
        const tocName = d.tocFinisaj === "Toc tunel"
          ? "Toc tunel — reglabil drept"
          : `Toc ${d.tocFinisaj}${d.tocColectie && d.tocColectie !== "__" ? ` ${d.tocColectie}` : ""}${d.tocModel ? ` - ${d.tocModel}` : ""}`;
        items.push({
          name: tocName,
          obs: d.tocObs || undefined,
          um: "buc",
          qty: q,
          priceRon: d.tocPrice * rate,
        });
      }
      if (d.ferPrice && d.nrBal) {
        items.push({
          name: `Feronerie ${d.nrBal} - ${d.balMod} ${d.balCol}`,
          um: "set",
          qty: q,
          priceRon: d.ferPrice * rate,
        });
      }
      if (d.manPrice && d.manMod) {
        items.push({
          name: `${d.manMod} - ${d.manTip}${d.manCol && !d.manCol.match(/^\d/) ? " - " + d.manCol.split("  –")[0] : ""}`,
          um: "set",
          qty: q,
          priceRon: d.manPrice * rate,
        });
      }
      for (const v of d.costVars) {
        const fixedP = costuriMap[v];
        const p = typeof fixedP === "number" ? fixedP : (d.costCustomPrices?.[v] ?? null);
        if (typeof p === "number" && p > 0) {
          items.push({ name: v, um: "serviciu", qty: q, priceRon: p * rate });
        }
      }
    }

    const totalRon = items.reduce((s, i) => s + i.priceRon * i.qty, 0);
    const advRon   = totalRon * (parseFloat(advancePercent) / 100);

    upsertOrder({
      id: offerNumber,
      savedAt: new Date().toISOString(),
      offerNumber,
      offerDate,
      buyerName,
      buyerPhone,
      doors: doorsForPdf,
    });

    generateOfferPdf({
      items,
      offerNumber,
      offerDate,
      buyerName,
      buyerPhone,
      buyerAddress,
      discountPercent: parseFloat(discountPercent) || 0,
      deliveryDays,
      agent,
      advanceRon: advRon,
    });

    // Update Firestore with final PDF snapshot
    setDoc(doc(db, "offers", offerId), {
      offerNumber,
      offerDate,
      buyerName,
      buyerPhone,
      buyerAddress,
      agent,
      eurRate: parseFloat(exchangeRate),
      discountPercent: parseFloat(discountPercent) || 0,
      deliveryDays,
      advancePercent: parseFloat(advancePercent) || 50,
      totalEur: grandTotal,
      totalRon,
      doorsCount: doorsForPdf.reduce((s, d) => s + (d.qty ?? 1), 0),
      doors: doorsForPdf,
      pdfGeneratedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  }

  const canGenerate = cartDoors.length > 0 || usaPrice !== null;
  const totalDoors  = cartDoors.reduce((s, d) => s + (d.qty ?? 1), 0) + (usaPrice !== null ? currentQty : 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        <svg className="animate-spin h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Se încarcă datele…
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── PASUL 1: Configurare ușă ──────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        {/* Ușă */}
        <Divider label="Ușă" />
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end mb-2">
          <div>
            <FieldLabel required>Finisaj</FieldLabel>
            <Combo value={finisaj} options={finisajOpts} onChange={handleFinisaj} />
          </div>
          <div>
            <FieldLabel>Colecție</FieldLabel>
            <Combo value={colectie} options={colectieOpts} onChange={handleColectie} disabled={!finisaj} />
          </div>
          <div>
            <FieldLabel>Model</FieldLabel>
            <Combo value={model} options={modelOpts} onChange={handleModel} disabled={!colectie}
              optionPrices={modelPrices} onAddOption={handleAddModelOption} onSetOptionPrice={handleSetModelPrice}
              onDeleteOption={handleDeleteModelOption}
              isDeletable={m => `${finisaj}|${colectie}|${m}` in doorPriceOverrides} />
          </div>
          <PriceBadge price={usaPrice} selected={!!model} />
        </div>

        {model && (
          <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-2 mt-2">
            <div>
              <FieldLabel>Culoare</FieldLabel>
              <Combo value={culoare} options={culoriOpts} onChange={setCuloare} placeholder="— culoare —" disabled={!model} />
            </div>
            <div>
              <FieldLabel>Deschidere</FieldLabel>
              <Combo value={deschidere} options={DESCHIDERI} onChange={setDeschidere} placeholder="— dr./stg. —" />
            </div>
            <div />
            <div>
              <FieldLabel>Observații</FieldLabel>
              <input
                value={usaObs}
                onChange={(e) => setUsaObs(e.target.value)}
                placeholder="ex: Decor nuc, RAL 9010…"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        )}

        {/* Toc toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none mt-4 mb-2">
          <div
            onClick={() => handleAddToc(!addToc)}
            className={`relative w-9 h-5 rounded-full transition-colors ${addToc ? "bg-indigo-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${addToc ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium text-slate-700">Adaugă Toc</span>
        </label>

        {addToc && (
          <div className="mt-1 mb-3 pl-3 border-l-2 border-indigo-200">
            <div className="flex gap-2 items-end">
              <div className="flex-[1.5]">
                <FieldLabel>Tip toc</FieldLabel>
                <Combo value={tocFinisaj} options={["Toc tunel", ...tocTipOpts]} onChange={handleTocTip} />
              </div>
              {tocFinisaj === "Toc tunel" ? (
                <>
                  <div className="flex-1">
                    <FieldLabel>Pret reglabil drept (EUR)</FieldLabel>
                    <input
                      type="number" min="0" placeholder="0"
                      value={tocTunelPrice}
                      onChange={e => setTocTunelPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Aferent domeniului de reglare</p>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none self-center mt-3">
                    <input
                      type="checkbox"
                      checked={tocTunelFaraFalt}
                      onChange={e => setTocTunelFaraFalt(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <span className="text-sm text-slate-600 whitespace-nowrap">Fara falt</span>
                  </label>
                  <PriceBadge price={parseFloat(tocTunelPrice) || null} selected={!!tocTunelPrice} />
                </>
              ) : (
                <>
                  {tocShowReglaj && (
                    <div className="flex-1">
                      <FieldLabel>Reglaj</FieldLabel>
                      <Combo value={tocColectie} options={tocAllReglaj} onChange={handleTocReglaj} disabled={!tocFinisaj}
                        optionPrices={tocAllReglajPrices} />
                    </div>
                  )}
                  {tocFinisajOpts.length > 0 && (
                    <div className="flex-1">
                      <FieldLabel>Finisaj toc</FieldLabel>
                      <Combo value={tocModel} options={tocFinisajOpts} onChange={setTocModel} disabled={!effectiveTocColectie}
                        optionPrices={tocFinisajPrices} />
                    </div>
                  )}
                  <PriceBadge price={tocPrice} selected={!!tocFinisaj} />
                </>
              )}
            </div>
            {tocFinisaj !== "Toc tunel" && (
              <div className="mt-2">
                <FieldLabel>Observații toc</FieldLabel>
                <input
                  value={tocObs}
                  onChange={(e) => setTocObs(e.target.value)}
                  placeholder="ex: Reglabil 100-120…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            )}
          </div>
        )}

        {/* Feronerie & Mâner */}
        <Divider label="Feronerie & Mâner" />
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end mb-3">
          <div>
            <FieldLabel>Nr. balamale</FieldLabel>
            <Combo value={nrBal} options={["2 balamale", "3 balamale"]} onChange={handleNrBal} />
          </div>
          <div>
            <FieldLabel>Tip balama</FieldLabel>
            <Combo value={balMod} options={nrBal ? balModels : []} onChange={handleBalMod} disabled={!nrBal} />
          </div>
          <div>
            <FieldLabel>Culoare balama</FieldLabel>
            <Combo value={balCol} options={balMod ? balCulori : []} onChange={handleBalCol} disabled={!balMod} />
          </div>
          <PriceBadge price={ferPrice} />
        </div>
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end">
          <div>
            <FieldLabel>Model mâner</FieldLabel>
            <Combo value={manMod} options={manereModels} onChange={handleManMod} />
          </div>
          <div>
            <FieldLabel>Tip mâner</FieldLabel>
            <Combo value={manTip} options={manMod ? manereTips[manMod] ?? [] : []} onChange={handleManTip} disabled={!manMod} />
          </div>
          <div>
            <FieldLabel>Culoare / variantă</FieldLabel>
            {hasRealColors
              ? <Combo value={manCol} options={manColOpts} onChange={(v) => setManCol(v)} disabled={!manTip} />
              : <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                  {manCol || "— auto —"}
                </div>
            }
          </div>
          <PriceBadge price={manPrice} />
        </div>

        {/* Costuri adiționale */}
        <Divider label="Costuri adiționale" />
        {costVars.map((val, idx) => {
          const knownPrice = val && val !== NONE_OPT ? allCostPrices[val] : undefined;
          const isVariable = knownPrice === null;
          const customP = isVariable ? (costCustomPrices[val] ?? "") : "";
          return (
            <div key={idx} className="flex items-end gap-2 mb-2 last:mb-0">
              <div className="flex-1">
                {idx === 0 && <FieldLabel>Selectează cost</FieldLabel>}
                <Combo
                  value={val}
                  options={[NONE_OPT, ...allCostLabels]}
                  onChange={(v) => handleCost(idx, v)}
                  optionPrices={allCostPrices}
                  onAddOption={handleAddCostOption}
                  onSetOptionPrice={handleSetCostOptionPrice}
                  onDeleteOption={handleDeleteCostOption}
                />
              </div>
              {isVariable ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="number" min="0" placeholder="0"
                    value={customP}
                    onChange={e => setCostCustomPrices(p => ({...p, [val]: e.target.value}))}
                    className="w-20 rounded-lg border border-amber-300 bg-amber-50 px-2 py-2 text-sm text-center font-bold text-amber-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                  />
                  <span className="text-xs text-slate-500 font-medium">EUR</span>
                </div>
              ) : (
                <div className="mb-0.5 shrink-0">
                  <PriceBadge price={val && val !== NONE_OPT ? (knownPrice ?? null) : null} />
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom bar: total + qty + add */}
        {usaPrice !== null && (
          <div className="mt-5 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3.5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-indigo-500 font-medium mb-0.5">Total ușă curentă</p>
                <p className="text-lg font-bold text-indigo-700">
                  {currentDoorUnitTotal} EUR
                  {currentQty > 1 && (
                    <span className="text-sm font-medium text-indigo-400 ml-2">
                      × {currentQty} = {currentDoorTotal} EUR
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Quantity */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">Cantitate</span>
                  <div className="flex items-center border border-indigo-200 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setCurrentQty((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 transition font-bold text-sm leading-none"
                    >−</button>
                    <span className="px-3 py-1.5 text-sm font-bold text-slate-800 min-w-[2rem] text-center tabular-nums">{currentQty}</span>
                    <button
                      onClick={() => setCurrentQty((q) => Math.min(20, q + 1))}
                      className="px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 transition font-bold text-sm leading-none"
                    >+</button>
                  </div>
                </div>
                {/* Clear form */}
                <button
                  onClick={resetDoorForm}
                  className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition"
                >
                  Șterge formular
                </button>
                {/* Add to cart */}
                <button
                  onClick={handleAddDoor}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-sm transition shadow-sm shadow-indigo-500/30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adaugă la ofertă
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PASUL 2: Coș uși ─────────────────────────────── */}
      {cartDoors.length > 0 && (
        <StepSection step={2} title={`Uși adăugate (${cartDoors.length} tipuri · ${cartDoors.reduce((s,d)=>s+(d.qty??1),0)} buc)`} icon="📋" accent="blue">
          <div className="space-y-2">
            {cartDoors.map((d, i) => (
              <div
                key={d.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 gap-3"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Index badge */}
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {d.finisaj} — {d.model}
                      {(d.qty ?? 1) > 1 && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
                          ×{d.qty}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-0.5">
                      {d.culoare && <span className="text-xs text-slate-500">{d.culoare}</span>}
                      {d.deschidere && <span className="text-xs text-slate-500">{d.deschidere}</span>}
                      {d.addToc && d.tocFinisaj && (
                        <span className="text-xs text-indigo-500">
                          + Toc {d.tocFinisaj}{d.tocColectie && d.tocColectie !== "__" ? ` ${d.tocColectie}` : ""}{d.tocModel ? ` — ${d.tocModel}` : ""}
                        </span>
                      )}
                      {d.ferPrice > 0 && <span className="text-xs text-slate-400">+ Feronerie {d.nrBal}</span>}
                      {d.manPrice > 0 && <span className="text-xs text-slate-400">+ {d.manMod}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Qty controls */}
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => handleUpdateQty(d.id, (d.qty ?? 1) - 1)}
                      className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold leading-none"
                    >−</button>
                    <span className="px-2 py-1 text-xs font-bold text-slate-700 min-w-[1.5rem] text-center tabular-nums">
                      {d.qty ?? 1}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(d.id, (d.qty ?? 1) + 1)}
                      className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold leading-none"
                    >+</button>
                  </div>

                  <span className="text-sm font-bold text-emerald-600 min-w-[4rem] text-right tabular-nums">
                    {d.totalEur * (d.qty ?? 1)} EUR
                  </span>

                  {/* Duplicate */}
                  <button
                    onClick={() => handleDuplicateDoor(d)}
                    title="Duplică"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveDoor(d.id)}
                    title="Șterge"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Subtotal coș</p>
              <p className="text-xl font-bold text-emerald-700">{cartTotal} EUR</p>
            </div>
          </div>
        </StepSection>
      )}

      {/* ── PASUL 3: Detalii ofertă ───────────────────────── */}
      <StepSection step={cartDoors.length > 0 ? 3 : 2} title="Detalii Ofertă & Client" icon="📄" accent="slate">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Input label="Nr. Ofertă" value={offerNumber} onChange={setOfferNumber} placeholder="ex: 2723" />
          <Input label="Data Ofertei" value={offerDate} onChange={setOfferDate} placeholder="01.01.2025" />
          <Input label="Curs EUR/RON" value={exchangeRate} onChange={setExchangeRate} onBlur={() => { const n = parseFloat(exchangeRate); if (!isNaN(n) && n > 0) updateEuroCourse(n); }} placeholder="4.97" type="number" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Input label="Nume Cumpărător" value={buyerName} onChange={setBuyerName} placeholder="Popescu Flavia" />
          <Input label="Telefon" value={buyerPhone} onChange={setBuyerPhone} placeholder="0771 000 000" />
          <div>
            <FieldLabel>Agent Vânzări</FieldLabel>
            <Combo value={agent} options={["Magazin Oradea"]} onChange={setAgent} />
          </div>
        </div>
        <div className="mb-4">
          <FieldLabel>Adresă Cumpărător</FieldLabel>
          <input
            value={buyerAddress}
            onChange={(e) => setBuyerAddress(e.target.value)}
            placeholder="str. Exemplu, nr. 1, bl. A, ap. 1, Oradea"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Reducere comercială (%)" value={discountPercent} onChange={setDiscountPercent} placeholder="0" type="number" />
          <Input label="Termen livrare (zile)" value={deliveryDays} onChange={setDeliveryDays} placeholder="30" />
          <Input label="Avans (%)" value={advancePercent} onChange={setAdvancePercent} placeholder="50" type="number" />
        </div>
      </StepSection>

      {/* ── Total + Generate ──────────────────────────────── */}
      {canGenerate && (
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Total ofertă · {totalDoors} {totalDoors === 1 ? "ușă" : "uși"}
            </span>
            <button
              onClick={handleFullReset}
              className="text-xs text-slate-400 hover:text-red-500 transition underline"
            >
              Resetează tot
            </button>
          </div>
          <div className="flex items-end gap-6 mb-1">
            <div>
              <p className="text-xs text-emerald-600 font-medium mb-0.5">Total EUR</p>
              <p className="text-3xl font-black text-emerald-700">{grandTotal} EUR</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium mb-0.5">≈ RON (curs {exchangeRate})</p>
              <p className="text-xl font-bold text-slate-700">
                {(grandTotal * rate).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON
              </p>
            </div>
          </div>
          {parseFloat(discountPercent) > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              După reducere {discountPercent}%:{" "}
              <span className="font-semibold text-slate-700">
                {(grandTotal * rate * (1 - parseFloat(discountPercent) / 100)).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON
              </span>
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleGeneratePdf}
        disabled={!canGenerate}
        className="w-full rounded-xl bg-[#1A2E4A] hover:bg-[#243d61] active:bg-[#1A2E4A] disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold py-4 text-sm tracking-wide transition shadow-md shadow-slate-900/20 flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generează Ofertă Comercială PDF
      </button>
    </div>
  );
}
