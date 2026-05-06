import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

const COL = "configurator_options";

export async function getFeronerie(): Promise<FerenerieItem[] | null> {
  try {
    const snap = await getDoc(doc(db, COL, "feronerie"));
    return snap.exists() ? (snap.data().items as FerenerieItem[]) : null;
  } catch { return null; }
}

export async function saveFeronerie(items: FerenerieItem[]): Promise<void> {
  await setDoc(doc(db, COL, "feronerie"), { items, updatedAt: new Date().toISOString() });
}

export async function getManere(): Promise<ManereItem[] | null> {
  try {
    const snap = await getDoc(doc(db, COL, "manere"));
    return snap.exists() ? (snap.data().items as ManereItem[]) : null;
  } catch { return null; }
}

export async function saveManere(items: ManereItem[]): Promise<void> {
  await setDoc(doc(db, COL, "manere"), { items, updatedAt: new Date().toISOString() });
}

export async function getCosturi(): Promise<CosturiItem[] | null> {
  try {
    const snap = await getDoc(doc(db, COL, "costuri"));
    return snap.exists() ? (snap.data().items as CosturiItem[]) : null;
  } catch { return null; }
}

export async function saveCosturi(items: CosturiItem[]): Promise<void> {
  await setDoc(doc(db, COL, "costuri"), { items, updatedAt: new Date().toISOString() });
}

export async function getCulori(): Promise<CuloriData | null> {
  try {
    const snap = await getDoc(doc(db, COL, "culori"));
    return snap.exists() ? (snap.data().data as CuloriData) : null;
  } catch { return null; }
}

export async function saveCulori(data: CuloriData): Promise<void> {
  await setDoc(doc(db, COL, "culori"), { data, updatedAt: new Date().toISOString() });
}

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

export async function getEuroCourse(): Promise<number | null> {
  try {
    const snap = await getDoc(doc(db, COL, "euro_course"));
    return snap.exists() ? (snap.data().rate as number) : null;
  } catch { return null; }
}

export async function saveEuroCourse(rate: number): Promise<void> {
  await setDoc(doc(db, COL, "euro_course"), { rate, updatedAt: new Date().toISOString() });
}
