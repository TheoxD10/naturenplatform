import { getAdminDb } from './firebase-admin';

export interface EmailRecipient {
  id?: string;
  email: string;
  name: string;
  addedAt: Date;
  addedBy: string;
}

export async function getEmailRecipients(): Promise<EmailRecipient[]> {
  const snapshot = await getAdminDb().collection('emailRecipients').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    addedAt: doc.data().addedAt?.toDate() || new Date()
  } as EmailRecipient));
}

export async function updateLastSentTimestamp(): Promise<void> {
  const configRef = getAdminDb().doc('emailConfig/dailyReport');
  const snap = await configRef.get();
  if (snap.exists) {
    await configRef.update({ lastSent: new Date(), updatedAt: new Date(), updatedBy: 'system' });
  }
}
