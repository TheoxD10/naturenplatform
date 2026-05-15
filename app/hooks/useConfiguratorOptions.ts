"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getFeronerie, saveFeronerie,
  getManere, saveManere,
  getCosturi, saveCosturi,
  getCulori, saveCulori,
  getDoorPriceOverrides, saveDoorPriceOverrides,
  getEuroCourse, saveEuroCourse,
  getErkadoReglaj, saveErkadoReglaj,
  getErkadoTocTunel, saveErkadoTocTunel,
  getErkadoTocFaraFalt, saveErkadoTocFaraFalt,
  getErkadoTocReversie, saveErkadoTocReversie,
  getErkadoTocSuprapunere, saveErkadoTocSuprapunere,
  getErkadoTocMetalic, saveErkadoTocMetalic,
  getNaturenTocReglabilDrept, saveNaturenTocReglabilDrept,
  getTocFixPrices, saveTocFixPrices,
  getPervazFixErkadoPrices, savePervazFixErkadoPrices,
  getPervazFixNaturenPrices, savePervazFixNaturenPrices,
  type FerenerieItem, type ManereItem, type CosturiItem, type CuloriData,
  type ErkadoReglajItem, type ErkadoTocTunelRow, type ErkadoTocRevesieRow,
  type ErkadoTocSuprapunereRow, type ErkadoTocMetalicRow, type NaturenTocRow,
} from "../../lib/configuratorOptions";
import {
  FERONERIE as FERONERIE_CONST,
  MANERE_DATA,
  COSTURI as COSTURI_CONST,
  CULORI_PER_COLECTIE,
  ERKADO_REGLAJ as ERKADO_REGLAJ_CONST,
  ERKADO_TOC_TUNEL as ERKADO_TOC_TUNEL_CONST,
  ERKADO_TOC_FARA_FALT as ERKADO_TOC_FARA_FALT_CONST,
  ERKADO_TOC_REVERSIE as ERKADO_TOC_REVERSIE_CONST,
  ERKADO_TOC_SUPRAPUNERE as ERKADO_TOC_SUPRAPUNERE_CONST,
  ERKADO_TOC_METALIC as ERKADO_TOC_METALIC_CONST,
  ERKADO_TOC_TUNEL_FINISAJE,
  ERKADO_TOC_REVERSIE_FINISAJE,
  ERKADO_TOC_SUPRAPUNERE_FINISAJE,
  NATUREN_TOC_REGLABIL_DREPT as NATUREN_TOC_CONST,
  TOC_FIX_PRICES as TOC_FIX_PRICES_CONST,
  PERVAZ_FIX_ERKADO_PRICES as PERVAZ_FIX_ERKADO_CONST,
  PERVAZ_FIX_NATUREN_PRICES as PERVAZ_FIX_NATUREN_CONST,
} from "../data/constants";

function seedFeronerie(): FerenerieItem[] {
  return Object.entries(FERONERIE_CONST).map(([key, price]) => {
    const parts = key.split("|");
    return { nrBal: parseInt(parts[0]) as 2 | 3, model: parts[1], culoare: parts[2], price };
  });
}

function seedManere(): ManereItem[] {
  const result: ManereItem[] = [];
  for (const [model, tips] of Object.entries(MANERE_DATA)) {
    for (const [tip, entries] of Object.entries(tips)) {
      for (const { culoare, price } of entries) {
        result.push({ model, tip, culoare, price });
      }
    }
  }
  return result;
}

function seedCosturi(): CosturiItem[] {
  return COSTURI_CONST.map(([label, price]) => ({ label, price }));
}

function mergeDefaultColors(existing: CuloriData, defaults: CuloriData): { merged: CuloriData; changed: boolean } {
  const merged: CuloriData = { ...existing };
  let changed = false;
  for (const [finisaj, collections] of Object.entries(defaults)) {
    if (!merged[finisaj]) {
      merged[finisaj] = { ...collections };
      changed = true;
    } else {
      let finisajChanged = false;
      const mergedFin = { ...merged[finisaj] };
      for (const [colectie, colors] of Object.entries(collections)) {
        if (!mergedFin[colectie]) {
          mergedFin[colectie] = colors;
          finisajChanged = true;
        } else {
          const existingSet = new Set(mergedFin[colectie]);
          const toAdd = colors.filter(c => !existingSet.has(c));
          if (toAdd.length > 0) {
            mergedFin[colectie] = [...mergedFin[colectie], ...toAdd];
            finisajChanged = true;
          }
        }
      }
      if (finisajChanged) {
        merged[finisaj] = mergedFin;
        changed = true;
      }
    }
  }
  return { merged, changed };
}

