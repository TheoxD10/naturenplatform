import { db } from './firebase';
import {
  collection, addDoc, query, where, getDocs, orderBy,
  Timestamp, doc, updateDoc, deleteDoc, runTransaction, setDoc
} from 'firebase/firestore';
import { encrypt, decrypt } from './encryption';

export type TipActiune = 'Incasare avans' | 'Facturare finala' | 'Ofertare';
export type MetodaPlata = 'Numerar' | 'CARD';
export type ComandaNoua = 'Da' | 'Nu';
export type SursaVizitator = 'Client existent' | 'Online' | 'Trafic natural' | 'Vizita teren' | 'Reclama Radio' | 'Altele';

export interface ShowroomReport {
  id?: string;
  reportId: number;
  date: Date;
  tipActiune: TipActiune;
  valoare: number | null;
  metodaPlata: MetodaPlata;
  comandaNoua: ComandaNoua;
  sursaVizitator: SursaVizitator;
  sursaVizitatorAltele?: string;
  produseOfertate: string;
  numeClient: string;
  telefonClient: string;
  email: string;
  alteInformatii: string;
  showroomLocation: string;
  createdBy: string;
  createdByEmail: string;
  createdByName?: string;
  createdAt: Date;
  modifiedAt?: Date;
  modifiedBy?: string;
  modifiedByEmail?: string;
}

const REPORTS_COLLECTION = 'showroomReports';
const COUNTER_DOC = 'counters';

async function getNextReportId(): Promise<number> {
  const counterRef = doc(db, COUNTER_DOC, 'reportCounter');
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const nextId = snap.exists() ? (snap.data().lastReportId || 0) + 1 : 1;
    tx.set(counterRef, { lastReportId: nextId }, { merge: true });
    return nextId;
  });
}

export async function createShowroomReport(
  reportData: Omit<ShowroomReport, 'id' | 'reportId' | 'createdAt' | 'modifiedAt'>
): Promise<string> {
  const reportId = await getNextReportId();
  const encryptedData = {
    ...reportData,
    numeClient: encrypt(reportData.numeClient),
    telefonClient: encrypt(reportData.telefonClient),
    email: encrypt(reportData.email),
  };
  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...encryptedData,
    reportId,
    date: Timestamp.fromDate(reportData.date),
    createdAt: Timestamp.fromDate(new Date()),
  });
  return docRef.id;
}

export async function getShowroomReports(userRole: string, showroomLocation?: string): Promise<ShowroomReport[]> {
  let q;
  if (userRole === 'showroom' && showroomLocation) {
    q = query(collection(db, REPORTS_COLLECTION), where('showroomLocation', '==', showroomLocation), orderBy('reportId', 'desc'));
  } else if (['admin', 'superior', 'management'].includes(userRole)) {
    q = query(collection(db, REPORTS_COLLECTION), orderBy('reportId', 'desc'));
  } else {
    return [];
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      numeClient: decrypt(data.numeClient || ''),
      telefonClient: decrypt(data.telefonClient || ''),
      email: decrypt(data.email || ''),
      date: data.date?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
      modifiedAt: data.modifiedAt?.toDate(),
    } as ShowroomReport;
  });
}

export async function updateShowroomReport(
  reportId: string,
  updates: Partial<ShowroomReport>,
  modifiedBy: string,
  modifiedByEmail: string
): Promise<void> {
  const updateData: any = { ...updates };
  if (updateData.date) updateData.date = Timestamp.fromDate(updateData.date);
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), {
    ...updateData,
    modifiedAt: Timestamp.fromDate(new Date()),
    modifiedBy,
    modifiedByEmail,
  });
}

export async function deleteShowroomReport(reportId: string): Promise<void> {
  await deleteDoc(doc(db, REPORTS_COLLECTION, reportId));
}
