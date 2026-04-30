import { adminDb } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export type ShowroomLocation = 'Sibiu' | 'Iasi' | 'Constanta' | 'Oradea' | 'Bucuresti' | 'Timisoara1' | 'Timisoara2' | 'Cluj';

export interface DailyMetrics {
  showroomName: ShowroomLocation;
  visitorsToday: number;
  conversionRateToday: number;
  avgNewOrderValue: number;
  advancePaymentsToday: number;
  salesInvoicedToday: number;
  salesInvoicedMonthToDate: number;
  monthlyTarget: number;
  targetAchievementPercentage: number;
}

function getTodayRange(): { start: Date; end: Date } {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
}

function getMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

async function calculateShowroomMetrics(location: ShowroomLocation, monthlyTarget: number): Promise<DailyMetrics> {
  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: monthStart, end: monthEnd } = getMonthRange();

  const reportsRef = adminDb.collection('showroomReports');

  const [todaySnapshot, monthSnapshot] = await Promise.all([
    reportsRef
      .where('showroomLocation', '==', location)
      .where('date', '>=', Timestamp.fromDate(todayStart))
      .where('date', '<=', Timestamp.fromDate(todayEnd))
      .get(),
    reportsRef
      .where('showroomLocation', '==', location)
      .where('date', '>=', Timestamp.fromDate(monthStart))
      .where('date', '<=', Timestamp.fromDate(monthEnd))
      .get()
  ]);

  const todayReports = todaySnapshot.docs.map(doc => doc.data());
  const monthReports = monthSnapshot.docs.map(doc => doc.data());

  const uniqueVisitorsToday = new Set(todayReports.map(r => r.telefonClient)).size;
  const newOrdersToday = todayReports.filter(r => r.comandaNoua === 'Da');
  const conversionRateToday = uniqueVisitorsToday > 0 ? (newOrdersToday.length / uniqueVisitorsToday) * 100 : 0;
  const newOrderValues = newOrdersToday.filter(r => r.valoare != null).map(r => r.valoare as number);
  const avgNewOrderValue = newOrderValues.length > 0 ? newOrderValues.reduce((s, v) => s + v, 0) / newOrderValues.length : 0;
  const advancePaymentsToday = todayReports.filter(r => r.tipActiune === 'Incasare avans').reduce((s, r) => s + (r.valoare || 0), 0);
  const salesInvoicedToday = todayReports.filter(r => r.tipActiune === 'Facturare finala').reduce((s, r) => s + (r.valoare || 0), 0);
  const salesInvoicedMonthToDate = monthReports.filter(r => r.tipActiune === 'Facturare finala').reduce((s, r) => s + (r.valoare || 0), 0);
  const targetAchievementPercentage = monthlyTarget > 0 ? (salesInvoicedMonthToDate / monthlyTarget) * 100 : 0;

  return {
    showroomName: location,
    visitorsToday: uniqueVisitorsToday,
    conversionRateToday: Math.round(conversionRateToday * 10) / 10,
    avgNewOrderValue: Math.round(avgNewOrderValue * 100) / 100,
    advancePaymentsToday: Math.round(advancePaymentsToday * 100) / 100,
    salesInvoicedToday: Math.round(salesInvoicedToday * 100) / 100,
    salesInvoicedMonthToDate: Math.round(salesInvoicedMonthToDate * 100) / 100,
    monthlyTarget,
    targetAchievementPercentage: Math.round(targetAchievementPercentage * 10) / 10
  };
}

async function getMonthlyTargets(): Promise<Map<ShowroomLocation, number>> {
  const now = new Date();
  const snapshot = await adminDb.collection('monthlyTargets')
    .where('month', '==', now.getMonth() + 1)
    .where('year', '==', now.getFullYear())
    .get();

  const targets = new Map<ShowroomLocation, number>();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    targets.set(data.showroomLocation as ShowroomLocation, data.targetAmount);
  });
  return targets;
}

export async function calculateAllShowroomsMetrics(): Promise<DailyMetrics[]> {
  const locations: ShowroomLocation[] = ['Sibiu', 'Iasi', 'Constanta', 'Oradea', 'Bucuresti', 'Timisoara1', 'Timisoara2', 'Cluj'];
  const targets = await getMonthlyTargets();
  return Promise.all(locations.map(loc => calculateShowroomMetrics(loc, targets.get(loc) || 0)));
}

export function formatRON(amount: number): string {
  return new Intl.NumberFormat('ro-RO', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' RON';
}

export function formatPercentage(percentage: number): string {
  return percentage.toFixed(1) + '%';
}