export type { FerenerieItem, ManereItem, CosturiItem, CuloriData, ErkadoReglajItem, ErkadoTocTunelRow, ErkadoTocRevesieRow, ErkadoTocSuprapunereRow, ErkadoTocMetalicRow, NaturenTocRow };

export function useConfiguratorOptions() {
  const [feronerie, setFerenerieState] = useState<FerenerieItem[]>([]);
  const [manere, setManereState] = useState<ManereItem[]>([]);
  const [costuri, setCosturiState] = useState<CosturiItem[]>([]);
  const [culori, setCuloriState] = useState<CuloriData>({});
  const [doorPriceOverrides, setDoorPriceOverridesState] = useState<Record<string, number>>({});
  const [euroCourse, setEuroCourseState] = useState<number | null>(null);
  const [erkadoReglaj, setErkadoReglaj] = useState<ErkadoReglajItem[]>([]);
  const [erkadoTocTunel, setErkadoTocTunel] = useState<ErkadoTocTunelRow[]>([]);
  const [erkadoTocFaraFalt, setErkadoTocFaraFalt] = useState<ErkadoTocTunelRow[]>([]);
  const [erkadoTocReversie, setErkadoTocReversie] = useState<ErkadoTocRevesieRow[]>([]);
  const [erkadoTocSuprapunere, setErkadoTocSuprapunere] = useState<ErkadoTocSuprapunereRow[]>([]);
  const [erkadoTocMetalic, setErkadoTocMetalic] = useState<ErkadoTocMetalicRow[]>([]);
  const [naturenTocReglabilDrept, setNaturenTocReglabilDrept] = useState<NaturenTocRow[]>([]);
  const [tocFixPrices, setTocFixPrices] = useState<Record<string, Record<string, number>>>({});
  const [pervazFixErkadoPrices, setPervazFixErkadoPrices] = useState<Record<string, Record<string, number>>>({});
  const [pervazFixNaturenPrices, setPervazFixNaturenPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeronerie(),
      getManere(),
      getCosturi(),
      getCulori(),
      getDoorPriceOverrides(),
      getEuroCourse(),
      getErkadoReglaj(),
      getErkadoTocTunel(),
      getErkadoTocFaraFalt(),
      getErkadoTocReversie(),
      getErkadoTocSuprapunere(),
      getErkadoTocMetalic(),
      getNaturenTocReglabilDrept(),
      getTocFixPrices(),
      getPervazFixErkadoPrices(),
      getPervazFixNaturenPrices(),
    ]).then(([f, m, c, col, dpo, eur, er, ett, etff, etr, ets, etm, ntrd, tfp, pfe, pfn]) => {
      const fer = f ?? seedFeronerie();
      const man = m ?? seedManere();
      const cos = c ?? seedCosturi();
      const baseCul = col ?? { ...CULORI_PER_COLECTIE };
      const { merged: cul, changed: culChanged } = mergeDefaultColors(baseCul, CULORI_PER_COLECTIE);
      const dpoData = dpo ?? {};
      const erData = er ?? [...ERKADO_REGLAJ_CONST];
      const ettData = ett ?? [...ERKADO_TOC_TUNEL_CONST];
      const etffData = etff ?? [...ERKADO_TOC_FARA_FALT_CONST];
      const etrData = etr ?? [...ERKADO_TOC_REVERSIE_CONST];
      const etsData = ets ?? [...ERKADO_TOC_SUPRAPUNERE_CONST];
      const etmData = etm ?? [...ERKADO_TOC_METALIC_CONST];
      const ntrdData = ntrd ?? [...NATUREN_TOC_CONST];
      const tfpData = tfp ?? { ...TOC_FIX_PRICES_CONST };
      const pfeData = pfe ?? { ...PERVAZ_FIX_ERKADO_CONST };
      const pfnData = pfn ?? { ...PERVAZ_FIX_NATUREN_CONST };

      if (!f) saveFeronerie(fer).catch(console.error);
      if (!m) saveManere(man).catch(console.error);
      if (!c) saveCosturi(cos).catch(console.error);
      if (!col || culChanged) saveCulori(cul).catch(console.error);
      if (!er) saveErkadoReglaj(erData).catch(console.error);
      if (!ett) saveErkadoTocTunel(ettData).catch(console.error);
      if (!etff) saveErkadoTocFaraFalt(etffData).catch(console.error);
      if (!etr) saveErkadoTocReversie(etrData).catch(console.error);
      if (!ets) saveErkadoTocSuprapunere(etsData).catch(console.error);
      if (!etm) saveErkadoTocMetalic(etmData).catch(console.error);
      if (!ntrd) saveNaturenTocReglabilDrept(ntrdData).catch(console.error);
      if (!tfp) saveTocFixPrices(tfpData).catch(console.error);
      if (!pfe) savePervazFixErkadoPrices(pfeData).catch(console.error);
      if (!pfn) savePervazFixNaturenPrices(pfnData).catch(console.error);

      setFerenerieState(fer);
      setManereState(man);
      setCosturiState(cos);
      setCuloriState(cul);
      setDoorPriceOverridesState(dpoData);
      if (eur !== null) setEuroCourseState(eur);
      setErkadoReglaj(erData);
      setErkadoTocTunel(ettData);
      setErkadoTocFaraFalt(etffData);
      setErkadoTocReversie(etrData);
      setErkadoTocSuprapunere(etsData);
      setErkadoTocMetalic(etmData);
      setNaturenTocReglabilDrept(ntrdData);
      setTocFixPrices(tfpData);
      setPervazFixErkadoPrices(pfeData);
      setPervazFixNaturenPrices(pfnData);
      setLoading(false);
    }).catch(() => {
      setFerenerieState(seedFeronerie());
      setManereState(seedManere());
      setCosturiState(seedCosturi());
      setCuloriState({ ...CULORI_PER_COLECTIE });
      setErkadoReglaj([...ERKADO_REGLAJ_CONST]);
      setErkadoTocTunel([...ERKADO_TOC_TUNEL_CONST]);
      setErkadoTocFaraFalt([...ERKADO_TOC_FARA_FALT_CONST]);
      setErkadoTocReversie([...ERKADO_TOC_REVERSIE_CONST]);
      setErkadoTocSuprapunere([...ERKADO_TOC_SUPRAPUNERE_CONST]);
      setErkadoTocMetalic([...ERKADO_TOC_METALIC_CONST]);
      setNaturenTocReglabilDrept([...NATUREN_TOC_CONST]);
      setTocFixPrices({ ...TOC_FIX_PRICES_CONST });
      setPervazFixErkadoPrices({ ...PERVAZ_FIX_ERKADO_CONST });
      setPervazFixNaturenPrices({ ...PERVAZ_FIX_NATUREN_CONST });
      setLoading(false);
    });
  }, []);

  // ── Feronerie helpers ────────────────────────────────────────────────────────
  const ferMap = useMemo(
    () => Object.fromEntries(feronerie.map(f => [`${f.nrBal}|${f.model}|${f.culoare}`, f.price])),
    [feronerie]
  );
  const balModels = useMemo(() => {
    const seen = new Set<string>(); const result: string[] = [];
    for (const f of feronerie) if (!seen.has(f.model)) { seen.add(f.model); result.push(f.model); }
    return result;
  }, [feronerie]);
  const balCulori = useMemo(() => {
    const seen = new Set<string>(); const result: string[] = [];
    for (const f of feronerie) if (!seen.has(f.culoare)) { seen.add(f.culoare); result.push(f.culoare); }
    return result;
  }, [feronerie]);

  // ── Manere helpers ───────────────────────────────────────────────────────────
  const manereModels = useMemo(() => {
    const seen = new Set<string>(); const result: string[] = [];
    for (const m of manere) if (!seen.has(m.model)) { seen.add(m.model); result.push(m.model); }
    return result;
  }, [manere]);
  const manereTips = useMemo(() => {
    const tips: Record<string, string[]> = {};
    for (const m of manere) {
      if (!tips[m.model]) tips[m.model] = [];
      if (!tips[m.model].includes(m.tip)) tips[m.model].push(m.tip);
    }
    return tips;
  }, [manere]);
  const getManereColLabels = useCallback((model: string, tip: string): string[] =>
    manere
      .filter(m => m.model === model && m.tip === tip)
      .map(m => m.culoare === "—" ? `${m.price} EUR` : `${m.culoare}  –  ${m.price} EUR`),
    [manere]
  );
  const manerePriceFromLabel = useCallback((model: string, tip: string, label: string): number | null => {
    for (const item of manere) {
      if (item.model === model && item.tip === tip) {
        const expected = item.culoare === "—" ? `${item.price} EUR` : `${item.culoare}  –  ${item.price} EUR`;
        if (expected === label) return item.price;
      }
    }
    return null;
  }, [manere]);

  // ── Costuri helpers ──────────────────────────────────────────────────────────
  const costuriLabels = useMemo(() => costuri.map(c => c.label), [costuri]);
  const costuriMap = useMemo(
    () => Object.fromEntries(costuri.map(c => [c.label, c.price])) as Record<string, number | null>,
    [costuri]
  );

  // ── Erkado special toc helpers ───────────────────────────────────────────────
  const getErkadoSpecialTocRanges = useCallback((tipToc: string): string[] => {
    if (tipToc === "Toc reglabil cu falt") return erkadoTocTunel.map(e => e.range);
    if (tipToc === "Toc reglabil fara falt") return erkadoTocFaraFalt.map(e => e.range);
    if (tipToc === "Toc cu reversie") return erkadoTocReversie.map(e => e.range);
    if (tipToc === "Toc reglabil suprapunere") return erkadoTocSuprapunere.map(e => e.range);
    if (tipToc === "Toc metalic") return erkadoTocMetalic.map(e => e.range);
    return [];
  }, [erkadoTocTunel, erkadoTocFaraFalt, erkadoTocReversie, erkadoTocSuprapunere, erkadoTocMetalic]);

  const getErkadoSpecialTocFinisaje = useCallback((tipToc: string): string[] => {
    if (tipToc === "Toc reglabil cu falt" || tipToc === "Toc reglabil fara falt")
      return [...ERKADO_TOC_TUNEL_FINISAJE];
    if (tipToc === "Toc cu reversie") return [...ERKADO_TOC_REVERSIE_FINISAJE];
    if (tipToc === "Toc reglabil suprapunere") return [...ERKADO_TOC_SUPRAPUNERE_FINISAJE];
    return [];
  }, []);

  const getErkadoSpecialTocPrice = useCallback((tipToc: string, range: string, finisaj: string): number | null => {
    if (tipToc === "Toc reglabil cu falt") {
      const e = erkadoTocTunel.find(r => r.range === range);
      return e ? ((e as Record<string, unknown>)[finisaj] as number ?? null) : null;
    }
    if (tipToc === "Toc reglabil fara falt") {
      const e = erkadoTocFaraFalt.find(r => r.range === range);
      return e ? ((e as Record<string, unknown>)[finisaj] as number ?? null) : null;
    }
    if (tipToc === "Toc cu reversie") {
      const e = erkadoTocReversie.find(r => r.range === range);
      return e ? ((e as Record<string, unknown>)[finisaj] as number ?? null) : null;
    }
    if (tipToc === "Toc reglabil suprapunere") {
      const e = erkadoTocSuprapunere.find(r => r.range === range);
      return e ? ((e as Record<string, unknown>)[finisaj] as number ?? null) : null;
    }
    if (tipToc === "Toc metalic") {
      const e = erkadoTocMetalic.find(r => r.range === range);
      return e ? e.price : null;
    }
    return null;
  }, [erkadoTocTunel, erkadoTocFaraFalt, erkadoTocReversie, erkadoTocSuprapunere, erkadoTocMetalic]);

  const getErkadoSpecialTocRangePrices = useCallback((tipToc: string, finisaj: string): Record<string, number | null> =>
    Object.fromEntries(
      getErkadoSpecialTocRanges(tipToc).map(r => [r, getErkadoSpecialTocPrice(tipToc, r, finisaj)])
    ),
    [getErkadoSpecialTocRanges, getErkadoSpecialTocPrice]
  );

  const getErkadoSpecialTocFinisajPrices = useCallback((tipToc: string, range: string): Record<string, number | null> =>
    Object.fromEntries(
      getErkadoSpecialTocFinisaje(tipToc).map(f => [f, getErkadoSpecialTocPrice(tipToc, range, f)])
    ),
    [getErkadoSpecialTocFinisaje, getErkadoSpecialTocPrice]
  );

  // ── Persist helpers ──────────────────────────────────────────────────────────
  const persistFeronerie = useCallback(async (i: FerenerieItem[]) => {
    setFerenerieState(i); await saveFeronerie(i);
  }, []);
  const persistManere = useCallback(async (i: ManereItem[]) => {
    setManereState(i); await saveManere(i);
  }, []);
  const persistCosturi = useCallback(async (i: CosturiItem[]) => {
    setCosturiState(i); await saveCosturi(i);
  }, []);
  const persistCulori = useCallback(async (d: CuloriData) => {
    setCuloriState(d); await saveCulori(d);
  }, []);

  const upsertCosturiItem = useCallback((label: string, price: number | null) => {
    setCosturiState(prev => {
      const exists = prev.some(c => c.label === label);
      const updated = exists
        ? prev.map(c => c.label === label ? { ...c, price } : c)
        : [...prev, { label, price }];
      setTimeout(() => saveCosturi(updated).catch(console.error), 0);
      return updated;
    });
  }, []);

  const updateDoorPriceOverride = useCallback((key: string, price: number) => {
    setDoorPriceOverridesState(prev => {
      const updated = { ...prev, [key]: price };
      setTimeout(() => saveDoorPriceOverrides(updated).catch(console.error), 0);
      return updated;
    });
  }, []);

  const deleteCosturiItem = useCallback((label: string) => {
    setCosturiState(prev => {
      const updated = prev.filter(c => c.label !== label);
      setTimeout(() => saveCosturi(updated).catch(console.error), 0);
      return updated;
    });
  }, []);

  const deleteDoorPriceOverride = useCallback((key: string) => {
    setDoorPriceOverridesState(prev => {
      const updated = { ...prev };
      delete updated[key];
      setTimeout(() => saveDoorPriceOverrides(updated).catch(console.error), 0);
      return updated;
    });
  }, []);

  const updateEuroCourse = useCallback((rate: number) => {
    setEuroCourseState(rate);
    saveEuroCourse(rate).catch(console.error);
  }, []);

  return {
    loading,
    // Feronerie
    feronerie, ferMap, balModels, balCulori,
    // Manere
    manere, manereModels, manereTips,
    getManereColLabels, manerePriceFromLabel,
    // Costuri
    costuri, costuriLabels, costuriMap,
    // Culori
    culori,
    // Door overrides
    doorPriceOverrides,
    // Euro
    euroCourse,
    // Toc / pervaz price tables
    erkadoReglaj,
    erkadoTocTunel,
    erkadoTocFaraFalt,
    erkadoTocReversie,
    erkadoTocSuprapunere,
    erkadoTocMetalic,
    naturenTocReglabilDrept,
    tocFixPrices,
    pervazFixErkadoPrices,
    pervazFixNaturenPrices,
    // Erkado special toc helpers
    getErkadoSpecialTocRanges,
    getErkadoSpecialTocFinisaje,
    getErkadoSpecialTocPrice,
    getErkadoSpecialTocRangePrices,
    getErkadoSpecialTocFinisajPrices,
    // Persist
    persistFeronerie,
    persistManere,
    persistCosturi,
    persistCulori,
    upsertCosturiItem,
    updateDoorPriceOverride,
    deleteCosturiItem,
    deleteDoorPriceOverride,
    updateEuroCourse,
  };
}
