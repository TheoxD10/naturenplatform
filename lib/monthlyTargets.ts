import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ShowroomLocation } from './userRoles';

export interface MonthlyTarget {
  id?: string;
  showroomLocation: ShowroomLocation;
  targetAmount: number;
  month: number;
  year: number;
  createdAt: Date;
  createdBy: string;
}

export async function getMonthlyTargets(month: number, year: number): Promise<MonthlyTarget[]> {
  const q = query(collection(db, 'monthlyTargets'), where('month', '==', month), where('year', '==', year));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() } as MonthlyTarget));
}

export async function getLocationTarget(location: ShowroomLocation, month: number, year: number): Promise<MonthlyTarget | null> {
  const targets = await getMonthlyTargets(month, year);
  return targets.find(t => t.showroomLocation === location) || null;
}

export async function setMonthlyTarget(
  showroomLocation: ShowroomLocation,
  targetAmount: number,
  month: number,
  year: number,
  userId: string
): Promise<void> {
  const existing = await getLocationTarget(showroomLocation, month, year);
  if (existing?.id) {
    await updateDoc(doc(db, 'monthlyTargets', existing.id), { targetAmount, createdBy: userId, createdAt: new Date() });
  } else {
    await addDoc(collection(db, 'monthlyTargets'), { showroomLocation, targetAmount, month, year, createdAt: new Date(), createdBy: userId });
  }
}

export async function deleteMonthlyTarget(targetId: string): Promise<void> {
  await deleteDoc(doc(db, 'monthlyTargets', targetId));
}

export function calculateExpectedProgress(targetAmount: number, currentDate: Date = new Date()): number {
  const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dayOfMonth = currentDate.getDate();
  return Math.round((targetAmount / totalDays) * dayOfMonth * 100) / 100;
}

export function calculateTargetStatus(actualRevenue: number, targetAmount: number, currentDate: Date = new Date()) {
  const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const dayOfMonth = currentDate.getDate();
  const daysRemaining = totalDays - dayOfMonth;
  const expectedRevenue = calculateExpectedProgress(targetAmount, currentDate);
  const difference = actualRevenue - expectedRevenue;
  const percentageOfTarget = targetAmount > 0 ? (actualRevenue / targetAmount) * 100 : 0;
  const percentageOfExpected = expectedRevenue > 0 ? (actualRevenue / expectedRevenue) * 100 : 0;
  const status: 'ahead' | 'on-pace' | 'behind' = percentageOfExpected >= 105 ? 'ahead' : percentageOfExpected >= 95 ? 'on-pace' : 'behind';
  const dailyRequiredAverage = daysRemaining > 0 ? (targetAmount - actualRevenue) / daysRemaining : 0;
  return {
    expectedRevenue: Math.round(expectedRevenue * 100) / 100,
    difference: Math.round(difference * 100) / 100,
    percentageOfTarget: Math.round(percentageOfTarget * 10) / 10,
    percentageOfExpected: Math.round(percentageOfExpected * 10) / 10,
    status,
    daysRemaining,
    dailyRequiredAverage: Math.round(dailyRequiredAverage * 100) / 100,
  };
}
