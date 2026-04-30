'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAnalytics, getPeriodRanges } from '@/lib/analytics';
import { getMonthlyTargets, calculateTargetStatus } from '@/lib/monthlyTargets';
import { startOfDay, endOfDay } from 'date-fns';
import { getRecentActivities } from '@/lib/activity';

export default function ManagementPage() {
  const { user, loading, isAdmin, userRole } = useAuth();
  const router = useRouter();

  const [todayReports, setTodayReports] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentActivitiesCount, setRecentActivitiesCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && userRole && userRole !== 'admin' && userRole !== 'superior' && userRole !== 'management') {
      router.push('/management/raportari');
    }
  }, [user, loading, router, userRole]);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);
      const today = new Date();

      const reportsQuery = query(
        collection(db, 'showroomReports'),
        where('date', '>=', Timestamp.fromDate(startOfDay(today))),
        where('date', '<=', Timestamp.fromDate(endOfDay(today)))
      );
      const [todaySnap, allSnap] = await Promise.all([
        getDocs(reportsQuery),
        getDocs(collection(db, 'showroomReports'))
      ]);
      setTodayReports(todaySnap.size);
      setTotalReports(allSnap.size);

      const periods = getPeriodRanges();
      const analytics = await getAnalytics(periods.thisMonth.startDate, periods.thisMonth.endDate);
      const totalMonthRevenue = analytics.reduce((sum, a) => sum + a.totalRevenue, 0);
      setMonthlyRevenue(totalMonthRevenue);

      const targets = await getMonthlyTargets(today.getMonth() + 1, today.getFullYear());
      const totalTarget = targets.reduce((sum, t) => sum + t.targetAmount, 0);
      if (totalTarget > 0) setTargetProgress((totalMonthRevenue / totalTarget) * 100);

      if (userRole === 'admin' || userRole === 'superior') {
        const [usersSnap, activities] = await Promise.all([
          getDocs(collection(db, 'users')),
          getRecentActivities(10)
        ]);
        setTotalUsers(usersSnap.size);
        setRecentActivitiesCount(activities.length);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v) + ' RON';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  const Spinner = () => (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Se încarcă...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? 'Gestionați sistemul de raportare showroom' : 'Vizualizați datele și analizele showroom'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Raportări */}
          {(userRole === 'admin' || userRole === 'superior' || userRole === 'showroom') && (
            <Link href="/management/raportari"
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50">
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <svg className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Raportări</h3>
              <p className="text-sm text-slate-500 mb-4">Rapoarte zilnice cu date de vânzări din showroom</p>
              {dataLoading ? <Spinner /> : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">{todayReports}</div>
                    <div className="text-xs text-slate-500">Rapoarte astăzi</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-700">{totalReports}</div>
                    <div className="text-xs text-slate-500">Total rapoarte</div>
                  </div>
                </div>
              )}
            </Link>
          )}

          {/* Analiză */}
          {(userRole === 'admin' || userRole === 'superior' || userRole === 'management') && (
            <Link href="/management/analytics"
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <svg className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Analiză</h3>
              <p className="text-sm text-slate-500 mb-4">Metrici de performanță și target-uri lunare</p>
              {dataLoading ? <Spinner /> : (
                <div>
                  <div className="text-2xl font-bold text-emerald-600 mb-1">{fmt(monthlyRevenue)}</div>
                  <div className="text-xs text-slate-500 mb-3">Venituri luna curentă</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(targetProgress, 100)}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{targetProgress.toFixed(0)}%</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Progres target</div>
                </div>
              )}
            </Link>
          )}

          {/* Dashboard utilizatori */}
          {(userRole === 'admin' || userRole === 'superior') && (
            <Link href="/management/admin"
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-50">
                  <svg className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <svg className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Dashboard</h3>
              <p className="text-sm text-slate-500 mb-4">
                {isAdmin ? 'Gestionați utilizatorii și configurația sistemului' : 'Vizualizați structura echipei'}
              </p>
              {dataLoading ? <Spinner /> : (
                <div>
                  <div className="text-3xl font-bold text-purple-600">{totalUsers}</div>
                  <div className="text-xs text-slate-500">Utilizatori în sistem</div>
                </div>
              )}
            </Link>
          )}

          {/* Activitate */}
          {(userRole === 'admin' || userRole === 'superior') && (
            <Link href="/management/activity"
              className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-50">
                  <svg className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <svg className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Activitate</h3>
              <p className="text-sm text-slate-500 mb-4">Urmăriți toate activitățile și modificările sistemului</p>
              {dataLoading ? <Spinner /> : (
                <div>
                  <div className="text-3xl font-bold text-orange-600">{recentActivitiesCount}</div>
                  <div className="text-xs text-slate-500">Activități recente</div>
                </div>
              )}
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
