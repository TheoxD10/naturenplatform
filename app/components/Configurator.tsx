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
  CULORI_USA,
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
            : "border-slate-300 bg-white text-slate-800 cursor-pointer hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          } ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</span>
    </div>
  );
}

function PriceBadge({ price, currency = "EUR", selected = false }: { price: number | null; currency?: string; selected?: boolean }) {
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

function CardSection({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-slate-50 border-b border-slate-200 px-5 py-2.5">
        {icon && <span>{icon}</span>}
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-slate-500 mb-1 block">{children}</span>;
}

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export default function Configurator() {
  const [doorsData, setDoorsData] = useState<DoorsData>({});
  const [loading, setLoading] = useState(true);

  // ── Current door form ──────────────────────────────────────
  const [finisaj, setFinisaj] = useState("");
  const [colectie, setColectie] = useState("");
  const [model, setModel] = useState("");
  const [culoare, setCuloare] = useState("");
  const [deschidere, setDeschidere] = useState("");
  const [usaObs, setUsaObs] = useState("");

  const [addToc, setAddToc] = useState(false);
  const [tocFinisaj, setTocFinisaj] = useState("");
  const [tocColectie, setTocColectie] = useState("");
  const [tocModel, setTocModel] = useState("");
  const [tocObs, setTocObs] = useState("");

  const [nrBal, setNrBal] = useState("");
  const [balMod, setBalMod] = useState("");
  const [balCol, setBalCol] = useState("");

  const [manMod, setManMod] = useState("");
  const [manTip, setManTip] = useState("");
  const [manCol, setManCol] = useState("");

  const [costVars, setCostVars] = useState<string[]>([""]);

  // ── Cart (list of added doors) ─────────────────────────────
  const [cartDoors, setCartDoors] = useState<DoorLineItem[]>([]);

  // ── Offer details ──────────────────────────────────────────
  const [offerNumber, setOfferNumber] = useState(() => String(Math.floor(Math.random() * 1000) + 3000));
  const [offerDate, setOfferDate] = useState(() => new Date().toLocaleDateString("ro-RO"));
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [exchangeRate, setExchangeRate] = useState("4.97");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [agent, setAgent] = useState("Magazin Oradea");
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
  const modelOpts = (finisaj && colectie) ? sortModels(Object.keys(doorsData[finisaj]?.[colectie] ?? {})) : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tocV2 = (doorsData["TOC_V2"] ?? {}) as Record<string, Record<string, Record<string, any>>>;
  const tocTipOpts = Object.keys(tocV2);
  const tocAllReglaj = tocFinisaj ? Object.keys(tocV2[tocFinisaj] ?? {}).filter((k) => k !== "__") : [];
  const tocShowReglaj = tocAllReglaj.length >= 2;
  const effectiveTocColectie = tocShowReglaj ? tocColectie
    : tocAllReglaj.length === 1 ? tocAllReglaj[0]
    : "__";
  const tocFinisajOpts = (tocFinisaj && effectiveTocColectie)
    ? Object.keys(tocV2[tocFinisaj]?.[effectiveTocColectie] ?? {})
    : [];

  // ── Current door prices ────────────────────────────────────
  const usaPrice = (finisaj && colectie && model) ? (doorsData[finisaj]?.[colectie]?.[model] ?? null) : null;
  const tocPrice = (tocFinisaj && effectiveTocColectie && tocModel)
    ? (tocV2[tocFinisaj]?.[effectiveTocColectie]?.[tocModel] ?? null)
    : null;
  const ferPrice = (nrBal && balMod && balCol)
    ? (FERONERIE[`${nrBal.startsWith("2") ? "2" : "3"}|${balMod}|${balCol}`] ?? null)
    : null;
  const manColOpts = (manMod && manTip) ? getManereColLabels(manMod, manTip) : [];
  const hasRealColors = manColOpts.some((l) => l.includes("–"));
  const manPrice = (manMod && manTip && manCol) ? manerePriceFromLabel(manMod, manTip, manCol) : null;

  useEffect(() => {
    if (manTip && manColOpts.length > 0 && !hasRealColors && !manCol) {
      setManCol(manColOpts[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manTip, manColOpts.length, hasRealColors]);

  // Cost parts for current door
  const currentCostParts = costVars
    .filter((v) => v && v !== NONE_OPT && COSTURI_MAP[v])
    .map((v) => COSTURI_MAP[v]);
  const currentDoorTotal =
    (usaPrice ?? 0) +
    (addToc && tocPrice ? tocPrice : 0) +
    (ferPrice ?? 0) +
    (manPrice ?? 0) +
    currentCostParts.reduce((s, p) => s + p, 0);

  // Grand total across all cart doors
  const grandTotal = cartDoors.reduce((s, d) => s + d.totalEur, 0) + currentDoorTotal;
  const cartTotal = cartDoors.reduce((s, d) => s + d.totalEur, 0);
  const rate = parseFloat(exchangeRate) || 4.97;

  // ── Form handlers ──────────────────────────────────────────
  function resetHw() {
    setNrBal(""); setBalMod(""); setBalCol("");
    setManMod(""); setManTip(""); setManCol("");
    setCostVars([""]);
  }
  function resetDoorForm() {
    setFinisaj(""); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); setUsaObs("");
    setAddToc(false); setTocFinisaj(""); setTocColectie(""); setTocModel(""); setTocObs("");
    resetHw();
  }

  function handleFinisaj(v: string) { setFinisaj(v); setColectie(""); setModel(""); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleColectie(v: string) { setColectie(v); setModel(""); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleModel(v: string) { setModel(v); setCuloare(""); setDeschidere(""); resetHw(); }
  function handleNrBal(v: string) { setNrBal(v); setBalMod(""); setBalCol(""); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleBalMod(v: string) { setBalMod(v); setBalCol(""); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleBalCol(v: string) { setBalCol(v); setManMod(""); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleManMod(v: string) { setManMod(v); setManTip(""); setManCol(""); setCostVars([""]); }
  function handleManTip(v: string) { setManTip(v); setManCol(""); setCostVars([""]); }
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

  // ── Add door to cart ───────────────────────────────────────
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
      totalEur: currentDoorTotal,
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

  function handleFullReset() {
    resetDoorForm();
    setCartDoors([]);
  }

  // ── PDF generation ─────────────────────────────────────────
  function handleGeneratePdf() {
    const allDoors = cartDoors.length > 0 ? cartDoors : [];
    // Include current (unsaved) door if it has a price
    const currentAsItem: DoorLineItem | null = usaPrice ? {
      id: `door-current-${Date.now()}`,
      finisaj, colectie, model, culoare, deschidere, usaObs,
      usaPrice: usaPrice ?? 0,
      addToc, tocFinisaj, tocColectie, tocModel, tocObs,
      tocPrice: (addToc && tocPrice) ? tocPrice : 0,
      nrBal, balMod, balCol, ferPrice: ferPrice ?? 0,
      manMod, manTip, manCol, manPrice: manPrice ?? 0,
      costVars: costVars.filter((v) => v && v !== NONE_OPT),
      totalEur: currentDoorTotal,
      dimUsa: "",
      golInitialLatime: "", golInitialInaltime: "",
      grosimePerete: "", reglajToc: "",
      golFinisatLatime: "", golFinisatInaltime: "",
      scurtare: "", tipBroasca: "", umplere: "", observatii: "",
    } : null;

    const doorsForPdf = currentAsItem ? [...allDoors, currentAsItem] : allDoors;
    if (doorsForPdf.length === 0) return;

    const items: OfferItem[] = [];
    for (const d of doorsForPdf) {
      items.push({
        name: `Usa ${d.finisaj} ${d.model}`,
        obs: [d.usaObs, d.culoare, d.deschidere].filter(Boolean).join(", ") || undefined,
        um: "buc",
        qty: 1,
        priceRon: d.usaPrice * rate,
      });
      if (d.addToc && d.tocPrice) {
        items.push({
          name: `Toc ${d.tocFinisaj}${d.tocColectie && d.tocColectie !== "__" ? ` ${d.tocColectie}` : ""}${d.tocModel ? ` - ${d.tocModel}` : ""}`,
          obs: d.tocObs || undefined,
          um: "buc",
          qty: 1,
          priceRon: d.tocPrice * rate,
        });
      }
      if (d.ferPrice && d.nrBal) {
        items.push({
          name: `Feronerie ${d.nrBal} - ${d.balMod} ${d.balCol}`,
          um: "set",
          qty: 1,
          priceRon: d.ferPrice * rate,
        });
      }
      if (d.manPrice && d.manMod) {
        items.push({
          name: `${d.manMod} - ${d.manTip}${d.manCol && !d.manCol.match(/^\d/) ? " - " + d.manCol.split("  –")[0] : ""}`,
          um: "set",
          qty: 1,
          priceRon: d.manPrice * rate,
        });
      }
      for (const v of d.costVars) {
        const p = COSTURI_MAP[`${v}  (+${COSTURI_MAP[v]} EUR)`] ?? COSTURI_MAP[v];
        if (p) items.push({ name: v, um: "serviciu", qty: 1, priceRon: p * rate });
      }
    }

    const totalRon = items.reduce((s, i) => s + i.priceRon, 0);
    const advRon = totalRon * (parseFloat(advancePercent) / 100);

    // Save to store
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

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-400 text-sm">Se încarcă datele…</div>;
  }

  return (
    <div className="space-y-4">

      {/* ── Door form ─────────────────────────────────────── */}
      <CardSection title="Configurare Ușă" icon="🚪">
        {/* USA row */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 w-8">Ușă</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-end">
            <div>
              <FieldLabel>Finisaj</FieldLabel>
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
                <Combo value={culoare} options={CULORI_USA} onChange={setCuloare} placeholder="— culoare —" />
              </div>
              <div>
                <FieldLabel>Deschidere</FieldLabel>
                <Combo value={deschidere} options={DESCHIDERI} onChange={setDeschidere} placeholder="— dreap./stânga —" />
              </div>
              <div />
              <div>
                <FieldLabel>Observații</FieldLabel>
                <input
                  value={usaObs}
                  onChange={(e) => setUsaObs(e.target.value)}
                  placeholder="ex: Decor nuc, RAL 9010…"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Toc toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none mb-3 mt-1">
          <div
            onClick={() => handleAddToc(!addToc)}
            className={`relative w-10 h-5 rounded-full transition-colors ${addToc ? "bg-blue-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${addToc ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm font-medium text-slate-700">Adaugă Toc</span>
        </label>

        {addToc && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 w-8">Toc</span>
              <div className="flex-1 h-px bg-blue-100" />
            </div>
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        )}

        {/* Hardware */}
        <div className="border-t border-slate-100 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Feronerie & Mâner</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
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
                    {manCol || "— auto-selectat —"}
                  </div>
              }
            </div>
            <PriceBadge price={manPrice} />
          </div>
        </div>

        {/* Costuri */}
        <div className="border-t border-slate-100 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Costuri adiționale</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
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
        </div>

        {/* Current door total + Add button */}
        {usaPrice && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
            <div>
              <p className="text-xs text-blue-500 font-medium">Total ușă curentă</p>
              <p className="text-lg font-bold text-blue-700">{currentDoorTotal} EUR</p>
            </div>
            <button
              onClick={handleAddDoor}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 text-sm transition shadow-sm"
            >
              + Adaugă ușă la ofertă
            </button>
          </div>
        )}
      </CardSection>

      {/* ── Cart ─────────────────────────────────────────── */}
      {cartDoors.length > 0 && (
        <CardSection title={`Uși adăugate (${cartDoors.length})`} icon="📋">
          <div className="space-y-2">
            {cartDoors.map((d, i) => (
              <div key={d.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                    <span className="text-sm font-semibold text-slate-800">{d.finisaj} — {d.model}</span>
                    {d.culoare && <span className="text-xs text-slate-500">{d.culoare}</span>}
                    {d.deschidere && <span className="text-xs text-slate-500">{d.deschidere}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {d.addToc && d.tocFinisaj && (
                      <span className="text-xs text-blue-500">
                        + Toc {d.tocFinisaj}{d.tocColectie && d.tocColectie !== "__" ? ` ${d.tocColectie}` : ""}{d.tocModel ? ` — ${d.tocModel}` : ""}
                      </span>
                    )}
                    {d.ferPrice > 0 && (
                      <span className="text-xs text-slate-400">+ Feronerie {d.nrBal}</span>
                    )}
                    {d.manPrice > 0 && (
                      <span className="text-xs text-slate-400">+ {d.manMod}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className="text-sm font-bold text-emerald-600">{d.totalEur} EUR</span>
                  <button
                    onClick={() => handleRemoveDoor(d.id)}
                    className="text-red-300 hover:text-red-600 text-lg leading-none"
                    title="Șterge"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-slate-400">Total uși adăugate</p>
              <p className="text-xl font-bold text-emerald-700">{cartTotal} EUR</p>
            </div>
          </div>
        </CardSection>
      )}

      {/* ── Offer details ─────────────────────────────────── */}
      <CardSection title="Detalii Ofertă & Client" icon="📄">
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
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Reducere comercială (%)" value={discountPercent} onChange={setDiscountPercent} placeholder="0" type="number" />
          <Input label="Termen livrare (zile)" value={deliveryDays} onChange={setDeliveryDays} placeholder="30" />
          <Input label="Avans (%)" value={advancePercent} onChange={setAdvancePercent} placeholder="50" type="number" />
        </div>
      </CardSection>

      {/* ── Grand total ───────────────────────────────────── */}
      {canGenerate && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Total ofertă ({cartDoors.length + (usaPrice ? 1 : 0)} {cartDoors.length + (usaPrice ? 1 : 0) === 1 ? "ușă" : "uși"})
            </span>
            <button onClick={handleFullReset} className="text-xs text-slate-400 hover:text-slate-600 underline">Resetează tot</button>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-xs text-emerald-600 font-medium">Total EUR</p>
              <p className="text-2xl font-bold text-emerald-700">{grandTotal} EUR</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">≈ RON (curs {exchangeRate})</p>
              <p className="text-xl font-bold text-slate-700">
                {(grandTotal * rate).toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RON
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Generate PDF ──────────────────────────────────── */}
      <button
        onClick={handleGeneratePdf}
        disabled={!canGenerate}
        className="w-full rounded-xl bg-[#1A2E4A] hover:bg-[#243d61] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 text-sm tracking-wide transition shadow-sm"
      >
        📄 Generează Ofertă Comercială PDF
      </button>
    </div>
  );
}
