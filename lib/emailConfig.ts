import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface EmailConfig {
  enabled: boolean;
  sendTime: string;
  timezone: string;
  lastSent?: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

export interface EmailRecipient {
  id?: string;
  email: string;
  name: string;
  addedAt: Date;
  addedBy: string;
}

export async function getEmailConfig(): Promise<EmailConfig | null> {
  const snap = await getDoc(doc(db, 'emailConfig', 'dailyReport'));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate(), lastSent: data.lastSent?.toDate() } as EmailConfig;
}

export async function updateEmailConfig(config: Partial<EmailConfig>, userId: string): Promise<void> {
  const existing = await getEmailConfig();
  const updated: any = {
    enabled: config.enabled ?? existing?.enabled ?? true,
    sendTime: config.sendTime ?? existing?.sendTime ?? '20:00',
    timezone: config.timezone ?? existing?.timezone ?? 'Europe/Bucharest',
    createdAt: existing?.createdAt ?? new Date(),
    updatedAt: new Date(),
    updatedBy: userId,
  };
  if (config.lastSent || existing?.lastSent) updated.lastSent = config.lastSent ?? existing?.lastSent;
  await setDoc(doc(db, 'emailConfig', 'dailyReport'), updated);
}

export async function getEmailRecipients(): Promise<EmailRecipient[]> {
  const snap = await getDocs(collection(db, 'emailRecipients'));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), addedAt: d.data().addedAt?.toDate() } as EmailRecipient));
}

export async function addEmailRecipient(email: string, name: string, userId: string): Promise<string> {
  const existing = await getEmailRecipients();
  if (existing.some(r => r.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already in recipient list');
  const ref = await addDoc(collection(db, 'emailRecipients'), { email: email.toLowerCase().trim(), name: name.trim(), addedAt: new Date(), addedBy: userId });
  return ref.id;
}

export async function removeEmailRecipient(recipientId: string): Promise<void> {
  await deleteDoc(doc(db, 'emailRecipients', recipientId));
}
