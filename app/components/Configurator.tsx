"use client";

import { useEffect, useState } from "react";
import {
  FINISAJ_ORDER,
  NONE_OPT,
  FERONERIE,
  BAL_MODELS,
  BAL_CULORI,
  MANERE_MODELS,
  MANERE_TIPS,
  COSTURI_LABELS,
  COSTURI_MAP,
  CULORI_PER_COLECTIE,
  DESCHIDERI,
  getManereColLabels,
  manerePriceFromLabel,
} from "../data/constants";
import { generateOfferPdf, type OfferItem } from "../lib/generatePdf";
import { upsertOrder, type DoorLineItem } from "../lib/offerStore";

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
}: {
  value: string; options: string[]; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || options.length === 0}
        className={`w-full appearance-none rounded-lg border px-3 py-2 pr-7 text-sm outline-none transition
          ${disabled || options.length === 0
            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
            : "border-slate-300 bg-white text-slate-800 cursor-pointer hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
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

function Input({ label, value, onChange, placeholder, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
  const [doorsData, setDoorsData] = useState<DoorsData>({});
  const [loading, setLoading] = useState(true);

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
      .then((d) => { setDoorsData(d); setLoading(false); });
  }, []);

  // ── Cascades ──────────────────────────────────────────────
  const finisajOpts = (() => {
    const all = Object.keys(doorsData).filter((k) => k !== "TOC_V2");
    return [...FINISAJ_ORDER.filter((f) => all.includes(f)), ...all.filter((f) => !FINISAJ_ORDER.includes(f))];
  })();
  const colectieOpts = finisaj ? Object.keys(doorsData[finisaj] ?? {}).sort() : [];
  const culoriOpts   = (finisaj && colectie)
    ? (CULORI_PER_COLECTIE[finisaj]?.[colectie] ?? [])
    : [];
  const modelOpts    = (finisaj && colectie)
    ? sortModels(Object.keys(doorsData[finisaj]?.[colectie] ?? {}))
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

  // ── Current door prices ────────────────────────────────────
  const usaPrice  = (finisaj && colectie && model)
    ? (doorsData[finisaj]?.[colectie]?.[model] ?? null)
    : null;
  const tocPrice  = (tocFinisaj && effectiveTocColectie && tocModel)
    ? (tocV2[tocFinisaj]?.[effectiveTocColectie]?.[tocModel] ?? null)
    : null;
  const ferPrice  = (nrBal && balMod && balCol)
    ? (FERONERIE[`${nrBal.startsWith("2") ? "2" : "3"}|${balMod}|${balCol}`] ?? null)
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

  const currentCostParts = costVars
    .filter((v) => v && v !== NONE_OPT && COSTURI_MAP[v])
    .map((v) => COSTURI_MAP[v]);

  const currentDoorUnitTotal =
    (usaPrice ?? 0) +
    (addToc && tocPrice ? tocPrice : 0) +
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
    setCostVars([""]);
  }
  function resetDoorForm() {
    setFinisaj(""); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); setUsaObs("");
    setAddToc(false); setTocFinisaj(""); setTocColectie(""); setTocModel(""); setTocObs("");
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
    if (!checked) { setTocFinisaj(""); setTocColectie(""); setTocModel(""); setTocObs(""); }
  }
  function handleTocTip(v: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toc = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
    const allR = Object.keys(toc[v] ?? {}).filter((k) => k !== "__");
    const newReglaj = allR.length === 1 ? allR[0] : "";
    const effReglaj = allR.length === 0 ? "__" : newReglaj;
    const fins = effReglaj ? Object.keys(toc[v]?.[effReglaj] ?? {}) : [];
    setTocFinisaj(v); setTocColectie(newReglaj);
    setTocModel(fins.length === 1 ? fins[0] : "");
  }
  function handleTocReglaj(v: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toc = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
    const fins = v ? Object.keys(toc[tocFinisaj]?.[v] ?? {}) : [];
    setTocColectie(v); setTocModel(fins.length === 1 ? fins[0] : "");
  }

  // ── Cart actions ───────────────────────────────────────────
  function handleAddDoor() {
    if (!usaPrice) return;
    const door: DoorLineItem = {
      id: `door-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      finisaj, colectie, model, culoare, deschidere, usaObs,
      usaPrice: usaPrice ?? 0,
      addToc,
      tocFinisaj, tocColectie, tocModel, tocObs,
      tocPrice: (addToc && tocPrice) ? tocPrice : 0,
      nrBal, balMod, balCol, ferPrice: ferPrice ?? 0,
      manMod, manTip, manCol, manPrice: manPrice ?? 0,
      costVars: costVars.filter((v) => v && v !== NONE_OPT),
      totalEur: currentDoorUnitTotal,
      qty: currentQty,
      dimUsa: "",
      golInitialLatime: "", golInitialInaltime: "",
      grosimePerete: "", reglajToc: "",
      golFinisatLatime: "", golFinisatInaltime: "",
      scurtare: "", tipBroasca: "", umplere: "", observatii: "",
    };
    setCartDoors((prev) => [...prev, door]);
    resetDoorForm();
  }

  function handleRemoveDoor(id: string) {
    setCartDoors((prev) => prev.filter((d) => d.id !== id));
  }

  function handleDuplicateDoor(door: DoorLineItem) {
    setCartDoors((prev) => [
      ...prev,
      { ...door, id: `door-${Date.now()}-dup-${Math.random().toString(36).slice(2)}` },
    ]);
  }

  function handleUpdateQty(id: string, qty: number) {
    setCartDoors((prev) => prev.map((d) => d.id === id ? { ...d, qty: Math.max(1, qty) } : d));
  }

  function handleFullReset() {
    resetDoorForm();
    setCartDoors([]);
  }

  // ── PDF ───────────────────────────────────────────────────
  function handleGeneratePdf() {
    const currentAsItem: DoorLineItem | null = usaPrice ? {
      id: `door-current-${Date.now()}`,
      finisaj, colectie, model, culoare, deschidere, usaObs,
      usaPrice: usaPrice ?? 0,
      addToc, tocFinisaj, tocColectie, tocModel, tocObs,
      tocPrice: (addToc && tocPrice) ? tocPrice : 0,
      nrBal, balMod, balCol, ferPrice: ferPrice ?? 0,
      manMod, manTip, manCol, manPrice: manPrice ?? 0,
      costVars: costVars.filter((v) => v && v !== NONE_OPT),
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
        items.push({
          name: `Toc ${d.tocFinisaj}${d.tocColectie && d.tocColectie !== "__" ? ` ${d.tocColectie}` : ""}${d.tocModel ? ` - ${d.tocModel}` : ""}`,
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
        const p = COSTURI_MAP[`${v}  (+${COSTURI_MAP[v]} EUR)`] ?? COSTURI_MAP[v];
        if (p) items.push({ name: v, um: "serviciu", qty: q, priceRon: p * rate });
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
  }

  const canGenerate = cartDoors.length > 0 || !!usaPrice;
  const totalDoors  = cartDoors.reduce((s, d) => s + (d.qty ?? 1), 0) + (usaPrice ? currentQty : 0);

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
      <StepSection step={1} title="Configurare Ușă" icon="🚪" accent="indigo">
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
            <Combo value={model} options={modelOpts} onChange={handleModel} disabled={!colectie} />
          </div>
          <PriceBadge price={usaPrice} selected={!!model} />
        </div>

        {model && (
          <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-2 mt-2">
            <div>
              <FieldLabel>Culoare</FieldLabel>
              <Combo value={culoare} options={culoriOpts} onChange={setCuloare} placeholder="— culoare —" disabled={culoriOpts.length === 0} />
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                <Combo value={tocFinisaj} options={tocTipOpts} onChange={handleTocTip} />
              </div>
              {tocShowReglaj && (
                <div className="flex-1">
                  <FieldLabel>Reglaj</FieldLabel>
                  <Combo value={tocColectie} options={tocAllReglaj} onChange={handleTocReglaj} disabled={!tocFinisaj} />
                </div>
              )}
              {tocFinisajOpts.length > 0 && (
                <div className="flex-1">
                  <FieldLabel>Finisaj toc</FieldLabel>
                  <Combo value={tocModel} options={tocFinisajOpts} onChange={setTocModel} disabled={!effectiveTocColectie} />
                </div>
              )}
              <PriceBadge price={tocPrice} selected={!!tocFinisaj} />
            </div>
            <div className="mt-2">
              <FieldLabel>Observații toc</FieldLabel>
              <input
                value={tocObs}
                onChange={(e) => setTocObs(e.target.value)}
                placeholder="ex: Reglabil 100-120…"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
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
            <Combo value={balMod} options={nrBal ? BAL_MODELS : []} onChange={handleBalMod} disabled={!nrBal} />
          </div>
          <div>
            <FieldLabel>Culoare balama</FieldLabel>
            <Combo value={balCol} options={balMod ? BAL_CULORI : []} onChange={handleBalCol} disabled={!balMod} />
          </div>
          <PriceBadge price={ferPrice} />
        </div>
        <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end">
          <div>
            <FieldLabel>Model mâner</FieldLabel>
            <Combo value={manMod} options={MANERE_MODELS} onChange={handleManMod} />
          </div>
          <div>
            <FieldLabel>Tip mâner</FieldLabel>
            <Combo value={manTip} options={manMod ? MANERE_TIPS[manMod] ?? [] : []} onChange={handleManTip} disabled={!manMod} />
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
        {costVars.map((val, idx) => (
          <div key={idx} className="flex items-end gap-2 mb-2 last:mb-0">
            <div className="flex-1">
              {idx === 0 && <FieldLabel>Selectează cost</FieldLabel>}
              <Combo value={val} options={[NONE_OPT, ...COSTURI_LABELS]} onChange={(v) => handleCost(idx, v)} />
            </div>
            <div className="mb-0.5">
              <PriceBadge price={val && val !== NONE_OPT ? COSTURI_MAP[val] ?? null : null} />
            </div>
          </div>
        ))}

        {/* Bottom bar: total + qty + add */}
        {usaPrice && (
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
      </StepSection>

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
          <Input label="Curs EUR/RON" value={exchangeRate} onChange={setExchangeRate} placeholder="4.97" type="number" />
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
