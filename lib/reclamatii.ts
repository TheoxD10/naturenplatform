import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDoc, onSnapshot, query, where, orderBy,
  runTransaction, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type ReclamatieStatus = 'noua' | 'in_lucru' | 'rezolvata' | 'inchisa';
export type UrgentaNivel = 'scazuta' | 'medie' | 'ridicata';

export interface Reclamatie {
  id?: string;
  numar: string;
  numeClient: string;
  emailClient: string;
  descriere: string;
  informatiiExtra?: string;
  informatiiClient?: string;
  urgenta: UrgentaNivel;
  status: ReclamatieStatus;
  tokenAcces: string;
  etichete: string[];
  assignedTo?: string;
  assignedToNume?: string;
  createdAt: Timestamp;
  createdBy: string;
  createdByEmail: string;
  updatedAt: Timestamp;
}

export interface Comentariu {
  id?: string;
  reclamatieId: string;
  userId: string;
  userNume: string;
  userEmail: string;
  continut: string;
  mentions: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function randomToken(length = 20): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createReclamatie(
  data: Pick<Reclamatie, 'numeClient' | 'emailClient' | 'descriere' | 'informatiiExtra' | 'urgenta' | 'etichete' | 'createdBy' | 'createdByEmail'>
): Promise<{ id: string; numar: string; tokenAcces: string }> {
  const counterRef = doc(db, 'counters', 'reclamatii');
  let numar = '';

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const seq = snap.exists() ? (snap.data().count as number) + 1 : 1;
    tx.set(counterRef, { count: seq }, { merge: true });
    numar = `REC-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
  });

  const tokenAcces = randomToken();
  const docRef = await addDoc(collection(db, 'reclamatii'), {
    ...data,
    numar,
    tokenAcces,
    status: 'noua' as ReclamatieStatus,
    informatiiClient: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, numar, tokenAcces };
}

export async function getReclamatie(id: string): Promise<Reclamatie | null> {
  const snap = await getDoc(doc(db, 'reclamatii', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Reclamatie;
}

export async function getReclamatieByToken(token: string): Promise<Reclamatie | null> {
  const { getDocs } = await import('firebase/firestore');
  const snap = await getDocs(query(collection(db, 'reclamatii'), where('tokenAcces', '==', token)));
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Reclamatie;
}

export async function updateReclamatie(
  id: string,
  data: Partial<Omit<Reclamatie, 'id' | 'numar' | 'tokenAcces' | 'createdAt' | 'createdBy' | 'createdByEmail'>>
): Promise<void> {
  await updateDoc(doc(db, 'reclamatii', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteReclamatie(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reclamatii', id));
}

export function subscribeReclamatii(callback: (items: Reclamatie[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'reclamatii'), orderBy('createdAt', 'desc')),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reclamatie)))
  );
}

export function subscribeComentarii(reclamatieId: string, callback: (items: Comentariu[]) => void): () => void {
  return onSnapshot(
    query(
      collection(db, 'reclamatii_comentarii'),
      where('reclamatieId', '==', reclamatieId),
      orderBy('createdAt', 'asc')
    ),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comentariu)))
  );
}

export async function addComentariu(
  data: Pick<Comentariu, 'reclamatieId' | 'userId' | 'userNume' | 'userEmail' | 'continut' | 'mentions'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'reclamatii_comentarii'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateComentariu(id: string, continut: string, mentions: string[]): Promise<void> {
  await updateDoc(doc(db, 'reclamatii_comentarii', id), {
    continut, mentions, updatedAt: serverTimestamp(),
  });
}

export async function deleteComentariu(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reclamatii_comentarii', id));
}

export const STATUS_LABELS: Record<ReclamatieStatus, string> = {
  noua: 'Nouă',
  in_lucru: 'În lucru',
  rezolvata: 'Rezolvată',
  inchisa: 'Închisă',
};

export const STATUS_COLORS: Record<ReclamatieStatus, string> = {
  noua: 'bg-blue-100 text-blue-800',
  in_lucru: 'bg-yellow-100 text-yellow-800',
  rezolvata: 'bg-green-100 text-green-800',
  inchisa: 'bg-slate-100 text-slate-600',
};

export const URGENTA_LABELS: Record<UrgentaNivel, string> = {
  scazuta: 'Scăzută',
  medie: 'Medie',
  ridicata: 'Ridicată',
};

export const URGENTA_COLORS: Record<UrgentaNivel, string> = {
  scazuta: 'bg-slate-100 text-slate-600',
  medie: 'bg-orange-100 text-orange-700',
  ridicata: 'bg-red-100 text-red-700',
};

export function parseMentions(text: string): string {
  return text.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
}
