import { db } from "./firebase";
import { doc, getDoc, setDoc, type DocumentSnapshot, type DocumentData } from "firebase/firestore";

export type FerenerieItem = {
  nrBal: 2 | 3;
  model: string;
  culoare: string;
  price: number;
};

export type ManereItem = {
  model: string;
  tip: string;
  culoare: string;
  price: number;
};

export type CosturiItem = {
  label: string;
  price: number | null;
};

export type CuloriData = Record<string, Record<string, string[]>>;

export type ErkadoReglajItem = { range: string; priceEur: number };
export type ErkadoTocTunelRow = { range: string; GREKO: number; "CPL/PREMIUM": number; "CPL 0.2": number; LACUIT: number };
export type ErkadoTocRevesieRow = { range: string; GREKO: number; "CPL ST/PREMIUM": number; LACUITE: number };
export type ErkadoTocSuprapunereRow = { range: string; GREKO: number; "CPL ST/PREMIUM": number };
export type ErkadoTocMetalicRow = { range: string; price: number };
export type NaturenTocRow = { range: string; price: number | null };

const COL = "configurator_options";

function items<T>(snap: DocumentSnapshot<DocumentData>, key = "items"): T | null {
  return snap.exists() ? ((snap.data() as Record<string, unknown>)[key] as T) : null;
}

function data<T>(snap: DocumentSnapshot<DocumentData>): T | null {
  return snap.exists() ? ((snap.data() as Record<string, unknown>)["data"] as T) : null;
}

