"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getFeronerie, saveFeronerie,
  getManere, saveManere,
  getCosturi, saveCosturi,
  getCulori, saveCulori,
  getDoorPriceOverrides, saveDoorPriceOverrides,
  getEuroCourse, saveEuroCourse,
  type FerenerieItem, type ManereItem, type CosturiItem, type CuloriData,
} from "../../lib/configuratorOptions";
import {
  FERONERIE as FERONERIE_CONST,
  MANERE_DATA,
  COSTURI as COSTURI_CONST,
  CULORI_PER_COLECTIE,
} from "../data/constants";

function seedFeronerie(): FerenerieItem[] {
  return Object.entries(FERONERIE_CONST).map(([key, price]) => {
    const parts = key.split("|");
    return { nrBal: parseInt(parts[0]) as 2 | 3, model: parts[1], culoare: parts[2], price };
  });
}

function seedManere(): ManereItem[] {
  const items: ManereItem[] = [];
  for (const [model, tips] of Object.entries(MANERE_DATA)) {
    for (const [tip, entries] of Object.entries(tips)) {
      for (const { culoare, price } of entries) {
        items.push({ model, tip, culoare, price });
      }
    }
  }
  return items;
}

function seedCosturi(): CosturiItem[] {
  return COSTURI_CONST.map(([label, price]) => ({ label, price }));
}

export type { FerenerieItem, ManereItem, CosturiItem, CuloriData };

export function useConfiguratorOptions() {
  const [feronerie, setFerenerieState] = useState<FerenerieItem[]>([]);
  const [manere, setManereState] = useState<ManereItem[]>([]);
  const [costuri, setCosturiState] = useState<CosturiItem[]>([]);
  const [culori, setCuloriState] = useState<CuloriData>({});
  const [doorPriceOverrides, setDoorPriceOverridesState] = useState<Record<string, number>>({});
  const [euroCourse, setEuroCourseState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFeronerie(),
      getManere(),
      getCosturi(),
      getCulori(),
      getDoorPriceOverrides(),
      getEuroCourse(),
    ]).then(([f, m, c, col, dpo, eur]) => {
      const fer = f ?? seedFeronerie();
      const man = m ?? seedManere();
      const cos = c ?? seedCosturi();
      const cul = col ?? { ...CULORI_PER_COLECTIE };
      const dpoData = dpo ?? {};

      if (!f) saveFeronerie(fer).catch(console.error);
      if (!m) saveManere(man).catch(console.error);
      if (!c) saveCosturi(cos).catch(console.error);
      if (!col) saveCulori(cul).catch(console.error);

      setFerenerieState(fer);
      setManereState(man);
      setCosturiState(cos);
      setCuloriState(cul);
      setDoorPriceOverridesState(dpoData);
      if (eur !== null) setEuroCourseState(eur);
      setLoading(false);
    }).catch(() => {
      setFerenerieState(seedFeronerie());
      setManereState(seedManere());
      setCosturiState(seedCosturi());
      setCuloriState({ ...CULORI_PER_COLECTIE });
      setLoading(false);
    });
  }, []);

  const ferMap = useMemo(
    () => Object.fromEntries(feronerie.map(f => [`${f.nrBal}|${f.model}|${f.culoare}`, f.price])),
    [feronerie]
  );

  const balModels = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const f of feronerie) if (!seen.has(f.model)) { seen.add(f.model); result.push(f.model); }
    return result;
  }, [feronerie]);

  const balCulori = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const f of feronerie) if (!seen.has(f.culoare)) { seen.add(f.culoare); result.push(f.culoare); }
    return result;
  }, [feronerie]);

  const manereModels = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
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

  const getManereColLabels = useCallback((model: string, tip: string): string[] => {
    return manere
      .filter(m => m.model === model && m.tip === tip)
      .map(m => m.culoare === "—" ? `${m.price} EUR` : `${m.culoare}  –  ${m.price} EUR`);
  }, [manere]);

  const manerePriceFromLabel = useCallback((model: string, tip: string, label: string): number | null => {
    for (const item of manere) {
      if (item.model === model && item.tip === tip) {
        const expected = item.culoare === "—" ? `${item.price} EUR` : `${item.culoare}  –  ${item.price} EUR`;
        if (expected === label) return item.price;
      }
    }
    return null;
  }, [manere]);

  const costuriLabels = useMemo(() => costuri.map(c => c.label), [costuri]);
  const costuriMap = useMemo(
    () => Object.fromEntries(costuri.map(c => [c.label, c.price])) as Record<string, number | null>,
    [costuri]
  );

  const persistFeronerie = useCallback(async (items: FerenerieItem[]) => {
    setFerenerieState(items);
    await saveFeronerie(items);
  }, []);

  const persistManere = useCallback(async (items: ManereItem[]) => {
    setManereState(items);
    await saveManere(items);
  }, []);

  const persistCosturi = useCallback(async (items: CosturiItem[]) => {
    setCosturiState(items);
    await saveCosturi(items);
  }, []);

  const persistCulori = useCallback(async (data: CuloriData) => {
    setCuloriState(data);
    await saveCulori(data);
  }, []);

  const upsertCosturiItem = useCallback((label: string, price: number | null) => {
    setCosturiState(prev => {
      const exists = prev.some(c => c.label === label);
      const updated = exists
        ? prev.map(c => c.label === label ? { ...c, price } : c)
        : [...prev, { label, price }];
      // Fire-and-forget outside the render cycle
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
    feronerie, ferMap, balModels, balCulori,
    manere, manereModels, manereTips,
    getManereColLabels, manerePriceFromLabel,
    costuri, costuriLabels, costuriMap,
    culori,
    doorPriceOverrides,
    euroCourse,
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
