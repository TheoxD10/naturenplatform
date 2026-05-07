"use client";

import { useEffect, useRef, useState } from "react";
import {
  FINISAJ_ORDER,
  NONE_OPT,
  DESCHIDERI,
  ERKADO_REGLAJ,
  ERKADO_TOC_TUNEL,
  ERKADO_TOC_TUNEL_FINISAJE,
  type ErkadoTocTunelFinisaj,
  BROASCA_TIPURI_HW,
  BROASCA_DIMENSIUNI,
  BROASCA_CULORI_HW,
  BAL_DIMENSIUNI,
  MODELE_3_BALAMALE,
} from "../data/constants";
import { useConfiguratorOptions } from "../hooks/useConfiguratorOptions";
import { generateOfferPdf, type OfferItem } from "../lib/generatePdf";
import { upsertOrder, type DoorLineItem, type TocLineItem, type MontajEntry } from "../lib/offerStore";
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`flex items-center gap-3 ${ac.bar} border-b px-5 py-3 rounded-t-xl`}>
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

function MontajSection({ montaj, onChange }: { montaj: MontajEntry[]; onChange: (m: MontajEntry[]) => void }) {
  function addRow() { onChange([...montaj, { name: "", qty: 1, priceRon: 0 }]); }
  function removeRow(i: number) { onChange(montaj.filter((_, idx) => idx !== i)); }
  function updateRow(i: number, patch: Partial<MontajEntry>) {
    onChange(montaj.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  }
  return (
    <div className="space-y-2">
      {montaj.length === 0 ? (
        <button
          onClick={addRow}
          className="text-xs text-slate-400 hover:text-indigo-600 border border-dashed border-slate-300 rounded-lg px-3 py-2 w-full text-center transition"
        >
          + Adaugă intrare montaj
        </button>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Denumire</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 w-14 text-center">Buc.</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 w-20 text-center">Preț RON</span>
            <span className="w-6" />
          </div>
          {montaj.map((m, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
              <input
                type="text" placeholder="Denumire serviciu"
                value={m.name}
                onChange={e => updateRow(i, { name: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="number" min="1" placeholder="1"
                value={m.qty || ""}
                onChange={e => updateRow(i, { qty: parseInt(e.target.value) || 1 })}
                className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="number" min="0" step="0.01" placeholder="0"
                value={m.priceRon || ""}
                onChange={e => updateRow(i, { priceRon: parseFloat(e.target.value) || 0 })}
                className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-red-500 transition w-6 flex justify-center">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={addRow}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-1"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adaugă
          </button>
        </>
      )}
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

  // ── Standalone TOC form ───────────────────────────────────
  const [tocFinisaj, setTocFinisaj]     = useState("");
  const [tocBrand, setTocBrand]         = useState<"" | "naturen" | "erkado">("");
  const [tocColectie, setTocColectie]   = useState("");
  const [tocModel, setTocModel]         = useState("");
  const [tocObs, setTocObs]             = useState("");
  const [tocStandaloneQty, setTocStandaloneQty] = useState(1);
  const [tocCostVars, setTocCostVars]   = useState<string[]>([""]);
  const [tocCostCustomPrices, setTocCostCustomPrices] = useState<Record<string, string>>({});

  const [nrBal, setNrBal]         = useState("");
  const [balMod, setBalMod]       = useState("");
  const [balCol, setBalCol]       = useState("");
  const [balDim, setBalDim]       = useState("");

  const [broascaTip, setBroascaTip]       = useState("Broasca cheie");
  const [broascaDim, setBroascaDim]       = useState("");
  const [broascaCuloare, setBroascaCuloare] = useState("Argintiu");

  const [manMod, setManMod]       = useState("");
  const [manTip, setManTip]       = useState("");
  const [manCol, setManCol]       = useState("");

  const [costVars, setCostVars]   = useState<string[]>([""]);
  // Per-session prices for variable-price cost items (label → EUR)
  const [costCustomPrices, setCostCustomPrices] = useState<Record<string, string>>({});

  // Toc tunel manual pricing (Naturen)
  const [tocTunelPrice, setTocTunelPrice]       = useState("");
  const [tocTunelFaraFalt, setTocTunelFaraFalt] = useState(false);
  // Toc tunel brand/erkado selection
  const [tocTunelBrand, setTocTunelBrand]             = useState<"" | "naturen" | "erkado">("");
  const [tocTunelErkadoReglaj, setTocTunelErkadoReglaj] = useState("");
  const [tocTunelErkadoFinisaj, setTocTunelErkadoFinisaj] = useState<ErkadoTocTunelFinisaj | "">("");
  const [tocTunelDubla, setTocTunelDubla]             = useState(false);

  // Montaj entries
  const [usaMontaj, setUsaMontaj] = useState<MontajEntry[]>([]);
  const [tocMontaj, setTocMontaj] = useState<MontajEntry[]>([]);

  // Atipic door
  const [isAtipic, setIsAtipic]               = useState(false);
  const [atipicDesc, setAtipicDesc]           = useState("");
  const [atipicManualPrice, setAtipicManualPrice] = useState("");


  // ── Stable offer document ID for Firestore auto-save ──────
  const [offerId] = useState(() => `offer-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // ── Cart ───────────────────────────────────────────────────
  const [cartDoors, setCartDoors] = useState<DoorLineItem[]>([]);
  const [cartTocs, setCartTocs]   = useState<TocLineItem[]>([]);
  const [editingDoor, setEditingDoor] = useState<string | null>(null);
  const [editingToc, setEditingToc]   = useState<string | null>(null);

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
  const tocTipOpts   = Object.keys(tocV2);
  const tocAllReglaj = tocFinisaj ? Object.keys(tocV2[tocFinisaj] ?? {}).filter(k => k !== "__") : [];

  const tocShowReglaj = tocAllReglaj.length >= 2;
  const effectiveTocColectie = tocBrand === "erkado"
    ? ""
    : tocShowReglaj
    ? tocColectie
    : tocAllReglaj.length === 1
    ? tocAllReglaj[0]
    : "__";
  const tocFinisajOpts = (tocBrand === "naturen" && tocFinisaj && effectiveTocColectie)
    ? Object.keys(tocV2[tocFinisaj]?.[effectiveTocColectie] ?? {})
    : [];
  const erkadoReglajPrices = Object.fromEntries(ERKADO_REGLAJ.map(r => [r.range, r.priceEur]));

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
  const erkadoReglajPrice = tocBrand === "erkado"
    ? (ERKADO_REGLAJ.find(r => r.range === tocColectie)?.priceEur ?? null)
    : null;
  const tocPrice = tocBrand === "erkado"
    ? erkadoReglajPrice
    : (tocFinisaj && tocFinisaj !== "Toc tunel" && effectiveTocColectie && tocModel)
    ? (tocV2[tocFinisaj]?.[effectiveTocColectie]?.[tocModel] ?? null)
    : null;
  // Erkado toc tunel price lookup
  const erkadoTocTunelEntry = (tocFinisaj === "Toc tunel" && tocTunelBrand === "erkado" && tocTunelErkadoReglaj)
    ? ERKADO_TOC_TUNEL.find(e => e.range === tocTunelErkadoReglaj) ?? null
    : null;
  const erkadoTocTunelBasePrice: number | null = (erkadoTocTunelEntry && tocTunelErkadoFinisaj)
    ? (erkadoTocTunelEntry[tocTunelErkadoFinisaj as keyof typeof erkadoTocTunelEntry] as number ?? null)
    : null;
  const erkadoTocTunelReglajPrices: Record<string, number | null> = Object.fromEntries(
    ERKADO_TOC_TUNEL.map(e => [e.range, tocTunelErkadoFinisaj ? (e[tocTunelErkadoFinisaj as keyof typeof e] as number ?? null) : null])
  );
  const erkadoTocTunelFinisajPrices: Record<string, number | null> = erkadoTocTunelEntry
    ? Object.fromEntries(ERKADO_TOC_TUNEL_FINISAJE.map(f => [f, erkadoTocTunelEntry[f as keyof typeof erkadoTocTunelEntry] as number ?? null]))
    : {};

  const tocTunelNatuurenBase = tocTunelBrand === "naturen" ? (parseFloat(tocTunelPrice) || null) : null;
  const tocTunelBasePrice = tocFinisaj === "Toc tunel"
    ? (tocTunelBrand === "erkado" ? erkadoTocTunelBasePrice : tocTunelNatuurenBase)
    : null;
  const effectiveTocPrice = tocFinisaj === "Toc tunel"
    ? (tocTunelBasePrice !== null ? Math.round(tocTunelBasePrice * (tocTunelDubla ? 1.3 : 1) * 100) / 100 : null)
    : tocPrice;

  // Atipic effective price
  const effectiveUsaPrice = isAtipic ? (parseFloat(atipicManualPrice) || 0) : (usaPrice ?? 0);

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
    if (!buyerName && !buyerPhone && cartDoors.length === 0 && cartTocs.length === 0) return;
    const t = setTimeout(() => saveOfferSnapshot(cartDoors, cartTocs), 1500);
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
    effectiveUsaPrice +
    (ferPrice ?? 0) +
    (manPrice ?? 0) +
    currentCostParts.reduce((s, p) => s + p, 0);

  const currentDoorTotal = currentDoorUnitTotal * currentQty;

  const cartDoorsTotal = cartDoors.reduce((s, d) => s + d.totalEur * (d.qty ?? 1), 0);
  const cartTocsTotal  = cartTocs.reduce((s, t) => s + t.totalEur * t.qty, 0);
  const cartTotal      = cartDoorsTotal + cartTocsTotal;
  const grandTotal     = cartTotal + currentDoorTotal;
  const rate       = parseFloat(exchangeRate) || 4.97;

  // ── Form handlers ──────────────────────────────────────────
  function resetHw() {
    setNrBal(""); setBalMod(""); setBalCol("Argintiu"); setBalDim("");
    setManMod(""); setManTip(""); setManCol("");
    setCostVars([""]); setCostCustomPrices({});
    setBroascaTip("Broasca cheie"); setBroascaDim(""); setBroascaCuloare("Argintiu");
  }
  function resetDoorForm() {
    setFinisaj(""); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); setUsaObs("");
    setCurrentQty(1);
    setEditingDoor(null);
    resetHw();
    setIsAtipic(false); setAtipicDesc(""); setAtipicManualPrice("");
    setUsaMontaj([]);
  }
  function resetTocForm() {
    setTocFinisaj(""); setTocBrand(""); setTocColectie(""); setTocModel(""); setTocObs("");
    setTocStandaloneQty(1);
    setTocTunelPrice(""); setTocTunelFaraFalt(false);
    setTocTunelBrand(""); setTocTunelErkadoReglaj(""); setTocTunelErkadoFinisaj(""); setTocTunelDubla(false);
    setTocCostVars([""]); setTocCostCustomPrices({});
    setTocMontaj([]);
    setEditingToc(null);
  }

  function smartNrBal(newFinisaj: string, newColectie: string, newModel: string): string {
    if (MODELE_3_BALAMALE.has(newColectie) || MODELE_3_BALAMALE.has(newModel)) return "3 balamale";
    if (newFinisaj === "FI3D") return "2 balamale";
    return "3 balamale";
  }

  function applySmartDefaults(newFinisaj: string, newColectie: string, newModel: string) {
    setNrBal(smartNrBal(newFinisaj, newColectie, newModel));
    setBroascaTip("Broasca cheie");
    setBroascaCuloare("Argintiu");
  }

  function handleFinisaj(v: string)  { setFinisaj(v); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleColectie(v: string) {
    setColectie(v); setModel(""); setCuloare(""); setDeschidere(""); resetHw();
    if (v) applySmartDefaults(finisaj, v, "");
  }
  function handleModel(v: string) {
    setModel(v); setCuloare(""); setDeschidere(""); resetHw();
    if (v) applySmartDefaults(finisaj, colectie, v);
  }
  function handleNrBal(v: string)    { setNrBal(v); setBalMod(""); setBalCol("Argintiu"); setBalDim(""); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleBalMod(v: string)   { setBalMod(v); setBalCol("Argintiu"); setBalDim(""); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleBalCol(v: string)   { setBalCol(v); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleManMod(v: string)   { setManMod(v); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleManTip(v: string)   { setManTip(v); setManCol(""); setCostVars([""]); }
  function handleCost(idx: number, val: string) {
    const next = [...costVars.slice(0, idx), val];
    if (val && val !== NONE_OPT) next.push("");
    setCostVars(next);
  }
  function handleTocTip(v: string) {
    setTocTunelPrice(""); setTocTunelFaraFalt(false);
    setTocTunelBrand(""); setTocTunelErkadoReglaj(""); setTocTunelErkadoFinisaj(""); setTocTunelDubla(false);
    if (v === "Toc tunel") { setTocFinisaj(v); setTocColectie(""); setTocModel(""); setTocBrand(""); return; }
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
  function handleTocBrand(b: "naturen" | "erkado") {
    setTocBrand(b); setTocColectie(""); setTocModel("");
  }

  function handleTocCost(idx: number, val: string) {
    const next = [...tocCostVars.slice(0, idx), val];
    if (val && val !== NONE_OPT) next.push("");
    setTocCostVars(next);
  }

  function handleTocReglaj(v: string) {
    if (tocBrand === "erkado") {
      setTocColectie(v); setTocModel("");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toc = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
    const fins = v ? Object.keys(toc[tocFinisaj]?.[v] ?? {}) : [];
    setTocColectie(v); setTocModel(fins.length === 1 ? fins[0] : "");
  }

  // ── Firestore auto-save ────────────────────────────────────
  function saveOfferSnapshot(doors: DoorLineItem[], tocs?: TocLineItem[]) {
    const effectiveTocs = tocs ?? cartTocs;
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
      totalEur: doors.reduce((s, d) => s + d.totalEur * (d.qty ?? 1), 0) +
                effectiveTocs.reduce((s, t) => s + t.totalEur * t.qty, 0),
      doorsCount: doors.reduce((s, d) => s + (d.qty ?? 1), 0),
      doors,
      tocs: effectiveTocs,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
  }

  // ── Cart actions ───────────────────────────────────────────
  function handleAddDoor() {
    if (isAtipic && !atipicDesc.trim()) return;
    if (!isAtipic && usaPrice === null) return;
    const activeCostVars = costVars.filter(v => v && v !== NONE_OPT);
    const savedCustomPrices: Record<string, number> = {};
    for (const v of activeCostVars) {
      const p = parseFloat(costCustomPrices[v] ?? "");
      if (!isNaN(p) && p > 0) savedCustomPrices[v] = p;
    }

    const activeMontaj = usaMontaj.filter(m => m.name.trim() || m.priceRon > 0);
    if (editingDoor) {
      const original = cartDoors.find(d => d.id === editingDoor);
      const updated: DoorLineItem = {
        id: editingDoor,
        finisaj: isAtipic ? "" : finisaj,
        colectie: isAtipic ? "" : colectie,
        model: isAtipic ? "" : model,
        culoare: isAtipic ? "" : culoare,
        deschidere, usaObs,
        usaPrice: effectiveUsaPrice,
        isAtipic: isAtipic || undefined,
        atipicDesc: isAtipic ? atipicDesc : undefined,
        montaj: activeMontaj.length > 0 ? activeMontaj : undefined,
        addToc: false, tocFinisaj: "", tocColectie: "", tocModel: "", tocObs: "", tocPrice: 0,
        nrBal, balMod, balCol, balDim, ferPrice: ferPrice ?? 0,
        broascaTip, broascaDim, broascaCuloare,
        manMod, manTip, manCol, manPrice: manPrice ?? 0,
        costVars: activeCostVars,
        costCustomPrices: savedCustomPrices,
        totalEur: currentDoorUnitTotal,
        qty: currentQty,
        dimUsa: original?.dimUsa ?? "",
        golInitialLatime: original?.golInitialLatime ?? "",
        golInitialInaltime: original?.golInitialInaltime ?? "",
        grosimePerete: original?.grosimePerete ?? "",
        reglajToc: original?.reglajToc ?? "",
        golFinisatLatime: original?.golFinisatLatime ?? "",
        golFinisatInaltime: original?.golFinisatInaltime ?? "",
        scurtare: original?.scurtare ?? "",
        tipBroasca: original?.tipBroasca ?? "",
        umplere: original?.umplere ?? "",
        observatii: original?.observatii ?? "",
      };
      const newDoors = cartDoors.map(d => d.id === editingDoor ? updated : d);
      setCartDoors(newDoors);
      saveOfferSnapshot(newDoors);
      setEditingDoor(null);
      return;
    }

    const door: DoorLineItem = {
      id: `door-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      finisaj: isAtipic ? "" : finisaj,
      colectie: isAtipic ? "" : colectie,
      model: isAtipic ? "" : model,
      culoare: isAtipic ? "" : culoare,
      deschidere, usaObs,
      usaPrice: effectiveUsaPrice,
      isAtipic: isAtipic || undefined,
      atipicDesc: isAtipic ? atipicDesc : undefined,
      montaj: activeMontaj.length > 0 ? activeMontaj : undefined,
      addToc: false,
      tocFinisaj: "", tocColectie: "", tocModel: "",
      tocObs: "", tocPrice: 0,
      nrBal, balMod, balCol, balDim, ferPrice: ferPrice ?? 0,
      broascaTip, broascaDim, broascaCuloare,
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

  function handlePatchDoor(id: string, patch: Partial<DoorLineItem>) {
    const newDoors = cartDoors.map((d) => d.id === id ? { ...d, ...patch } : d);
    setCartDoors(newDoors);
    saveOfferSnapshot(newDoors);
  }

  function handlePatchDoorColectie(id: string, doorFinisaj: string, newColectie: string) {
    handlePatchDoor(id, { colectie: newColectie, model: "", culoare: "", usaPrice: 0, totalEur: 0 });
  }

  function handlePatchDoorModel(id: string, door: DoorLineItem, newModel: string) {
    const newUsaPrice = doorPriceOverrides[`${door.finisaj}|${door.colectie}|${newModel}`]
      ?? doorsData[door.finisaj]?.[door.colectie]?.[newModel]
      ?? door.usaPrice;
    const costTotal = door.costVars.reduce((s, v) => {
      if (!v) return s;
      const p = door.costCustomPrices?.[v] ?? costuriMap[v];
      return s + (typeof p === "number" ? p : 0);
    }, 0);
    const newTotal = newUsaPrice + door.ferPrice + door.manPrice + costTotal;
    handlePatchDoor(id, { model: newModel, usaPrice: newUsaPrice, totalEur: newTotal });
  }

  // ── TOC cart actions ──────────────────────────────────────
  function handleAddTocToCart() {
    const tocPriceVal = effectiveTocPrice ?? 0;
    if (tocPriceVal === 0) return;
    const isErkado = tocBrand === "erkado";
    const erkadoRangeVal = isErkado ? tocColectie : "";

    const activeTocCostVars = tocCostVars.filter(v => v && v !== NONE_OPT);
    const savedTocCustomPrices: Record<string, number> = {};
    for (const v of activeTocCostVars) {
      const p = parseFloat(tocCostCustomPrices[v] ?? "");
      if (!isNaN(p) && p > 0) savedTocCustomPrices[v] = p;
    }
    const tocCostTotal = activeTocCostVars.reduce((s, v) => {
      const p = allCostPrices[v];
      if (typeof p === "number") return s + p;
      const cp = parseFloat(tocCostCustomPrices[v] ?? "0");
      return s + (isNaN(cp) ? 0 : cp);
    }, 0);
    const activeMontaj = tocMontaj.filter(m => m.name.trim() || m.priceRon > 0);

    const makeItem = (id: string): TocLineItem => ({
      id,
      brand: tocFinisaj === "Toc tunel"
        ? (tocTunelBrand as "naturen" | "erkado" || "naturen")
        : (isErkado ? "erkado" : "naturen"),
      tocFinisaj, tocColectie, tocModel,
      erkadoRange: tocFinisaj === "Toc tunel" && tocTunelBrand === "erkado" ? tocTunelErkadoReglaj : erkadoRangeVal,
      erkadoCollection: tocFinisaj === "Toc tunel" && tocTunelBrand === "erkado" ? tocTunelErkadoFinisaj : "",
      faraFalt: tocFinisaj === "Toc tunel" ? tocTunelFaraFalt : undefined,
      tunelBrand: tocFinisaj === "Toc tunel" ? (tocTunelBrand || undefined) : undefined,
      tunelReglaj: tocFinisaj === "Toc tunel" && tocTunelBrand === "erkado" ? tocTunelErkadoReglaj : undefined,
      tunelFinisaj: tocFinisaj === "Toc tunel" && tocTunelBrand === "erkado" ? tocTunelErkadoFinisaj : undefined,
      isDubla: tocTunelDubla || undefined,
      obs: tocObs,
      tocPrice: tocPriceVal,
      costVars: activeTocCostVars,
      costCustomPrices: savedTocCustomPrices,
      montaj: activeMontaj.length > 0 ? activeMontaj : undefined,
      qty: tocStandaloneQty,
      totalEur: tocPriceVal + tocCostTotal,
    });

    if (editingToc) {
      const newTocs = cartTocs.map(t => t.id === editingToc ? makeItem(editingToc) : t);
      setCartTocs(newTocs);
      saveOfferSnapshot(cartDoors, newTocs);
      setEditingToc(null);
      return;
    }

    const newTocs = [...cartTocs, makeItem(`toc-${Date.now()}-${Math.random().toString(36).slice(2)}`)];
    setCartTocs(newTocs);
    saveOfferSnapshot(cartDoors, newTocs);
  }

  function handleRemoveToc(id: string) {
    const newTocs = cartTocs.filter(t => t.id !== id);
    setCartTocs(newTocs);
    saveOfferSnapshot(cartDoors, newTocs);
  }

  function handleDuplicateToc(toc: TocLineItem) {
    const newTocs = [...cartTocs, { ...toc, id: `toc-${Date.now()}-dup-${Math.random().toString(36).slice(2)}` }];
    setCartTocs(newTocs);
    saveOfferSnapshot(cartDoors, newTocs);
  }

  function handleUpdateTocQty(id: string, qty: number) {
    const newTocs = cartTocs.map(t => t.id === id ? { ...t, qty: Math.max(1, qty) } : t);
    setCartTocs(newTocs);
    saveOfferSnapshot(cartDoors, newTocs);
  }

  function handlePatchToc(id: string, patch: Partial<TocLineItem>) {
    const newTocs = cartTocs.map(t => t.id === id ? { ...t, ...patch } : t);
    setCartTocs(newTocs);
    saveOfferSnapshot(cartDoors, newTocs);
  }

  function handleFullReset() {
    resetDoorForm();
    resetTocForm();
    setCartDoors([]);
    setCartTocs([]);
  }

  // ── Edit mode: load a cart item back into its form ────────
  function handleEditDoor(door: DoorLineItem) {
    setEditingDoor(door.id);
    setIsAtipic(door.isAtipic ?? false);
    setAtipicDesc(door.atipicDesc ?? "");
    setAtipicManualPrice(door.isAtipic ? String(door.usaPrice) : "");
    setUsaMontaj(door.montaj ?? []);
    setFinisaj(door.finisaj);
    setColectie(door.colectie);
    setModel(door.model);
    setCuloare(door.culoare);
    setDeschidere(door.deschidere);
    setUsaObs(door.usaObs);
    setCurrentQty(door.qty ?? 1);
    setNrBal(door.nrBal);
    setBalMod(door.balMod);
    setBalCol(door.balCol ?? "Argintiu");
    setBalDim(door.balDim ?? "");
    setBroascaTip(door.broascaTip ?? "Broasca cheie");
    setBroascaDim(door.broascaDim ?? "");
    setBroascaCuloare(door.broascaCuloare ?? "Argintiu");
    setManMod(door.manMod);
    setManTip(door.manTip);
    setManCol(door.manCol);
    setCostVars(door.costVars.length > 0 ? [...door.costVars, ""] : [""]);
    setCostCustomPrices(Object.fromEntries(
      Object.entries(door.costCustomPrices ?? {}).map(([k, v]) => [k, String(v)])
    ));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditToc(toc: TocLineItem) {
    setEditingToc(toc.id);
    setTocFinisaj(toc.tocFinisaj);
    setTocObs(toc.obs);
    setTocStandaloneQty(toc.qty);
    setTocMontaj(toc.montaj ?? []);
    const savedCostVars = toc.costVars ?? [];
    setTocCostVars(savedCostVars.length > 0 ? [...savedCostVars, ""] : [""]);
    setTocCostCustomPrices(Object.fromEntries(
      Object.entries(toc.costCustomPrices ?? {}).map(([k, v]) => [k, String(v)])
    ));
    if (toc.tocFinisaj === "Toc tunel") {
      setTocBrand("");
      setTocColectie("");
      setTocModel("");
      const tBrand = toc.tunelBrand ?? (toc.brand === "erkado" ? "erkado" : "naturen");
      setTocTunelBrand(tBrand);
      setTocTunelFaraFalt(toc.faraFalt ?? false);
      setTocTunelDubla(toc.isDubla ?? false);
      if (tBrand === "erkado") {
        setTocTunelErkadoReglaj(toc.tunelReglaj ?? toc.erkadoRange ?? "");
        setTocTunelErkadoFinisaj((toc.tunelFinisaj ?? toc.erkadoCollection ?? "") as ErkadoTocTunelFinisaj | "");
        setTocTunelPrice("");
      } else {
        setTocTunelPrice(String(toc.tocPrice));
        setTocTunelErkadoReglaj(""); setTocTunelErkadoFinisaj("");
      }
    } else {
      setTocBrand(toc.brand === "erkado" ? "erkado" : "naturen");
      setTocColectie(toc.brand === "erkado" ? toc.erkadoRange : toc.tocColectie);
      setTocModel(toc.tocModel);
      setTocTunelBrand(""); setTocTunelPrice(""); setTocTunelFaraFalt(false);
      setTocTunelErkadoReglaj(""); setTocTunelErkadoFinisaj(""); setTocTunelDubla(false);
    }
  }

  // ── PDF ───────────────────────────────────────────────────
  function handleGeneratePdf() {
    const currActiveCostVars = costVars.filter(v => v && v !== NONE_OPT);
    const currSavedCustomPrices: Record<string, number> = {};
    for (const v of currActiveCostVars) {
      const p = parseFloat(costCustomPrices[v] ?? "");
      if (!isNaN(p) && p > 0) currSavedCustomPrices[v] = p;
    }
    const canIncludeCurrentDoor = isAtipic ? !!atipicDesc.trim() : usaPrice !== null;
    const currentAsItem: DoorLineItem | null = canIncludeCurrentDoor ? {
      id: `door-current-${Date.now()}`,
      finisaj: isAtipic ? "" : finisaj,
      colectie: isAtipic ? "" : colectie,
      model: isAtipic ? "" : model,
      culoare: isAtipic ? "" : culoare,
      deschidere, usaObs,
      usaPrice: effectiveUsaPrice,
      isAtipic: isAtipic || undefined,
      atipicDesc: isAtipic ? atipicDesc : undefined,
      montaj: usaMontaj.filter(m => m.name.trim() || m.priceRon > 0),
      addToc: false,
      tocFinisaj: "", tocColectie: "", tocModel: "",
      tocObs: "", tocPrice: 0,
      nrBal, balMod, balCol, balDim, ferPrice: ferPrice ?? 0,
      broascaTip, broascaDim, broascaCuloare,
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
    if (doorsForPdf.length === 0 && cartTocs.length === 0) return;

    const items: OfferItem[] = [];
    for (const d of doorsForPdf) {
      const q = d.qty ?? 1;
      const doorName = d.isAtipic
        ? `Ușă atipică — ${d.atipicDesc}`
        : `Usa ${d.finisaj} ${d.model}`;
      items.push({
        name: doorName,
        obs: [d.usaObs, d.isAtipic ? undefined : d.culoare, d.deschidere].filter(Boolean).join(", ") || undefined,
        um: "buc",
        qty: q,
        priceRon: d.usaPrice * rate,
      });
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
      for (const m of d.montaj ?? []) {
        if (m.name.trim() && m.priceRon > 0) {
          items.push({ name: `Montaj: ${m.name}`, um: "buc", qty: m.qty, priceRon: m.priceRon });
        }
      }
    }

    // Add standalone TOC items to PDF
    for (const t of cartTocs) {
      const isTunelPdf = t.tocFinisaj === "Toc tunel";
      const tocLabel = isTunelPdf
        ? (t.tunelBrand === "erkado"
          ? `Toc tunel Erkado — ${t.tunelReglaj ?? t.erkadoRange}${t.tunelFinisaj ?? t.erkadoCollection ? ` — ${t.tunelFinisaj ?? t.erkadoCollection}` : ""}${t.isDubla ? " (Dublă)" : ""}`
          : `Toc tunel Naturen${t.isDubla ? " (Dublă)" : ""}`)
        : t.brand === "erkado"
          ? `Toc Erkado${t.tocFinisaj ? ` ${t.tocFinisaj}` : ""} — Reglaj ${t.erkadoRange}${t.erkadoCollection ? ` — ${t.erkadoCollection}` : ""}`
          : `Toc ${t.tocFinisaj}${t.tocColectie && t.tocColectie !== "__" ? ` ${t.tocColectie}` : ""}${t.tocModel ? ` — ${t.tocModel}` : ""}`;
      const obsLines = [t.faraFalt ? "Fara falt" : undefined, t.obs || undefined].filter(Boolean);
      items.push({
        name: tocLabel,
        obs: obsLines.join("; ") || undefined,
        um: "buc",
        qty: t.qty,
        priceRon: t.tocPrice * rate,
      });
      for (const m of t.montaj ?? []) {
        if (m.name.trim() && m.priceRon > 0) {
          items.push({ name: `Montaj: ${m.name}`, um: "buc", qty: m.qty, priceRon: m.priceRon });
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
      tocs: cartTocs,
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

  const canGenerate = cartDoors.length > 0 || cartTocs.length > 0 || usaPrice !== null || (isAtipic && !!atipicDesc.trim());

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
      <div className={`rounded-xl border shadow-sm p-5 transition-colors ${
        isAtipic
          ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200"
          : editingDoor
          ? "border-amber-400 ring-2 ring-amber-200 bg-white"
          : "border-slate-200 bg-white"
      }`}>
        {editingDoor && (
          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-xs font-semibold text-amber-700">Editezi ușa {cartDoors.findIndex(d => d.id === editingDoor) + 1} — modifică orice câmp și salvează</span>
            <button onClick={resetDoorForm} className="text-xs text-amber-600 hover:text-amber-800 font-medium underline">Anulează editarea</button>
          </div>
        )}
        {/* Ușă */}
        <div className="flex items-center gap-2 my-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {isAtipic ? "Ușă Atipică" : "Ușă"}
          </span>
          <div className="flex-1 h-px bg-slate-100" />
          <button
            onClick={() => { setIsAtipic(a => !a); setFinisaj(""); setColectie(""); setModel(""); setAtipicDesc(""); setAtipicManualPrice(""); }}
            className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition shrink-0 ${
              isAtipic
                ? "bg-amber-400 text-white border-amber-400"
                : "bg-white text-slate-500 border-slate-300 hover:border-amber-400 hover:text-amber-600"
            }`}
          >
            Atipic
          </button>
        </div>

        {isAtipic ? (
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end mb-2">
            <div>
              <FieldLabel required>Descriere atipic</FieldLabel>
              <input
                value={atipicDesc}
                onChange={e => setAtipicDesc(e.target.value)}
                placeholder="ex: Ușă specială cu dimensiuni non-standard…"
                className="w-full rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm text-amber-900 placeholder-amber-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <FieldLabel>Preț (EUR)</FieldLabel>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min="0" placeholder="0"
                  value={atipicManualPrice}
                  onChange={e => setAtipicManualPrice(e.target.value)}
                  className="w-24 rounded-lg border border-amber-300 bg-white px-3 py-2.5 text-sm font-bold text-amber-800 text-center outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <span className="text-xs text-slate-500 font-medium">EUR</span>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {(model || isAtipic) && (
          <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-2 mt-2">
            {!isAtipic && (
              <div>
                <FieldLabel>Culoare</FieldLabel>
                <Combo value={culoare} options={culoriOpts} onChange={setCuloare} placeholder="— culoare —" disabled={!model} />
              </div>
            )}
            <div className={isAtipic ? "" : ""}>
              <FieldLabel>Deschidere</FieldLabel>
              <Combo value={deschidere} options={DESCHIDERI} onChange={setDeschidere} placeholder="— dr./stg. —" />
            </div>
            {!isAtipic && <div />}
            <div className={isAtipic ? "col-span-3" : ""}>
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

        {/* Feronerie & Mâner */}
        <Divider label="Feronerie & Mâner" />

        {/* Broasca */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Broașcă</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <FieldLabel>Tip broașcă</FieldLabel>
              <Combo value={broascaTip} options={BROASCA_TIPURI_HW} onChange={setBroascaTip} />
            </div>
            <div>
              <FieldLabel>Dimensiune</FieldLabel>
              <Combo value={broascaDim} options={BROASCA_DIMENSIUNI} onChange={setBroascaDim} />
            </div>
            <div>
              <FieldLabel>Culoare</FieldLabel>
              <Combo value={broascaCuloare} options={BROASCA_CULORI_HW} onChange={setBroascaCuloare} />
            </div>
          </div>
        </div>

        {/* Balamale */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">Balamale</p>
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 items-end">
            <div>
              <FieldLabel>Nr. balamale</FieldLabel>
              <Combo value={nrBal} options={["2 balamale", "3 balamale"]} onChange={handleNrBal} />
            </div>
            <div>
              <FieldLabel>Dimensiune</FieldLabel>
              <Combo value={balDim} options={nrBal ? BAL_DIMENSIUNI : []} onChange={setBalDim} disabled={!nrBal} />
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

        {/* Montaj */}
        <Divider label="Montaj" />
        <MontajSection montaj={usaMontaj} onChange={setUsaMontaj} />

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
        {(isAtipic ? !!atipicDesc.trim() : usaPrice !== null) && (
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
                  {editingDoor ? "Salvează modificările" : "Adaugă la ofertă"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PASUL 2: Configurare toc ─────────────────────── */}
      <StepSection step={2} title={editingToc ? `Editezi tocul ${cartTocs.findIndex(t => t.id === editingToc) + 1}` : "Configurare Toc"} icon="🚪" accent="indigo">
        {editingToc && (
          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-xs font-semibold text-amber-700">Editezi tocul {cartTocs.findIndex(t => t.id === editingToc) + 1} — modifică orice câmp și salvează</span>
            <button onClick={resetTocForm} className="text-xs text-amber-600 hover:text-amber-800 font-medium underline">Anulează editarea</button>
          </div>
        )}
        <div className="space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-[1.5]">
              <FieldLabel>Tip toc</FieldLabel>
              <Combo value={tocFinisaj} options={["Toc tunel", ...tocTipOpts]} onChange={handleTocTip} />
            </div>
            {tocFinisaj === "Toc tunel" ? (
              <>
                {/* Brand selector for toc tunel */}
                <div className="flex-none self-end pb-0.5">
                  <FieldLabel>Brand</FieldLabel>
                  <div className="flex gap-1 mt-1">
                    {(["naturen", "erkado"] as const).map(b => (
                      <button
                        key={b}
                        onClick={() => { setTocTunelBrand(b); setTocTunelErkadoReglaj(""); setTocTunelErkadoFinisaj(""); setTocTunelDubla(false); }}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                          tocTunelBrand === b
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-300 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {b === "naturen" ? "Naturen" : "Erkado"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Naturen tunel: manual price */}
                {tocTunelBrand === "naturen" && (
                  <>
                    <div className="flex-1">
                      <FieldLabel>Preț (EUR)</FieldLabel>
                      <input
                        type="number" min="0" placeholder="0"
                        value={tocTunelPrice}
                        onChange={e => setTocTunelPrice(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none self-center mt-3">
                      <input type="checkbox" checked={tocTunelFaraFalt} onChange={e => setTocTunelFaraFalt(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                      <span className="text-sm text-slate-600 whitespace-nowrap">Fara falt</span>
                    </label>
                  </>
                )}

                {/* Erkado tunel: reglaj + finisaj */}
                {tocTunelBrand === "erkado" && (
                  <>
                    <div className="flex-1">
                      <FieldLabel>Reglaj</FieldLabel>
                      <Combo
                        value={tocTunelErkadoReglaj}
                        options={ERKADO_TOC_TUNEL.map(e => e.range)}
                        onChange={v => { setTocTunelErkadoReglaj(v); setTocTunelErkadoFinisaj(""); }}
                        optionPrices={erkadoTocTunelReglajPrices}
                      />
                    </div>
                    {tocTunelErkadoReglaj && (
                      <div className="flex-1">
                        <FieldLabel>Finisaj toc</FieldLabel>
                        <Combo
                          value={tocTunelErkadoFinisaj}
                          options={[...ERKADO_TOC_TUNEL_FINISAJE]}
                          onChange={v => setTocTunelErkadoFinisaj(v as ErkadoTocTunelFinisaj)}
                          optionPrices={erkadoTocTunelFinisajPrices}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Dubla checkbox */}
                {tocTunelBrand && tocTunelBasePrice !== null && (
                  <label className="flex items-center gap-1.5 cursor-pointer select-none self-center mt-3">
                    <input type="checkbox" checked={tocTunelDubla} onChange={e => setTocTunelDubla(e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                    <span className="text-sm text-slate-600 whitespace-nowrap">Dublă (+30%)</span>
                  </label>
                )}

                <PriceBadge price={effectiveTocPrice} selected={!!(tocTunelBrand && tocTunelBasePrice !== null)} />
              </>
            ) : tocFinisaj ? (
              <>
                {/* Brand selector */}
                <div className="flex-none self-end pb-0.5">
                  <FieldLabel>Brand</FieldLabel>
                  <div className="flex gap-1 mt-1">
                    {(["naturen", "erkado"] as const).map(b => (
                      <button
                        key={b}
                        onClick={() => handleTocBrand(b)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                          tocBrand === b
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-300 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {b === "naturen" ? "Naturen" : "Erkado"}
                      </button>
                    ))}
                  </div>
                </div>
                {tocBrand === "erkado" && (
                  <div className="flex-1">
                    <FieldLabel>Reglaj</FieldLabel>
                    <Combo value={tocColectie} options={ERKADO_REGLAJ.map(r => r.range)} onChange={handleTocReglaj}
                      optionPrices={erkadoReglajPrices} />
                  </div>
                )}
                {tocBrand === "naturen" && tocShowReglaj && (
                  <div className="flex-1">
                    <FieldLabel>Reglaj</FieldLabel>
                    <Combo value={tocColectie} options={tocAllReglaj} onChange={handleTocReglaj}
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
                <PriceBadge price={tocPrice} selected={!!tocBrand} />
              </>
            ) : null}
          </div>
          {/* Observatii — shown for all toc types */}
          {(tocFinisaj !== "Toc tunel" ? !!(tocFinisaj && tocBrand) : !!tocTunelBrand) && (
            <div>
              <FieldLabel>Observații</FieldLabel>
              <textarea
                value={tocObs}
                onChange={e => setTocObs(e.target.value)}
                placeholder="Notițe libere despre acest toc…"
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              />
            </div>
          )}
          {/* Montaj */}
          {(tocFinisaj !== "Toc tunel" ? !!(tocFinisaj && tocBrand) : !!tocTunelBrand) && (
            <div>
              <FieldLabel>Montaj</FieldLabel>
              <MontajSection montaj={tocMontaj} onChange={setTocMontaj} />
            </div>
          )}
          {/* Costuri adiționale */}
          {(tocFinisaj !== "Toc tunel" ? !!(tocFinisaj && tocBrand) : !!tocTunelBrand) && (
            <div>
              <FieldLabel>Costuri adiționale</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {tocCostVars.map((v, idx) => (
                  <Combo
                    key={idx}
                    value={v}
                    options={allCostLabels}
                    onChange={val => handleTocCost(idx, val)}
                    placeholder="+ cost"
                    optionPrices={allCostPrices}
                    onAddOption={handleAddCostOption}
                    onSetOptionPrice={handleSetCostOptionPrice}
                    onDeleteOption={handleDeleteCostOption}
                    isDeletable={label => !costuriLabels.includes(label) || true}
                    className="min-w-[180px] flex-1"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {(tocFinisaj === "Toc tunel" ? effectiveTocPrice !== null : !!(tocFinisaj && tocBrand)) && (
          <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-indigo-500 font-medium mb-0.5">Total toc curent</p>
                <p className="text-lg font-bold text-indigo-700">
                  {effectiveTocPrice ?? 0} EUR
                  {tocStandaloneQty > 1 && (
                    <span className="text-sm font-medium text-indigo-400 ml-2">
                      × {tocStandaloneQty} = {(effectiveTocPrice ?? 0) * tocStandaloneQty} EUR
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Cantitate</span>
                <div className="flex items-center border border-indigo-200 rounded-lg overflow-hidden bg-white">
                  <button onClick={() => setTocStandaloneQty(q => Math.max(1, q - 1))}
                    className="px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 transition font-bold text-sm leading-none">−</button>
                  <span className="px-3 py-1.5 text-sm font-bold text-slate-800 min-w-[2rem] text-center tabular-nums">{tocStandaloneQty}</span>
                  <button onClick={() => setTocStandaloneQty(q => Math.min(20, q + 1))}
                    className="px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 transition font-bold text-sm leading-none">+</button>
                </div>
                <button onClick={resetTocForm}
                  className="px-3 py-2 text-xs font-medium text-slate-500 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition">
                  Șterge
                </button>
                <button
                  onClick={handleAddTocToCart}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 text-sm transition shadow-sm shadow-indigo-500/30"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {editingToc ? "Salvează toc" : "Adaugă toc la ofertă"}
                </button>
              </div>
            </div>
          </div>
        )}
      </StepSection>

      {/* ── PASUL 3: Coș (uși + tocuri) ──────────────────── */}
      {(cartDoors.length > 0 || cartTocs.length > 0) && (
        <StepSection
          step={3}
          title={`Piese adăugate — ${cartDoors.length} uși · ${cartTocs.length} tocuri · total ${cartDoors.reduce((s,d)=>s+(d.qty??1),0) + cartTocs.reduce((s,t)=>s+t.qty,0)} buc`}
          icon="📋"
          accent="blue"
        >
          <div className="space-y-2">
            {/* ── Doors ── */}
            {cartDoors.map((d, i) => {
              const doorColectieOpts = d.finisaj ? Object.keys(doorsData[d.finisaj] ?? {}).sort() : [];
              const doorModelOpts = (d.finisaj && d.colectie) ? sortModels(Object.keys(doorsData[d.finisaj]?.[d.colectie] ?? {})) : [];
              const doorCuloriOpts = (d.finisaj && d.colectie) ? (culori[d.finisaj]?.[d.colectie] ?? []) : [];
              return (
                <div key={d.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        U{i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${d.isAtipic ? "text-amber-700" : "text-slate-800"}`}>
                          {d.isAtipic ? `Atipic: ${d.atipicDesc}` : d.finisaj}
                          {(d.qty ?? 1) > 1 && (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">×{d.qty}</span>
                          )}
                        </p>
                        {/* Inline-editable fields */}
                        <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                          {!d.isAtipic && doorColectieOpts.length > 0 && (
                            <select
                              value={d.colectie}
                              onChange={e => handlePatchDoorColectie(d.id, d.finisaj, e.target.value)}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
                            >
                              <option value="">— colecție —</option>
                              {doorColectieOpts.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          )}
                          {!d.isAtipic && d.colectie && doorModelOpts.length > 0 && (
                            <select
                              value={d.model}
                              onChange={e => handlePatchDoorModel(d.id, d, e.target.value)}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
                            >
                              <option value="">— model —</option>
                              {doorModelOpts.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          )}
                          {!d.isAtipic && doorCuloriOpts.length > 0 && (
                            <select
                              value={d.culoare}
                              onChange={e => handlePatchDoor(d.id, { culoare: e.target.value })}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
                            >
                              <option value="">— culoare —</option>
                              {doorCuloriOpts.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          )}
                          <select
                            value={d.deschidere}
                            onChange={e => handlePatchDoor(d.id, { deschidere: e.target.value })}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-indigo-400 cursor-pointer"
                          >
                            <option value="">— dr./stg. —</option>
                            {DESCHIDERI.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                          {d.ferPrice > 0 && (
                            <span className="text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                              {d.nrBal}× {d.balMod} {d.balCol}
                            </span>
                          )}
                          {d.balDim && (
                            <span className="text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                              Bal. {d.balDim}
                            </span>
                          )}
                          {d.broascaTip && (
                            <span className="text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                              {d.broascaTip}{d.broascaDim ? ` ${d.broascaDim}` : ""}{d.broascaCuloare ? ` ${d.broascaCuloare}` : ""}
                            </span>
                          )}
                          {d.manPrice > 0 && (
                            <span className="text-xs bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                              {d.manMod} {d.manTip}
                            </span>
                          )}
                          {d.costVars.filter(v => v).map(v => (
                            <span key={v} className="text-xs bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-amber-700">
                              + {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => handleUpdateQty(d.id, (d.qty ?? 1) - 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold leading-none">−</button>
                        <span className="px-2 py-1 text-xs font-bold text-slate-700 min-w-[1.5rem] text-center tabular-nums">{d.qty ?? 1}</span>
                        <button onClick={() => handleUpdateQty(d.id, (d.qty ?? 1) + 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold leading-none">+</button>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 min-w-[4rem] text-right tabular-nums">
                        {d.totalEur * (d.qty ?? 1)} EUR
                      </span>
                      <button onClick={() => handleEditDoor(d)} title="Editează"
                        className={`p-1.5 rounded-lg transition ${editingDoor === d.id ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDuplicateDoor(d)} title="Duplică"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button onClick={() => handleRemoveDoor(d.id)} title="Șterge"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── TOCs ── */}
            {cartTocs.map((t, i) => {
              const isErkadoItem = t.brand === "erkado";
              const isTunelItem = t.tocFinisaj === "Toc tunel";
              const tocLabel = isTunelItem
                ? (t.tunelBrand === "erkado"
                  ? `Toc tunel Erkado — ${t.tunelReglaj ?? t.erkadoRange}${t.tunelFinisaj ?? t.erkadoCollection ? ` — ${t.tunelFinisaj ?? t.erkadoCollection}` : ""}${t.isDubla ? " (Dublă)" : ""}`
                  : `Toc tunel Naturen${t.isDubla ? " (Dublă)" : ""}`)
                : isErkadoItem
                  ? `Toc Erkado${t.tocFinisaj ? ` ${t.tocFinisaj}` : ""} — Reglaj ${t.erkadoRange}`
                  : `Toc ${t.tocFinisaj}${t.tocColectie && t.tocColectie !== "__" ? ` ${t.tocColectie}` : ""}${t.tocModel ? ` — ${t.tocModel}` : ""}`;
              return (
                <div key={t.id} className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-xs font-bold text-indigo-700">
                        T{i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{tocLabel}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                          {(t.faraFalt || t.obs) && (
                            <span className="text-xs text-slate-500">
                              {[t.faraFalt ? "Fara falt" : undefined, t.obs || undefined].filter(Boolean).join("; ")}
                            </span>
                          )}
                          {(t.montaj ?? []).filter(m => m.name).map((m, mi) => (
                            <span key={mi} className="text-xs bg-green-50 border border-green-200 rounded px-1.5 py-0.5 text-green-700">
                              Montaj: {m.name} ×{m.qty}
                            </span>
                          ))}
                          {(t.costVars ?? []).filter(v => v).map(v => (
                            <span key={v} className="text-xs bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 text-amber-700">
                              + {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button onClick={() => handleUpdateTocQty(t.id, t.qty - 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold leading-none">−</button>
                        <span className="px-2 py-1 text-xs font-bold text-slate-700 min-w-[1.5rem] text-center tabular-nums">{t.qty}</span>
                        <button onClick={() => handleUpdateTocQty(t.id, t.qty + 1)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold leading-none">+</button>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 min-w-[4rem] text-right tabular-nums">
                        {t.totalEur * t.qty} EUR
                      </span>
                      <button onClick={() => handleEditToc(t)} title="Editează"
                        className={`p-1.5 rounded-lg transition ${editingToc === t.id ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDuplicateToc(t)} title="Duplică"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button onClick={() => handleRemoveToc(t.id)} title="Șterge"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex justify-end items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-slate-400">Subtotal coș</p>
              <p className="text-xl font-bold text-emerald-700">{cartTotal} EUR</p>
            </div>
          </div>
        </StepSection>
      )}

      {/* ── PASUL 4: Detalii ofertă ───────────────────────── */}
      <StepSection step={(cartDoors.length > 0 || cartTocs.length > 0) ? 4 : 3} title="Detalii Ofertă & Client" icon="📄" accent="slate">
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
              Total ofertă · {cartDoors.reduce((s,d)=>s+(d.qty??1),0) + cartTocs.reduce((s,t)=>s+t.qty,0) + ((isAtipic ? !!atipicDesc.trim() : usaPrice !== null) ? currentQty : 0)} piese
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
