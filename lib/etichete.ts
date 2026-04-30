import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Eticheta {
  id?: string;
  nume: string;
  culoare: string;
  createdAt: Timestamp;
  createdBy: string;
}

export function subscribeEtichete(callback: (items: Eticheta[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'reclamatii_etichete'), orderBy('createdAt', 'asc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Eticheta)))
  );
}

export async function createEticheta(nume: string, culoare: string, userId: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'reclamatii_etichete'), {
    nume, culoare, createdBy: userId, createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEticheta(id: string, data: { nume?: string; culoare?: string }): Promise<void> {
  await updateDoc(doc(db, 'reclamatii_etichete', id), data);
}

export async function deleteEticheta(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reclamatii_etichete', id));
}

export const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#64748b', '#0f172a', '#7c3aed', '#db2777', '#059669',
  '#0284c7', '#d97706', '#dc2626',
];