// ── Feronerie ─────────────────────────────────────────────────────────────────
export async function getFeronerie(): Promise<FerenerieItem[] | null> {
  try { return items<FerenerieItem[]>(await getDoc(doc(db, COL, "feronerie"))); } catch { return null; }
}
export async function saveFeronerie(i: FerenerieItem[]): Promise<void> {
  await setDoc(doc(db, COL, "feronerie"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Manere ────────────────────────────────────────────────────────────────────
export async function getManere(): Promise<ManereItem[] | null> {
  try { return items<ManereItem[]>(await getDoc(doc(db, COL, "manere"))); } catch { return null; }
}
export async function saveManere(i: ManereItem[]): Promise<void> {
  await setDoc(doc(db, COL, "manere"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Costuri ───────────────────────────────────────────────────────────────────
export async function getCosturi(): Promise<CosturiItem[] | null> {
  try { return items<CosturiItem[]>(await getDoc(doc(db, COL, "costuri"))); } catch { return null; }
}
export async function saveCosturi(i: CosturiItem[]): Promise<void> {
  await setDoc(doc(db, COL, "costuri"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Culori ────────────────────────────────────────────────────────────────────
export async function getCulori(): Promise<CuloriData | null> {
  try { return data<CuloriData>(await getDoc(doc(db, COL, "culori"))); } catch { return null; }
}
export async function saveCulori(d: CuloriData): Promise<void> {
  await setDoc(doc(db, COL, "culori"), { data: d, updatedAt: new Date().toISOString() });
}

// ── Door price overrides ──────────────────────────────────────────────────────
export async function getDoorPriceOverrides(): Promise<Record<string, number> | null> {
  try {
    const snap = await getDoc(doc(db, COL, "door_custom"));
    if (!snap.exists()) return null;
    return (snap.data().priceOverrides ?? {}) as Record<string, number>;
  } catch { return null; }
}
export async function saveDoorPriceOverrides(overrides: Record<string, number>): Promise<void> {
  await setDoc(doc(db, COL, "door_custom"), { priceOverrides: overrides, updatedAt: new Date().toISOString() }, { merge: true });
}

// ── Euro course ───────────────────────────────────────────────────────────────
export async function getEuroCourse(): Promise<number | null> {
  try {
    const snap = await getDoc(doc(db, COL, "euro_course"));
    return snap.exists() ? (snap.data().rate as number) : null;
  } catch { return null; }
}
export async function saveEuroCourse(rate: number): Promise<void> {
  await setDoc(doc(db, COL, "euro_course"), { rate, updatedAt: new Date().toISOString() });
}

// ── Erkado reglaj ─────────────────────────────────────────────────────────────
export async function getErkadoReglaj(): Promise<ErkadoReglajItem[] | null> {
  try { return items<ErkadoReglajItem[]>(await getDoc(doc(db, COL, "erkado_reglaj"))); } catch { return null; }
}
export async function saveErkadoReglaj(i: ErkadoReglajItem[]): Promise<void> {
  await setDoc(doc(db, COL, "erkado_reglaj"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Erkado toc tunel / toc cu falt (same price table) ────────────────────────
export async function getErkadoTocTunel(): Promise<ErkadoTocTunelRow[] | null> {
  try { return items<ErkadoTocTunelRow[]>(await getDoc(doc(db, COL, "erkado_toc_tunel"))); } catch { return null; }
}
export async function saveErkadoTocTunel(i: ErkadoTocTunelRow[]): Promise<void> {
  await setDoc(doc(db, COL, "erkado_toc_tunel"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Erkado toc fara falt ──────────────────────────────────────────────────────
export async function getErkadoTocFaraFalt(): Promise<ErkadoTocTunelRow[] | null> {
  try { return items<ErkadoTocTunelRow[]>(await getDoc(doc(db, COL, "erkado_toc_fara_falt"))); } catch { return null; }
}
export async function saveErkadoTocFaraFalt(i: ErkadoTocTunelRow[]): Promise<void> {
  await setDoc(doc(db, COL, "erkado_toc_fara_falt"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Erkado toc reversie ───────────────────────────────────────────────────────
export async function getErkadoTocReversie(): Promise<ErkadoTocRevesieRow[] | null> {
  try { return items<ErkadoTocRevesieRow[]>(await getDoc(doc(db, COL, "erkado_toc_reversie"))); } catch { return null; }
}
export async function saveErkadoTocReversie(i: ErkadoTocRevesieRow[]): Promise<void> {
  await setDoc(doc(db, COL, "erkado_toc_reversie"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Erkado toc suprapunere ────────────────────────────────────────────────────
export async function getErkadoTocSuprapunere(): Promise<ErkadoTocSuprapunereRow[] | null> {
  try { return items<ErkadoTocSuprapunereRow[]>(await getDoc(doc(db, COL, "erkado_toc_suprapunere"))); } catch { return null; }
}
export async function saveErkadoTocSuprapunere(i: ErkadoTocSuprapunereRow[]): Promise<void> {
  await setDoc(doc(db, COL, "erkado_toc_suprapunere"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Erkado toc metalic ────────────────────────────────────────────────────────
export async function getErkadoTocMetalic(): Promise<ErkadoTocMetalicRow[] | null> {
  try { return items<ErkadoTocMetalicRow[]>(await getDoc(doc(db, COL, "erkado_toc_metalic"))); } catch { return null; }
}
export async function saveErkadoTocMetalic(i: ErkadoTocMetalicRow[]): Promise<void> {
  await setDoc(doc(db, COL, "erkado_toc_metalic"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Naturen toc reglabil drept ────────────────────────────────────────────────
export async function getNaturenTocReglabilDrept(): Promise<NaturenTocRow[] | null> {
  try { return items<NaturenTocRow[]>(await getDoc(doc(db, COL, "naturen_toc_reglabil_drept"))); } catch { return null; }
}
export async function saveNaturenTocReglabilDrept(i: NaturenTocRow[]): Promise<void> {
  await setDoc(doc(db, COL, "naturen_toc_reglabil_drept"), { items: i, updatedAt: new Date().toISOString() });
}

// ── Toc fix prices ────────────────────────────────────────────────────────────
export async function getTocFixPrices(): Promise<Record<string, Record<string, number>> | null> {
  try { return data<Record<string, Record<string, number>>>(await getDoc(doc(db, COL, "toc_fix_prices"))); } catch { return null; }
}
export async function saveTocFixPrices(d: Record<string, Record<string, number>>): Promise<void> {
  await setDoc(doc(db, COL, "toc_fix_prices"), { data: d, updatedAt: new Date().toISOString() });
}

// ── Pervaz fix Erkado prices ──────────────────────────────────────────────────
export async function getPervazFixErkadoPrices(): Promise<Record<string, Record<string, number>> | null> {
  try { return data<Record<string, Record<string, number>>>(await getDoc(doc(db, COL, "pervaz_fix_erkado"))); } catch { return null; }
}
export async function savePervazFixErkadoPrices(d: Record<string, Record<string, number>>): Promise<void> {
  await setDoc(doc(db, COL, "pervaz_fix_erkado"), { data: d, updatedAt: new Date().toISOString() });
}

// ── Pervaz fix Naturen prices ─────────────────────────────────────────────────
export async function getPervazFixNaturenPrices(): Promise<Record<string, number> | null> {
  try { return data<Record<string, number>>(await getDoc(doc(db, COL, "pervaz_fix_naturen"))); } catch { return null; }
}
export async function savePervazFixNaturenPrices(d: Record<string, number>): Promise<void> {
  await setDoc(doc(db, COL, "pervaz_fix_naturen"), { data: d, updatedAt: new Date().toISOString() });
}
