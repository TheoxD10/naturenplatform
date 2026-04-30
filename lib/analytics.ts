import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ShowroomLocation } from './userRoles';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';

export interface ShowroomAnalytics {
  location: ShowroomLocation;
  totalRevenue: number;
  totalVisitors: number;
  totalOrders: number;
  newOrders: number;
  conversionRate: number;
  avgOrderValue: number;
  cashPayments: number;
  cardPayments: number;
  advancePayments: number;
  finalInvoices: number;
  quotes: number;
}

export interface PaymentMethodStats {
  cash: number; card: number; cashPercentage: number; cardPercentage: number;
}

export interface DailyRevenue { date: string; revenue: number; orders: number; }
export interface TopPerformer { location: ShowroomLocation; value: number; percentage: number; }
export interface VisitorSource { source: string; count: number; percentage: number; }

async function fetchReports(startDate: Date, endDate: Date, location?: ShowroomLocation) {
  let q = query(
    collection(db, 'showroomReports'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate))
  );
  if (location) {
    q = query(
      collection(db, 'showroomReports'),
      where('showroomLocation', '==', location),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function getAnalytics(startDate: Date, endDate: Date, location?: ShowroomLocation): Promise<ShowroomAnalytics[]> {
  const reports = await fetchReports(startDate, endDate, location);
  const locationMap = new Map<ShowroomLocation, any[]>();
  reports.forEach(r => {
    const loc = r.showroomLocation as ShowroomLocation;
    if (!locationMap.has(loc)) locationMap.set(loc, []);
    locationMap.get(loc)!.push(r);
  });

  const analytics: ShowroomAnalytics[] = [];
  locationMap.forEach((reps, loc) => {
    const totalRevenue = reps.filter(r => r.valoare != null).reduce((s, r) => s + r.valoare, 0);
    const uniqueVisitors = new Set(reps.map(r => r.telefonClient)).size;
    const totalOrders = reps.length;
    const newOrders = reps.filter(r => r.comandaNoua === 'Da').length;
    const ordersWithValue = reps.filter(r => r.valoare != null);
    analytics.push({
      location: loc,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalVisitors: uniqueVisitors,
      totalOrders,
      newOrders,
      conversionRate: Math.round((uniqueVisitors > 0 ? (newOrders / uniqueVisitors) * 100 : 0) * 10) / 10,
      avgOrderValue: Math.round((ordersWithValue.length > 0 ? totalRevenue / ordersWithValue.length : 0) * 100) / 100,
      cashPayments: Math.round(reps.filter(r => r.metodaPlata === 'Numerar' && r.valoare).reduce((s, r) => s + r.valoare, 0) * 100) / 100,
      cardPayments: Math.round(reps.filter(r => r.metodaPlata === 'CARD' && r.valoare).reduce((s, r) => s + r.valoare, 0) * 100) / 100,
      advancePayments: Math.round(reps.filter(r => r.tipActiune === 'Incasare avans' && r.valoare).reduce((s, r) => s + r.valoare, 0) * 100) / 100,
      finalInvoices: Math.round(reps.filter(r => r.tipActiune === 'Facturare finala' && r.valoare).reduce((s, r) => s + r.valoare, 0) * 100) / 100,
      quotes: reps.filter(r => r.tipActiune === 'Ofertare').length,
    });
  });
  return analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export async function getPaymentMethodStats(startDate: Date, endDate: Date, location?: ShowroomLocation): Promise<PaymentMethodStats> {
  const reports = await fetchReports(startDate, endDate, location);
  const cash = reports.filter(r => r.metodaPlata === 'Numerar' && r.valoare).reduce((s, r) => s + r.valoare, 0);
  const card = reports.filter(r => r.metodaPlata === 'CARD' && r.valoare).reduce((s, r) => s + r.valoare, 0);
  const total = cash + card;
  return {
    cash: Math.round(cash * 100) / 100,
    card: Math.round(card * 100) / 100,
    cashPercentage: total > 0 ? Math.round((cash / total) * 1000) / 10 : 0,
    cardPercentage: total > 0 ? Math.round((card / total) * 1000) / 10 : 0,
  };
}

export async function getDailyRevenue(startDate: Date, endDate: Date, location?: ShowroomLocation): Promise<DailyRevenue[]> {
  const reports = await fetchReports(startDate, endDate, location);
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  reports.forEach(r => {
    const date = (r.date as Timestamp).toDate();
    const dateStr = date.toISOString().split('T')[0];
    if (!dailyMap.has(dateStr)) dailyMap.set(dateStr, { revenue: 0, orders: 0 });
    const stats = dailyMap.get(dateStr)!;
    if (r.valoare) stats.revenue += r.valoare;
    stats.orders++;
  });
  return Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, revenue: Math.round(stats.revenue * 100) / 100, orders: stats.orders }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopPerformers(startDate: Date, endDate: Date, limitCount = 5): Promise<TopPerformer[]> {
  const analytics = await getAnalytics(startDate, endDate);
  const totalRevenue = analytics.reduce((s, a) => s + a.totalRevenue, 0);
  return analytics.slice(0, limitCount).map(a => ({
    location: a.location,
    value: a.totalRevenue,
    percentage: totalRevenue > 0 ? Math.round((a.totalRevenue / totalRevenue) * 1000) / 10 : 0,
  }));
}

export async function getVisitorSources(startDate: Date, endDate: Date, location?: ShowroomLocation): Promise<VisitorSource[]> {
  const reports = await fetchReports(startDate, endDate, location);
  const sourceMap = new Map<string, number>();
  reports.forEach(r => {
    const source = r.sursaVizitator || 'Unknown';
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  });
  const total = reports.length;
  return Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count, percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getPeriodRanges() {
  const now = new Date();
  return {
    today: { startDate: startOfDay(now), endDate: endOfDay(now), label: 'Azi' },
    thisMonth: { startDate: startOfMonth(now), endDate: endOfMonth(now), label: 'Luna curentă' },
    lastMonth: { startDate: startOfMonth(subMonths(now, 1)), endDate: endOfMonth(subMonths(now, 1)), label: 'Luna trecută' },
    thisYear: { startDate: startOfYear(now), endDate: endOfYear(now), label: 'Anul curent' },
    lastYear: { startDate: startOfYear(subYears(now, 1)), endDate: endOfYear(subYears(now, 1)), label: 'Anul trecut' },
  };
}
