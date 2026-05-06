'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TaskStatus } from '@/lib/tasks';
import { getAnalytics, getPeriodRanges } from '@/lib/analytics';
import { getMonthlyTargets } from '@/lib/monthlyTargets';
import { startOfDay, endOfDay } from 'date-fns';
import { getRecentActivities } from '@/lib/activity';
import { getUserData, UserData } from '@/lib/userRoles';

interface DashCard {
  href: string;
  label: string;
  desc: string;
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
  stat: React.ReactNode;
  roles: string[];
}

export default function ManagementPage() {
  const { user, loading, isAdmin, userRole } = useAuth();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [todayReports, setTodayReports] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentActivitiesCount, setRecentActivitiesCount] = useState(0);
  const [activeTaskCount, setActiveTaskCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (!loading && user && userRole && !['admin', 'superior', 'management'].includes(userRole))
      router.push('/management/raportari');
  }, [user, loading, router, userRole]);

  useEffect(() => {
    if (user) getUserData(user.uid).then(setUserData);
  }, [user]);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
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
        getDocs(collection(db, 'showroomReports')),
      ]);
      setTodayReports(todaySnap.size);
      setTotalReports(allSnap.size);

      const periods = getPeriodRanges();
      const analytics = await getAnalytics(periods.thisMonth.startDate, periods.thisMonth.endDate);
      const totalMonthRevenue = analytics.reduce((s, a) => s + a.totalRevenue, 0);
      setMonthlyRevenue(totalMonthRevenue);

      const targets = await getMonthlyTargets(today.getMonth() + 1, today.getFullYear());
      const totalTarget = targets.reduce((s, t) => s + t.targetAmount, 0);
      if (totalTarget > 0) setTargetProgress((totalMonthRevenue / totalTarget) * 100);

      if (userRole === 'admin' || userRole === 'superior') {
        const [usersSnap, activities] = await Promise.all([
          getDocs(collection(db, 'users')),
          getRecentActivities(10),
        ]);
        setTotalUsers(usersSnap.size);
        setRecentActivitiesCount(activities.length);
      }

      const tasksSnap = await getDocs(collection(db, 'tasks'));
      const activeTasks = tasksSnap.docs.filter((d) => {
        const s = d.data().status as TaskStatus;
        return s === 'de_facut' || s === 'in_lucru';
      });
      setActiveTaskCount(activeTasks.length);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [user, userRole]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v) + ' RON';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Bună ziua' : 'Bună seara';
  const firstName = userData?.name?.split(' ')[0] || '';

  const lastRefStr = lastRefreshed
    ? lastRefreshed.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    : null;

  const Spinner = () => (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Se încarcă…
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }
  if (!user) return null;

  // ── Dashboard cards config ────────────────────────────────
  const cards: DashCard[] = [
    {
      href: '/management/opciuni',
      label: 'Opțiuni Configurator',
      desc: 'Editați balamale, mânere, costuri și culori din configurator',
      accentColor: 'border-l-indigo-500',
      iconBg: 'bg-indigo-50',
      roles: ['admin', 'superior'],
      icon: (
        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      stat: (
        <div>
          <div className="text-sm font-semibold text-indigo-700">Balamale · Mânere · Costuri · Culori</div>
          <div className="text-xs text-slate-500 mt-0.5">Modificările se salvează automat în Firebase</div>
        </div>
      ),
    },
    {
      href: '/management/raportari',
      label: 'Raportări',
      desc: 'Rapoarte zilnice cu date de vânzări din showroom',
      accentColor: 'border-l-blue-500',
      iconBg: 'bg-blue-50',
      roles: ['admin', 'superior', 'showroom'],
      icon: (
        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      stat: dataLoading ? <Spinner /> : (
        <div className="flex items-end gap-6">
          <div>
            <div className="text-3xl font-bold text-blue-600">{todayReports}</div>
            <div className="text-xs text-slate-500 mt-0.5">Rapoarte astăzi</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-slate-600">{totalReports}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total rapoarte</div>
          </div>
        </div>
      ),
    },
    {
      href: '/management/analytics',
      label: 'Analiză',
      desc: 'Metrici de performanță și target-uri lunare',
      accentColor: 'border-l-emerald-500',
      iconBg: 'bg-emerald-50',
      roles: ['admin', 'superior', 'management'],
      icon: (
        <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      stat: dataLoading ? <Spinner /> : (
        <div>
          <div className="text-2xl font-bold text-emerald-600 mb-0.5">{fmt(monthlyRevenue)}</div>
          <div className="text-xs text-slate-500 mb-3">Venituri luna curentă</div>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 bg-slate-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${targetProgress >= 100 ? 'bg-emerald-500' : targetProgress >= 75 ? 'bg-blue-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-600 tabular-nums">{targetProgress.toFixed(0)}%</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Progres target lunar</div>
        </div>
      ),
    },
    {
      href: '/management/admin',
      label: 'Dashboard',
      desc: isAdmin ? 'Gestionați utilizatorii și configurația sistemului' : 'Vizualizați structura echipei',
      accentColor: 'border-l-purple-500',
      iconBg: 'bg-purple-50',
      roles: ['admin', 'superior'],
      icon: (
        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      stat: dataLoading ? <Spinner /> : (
        <div>
          <div className="text-3xl font-bold text-purple-600">{totalUsers}</div>
          <div className="text-xs text-slate-500 mt-0.5">Utilizatori în sistem</div>
        </div>
      ),
    },
    {
      href: '/management/tasks',
      label: 'Sarcini',
      desc: (userRole === 'admin' || userRole === 'superior') ? 'Atribuiți și urmăriți sarcinile echipei' : 'Sarcinile atribuite vouă',
      accentColor: 'border-l-teal-500',
      iconBg: 'bg-teal-50',
      roles: ['admin', 'superior', 'management'],
      icon: (
        <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      stat: dataLoading ? <Spinner /> : (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-3xl font-bold text-teal-600">{activeTaskCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Sarcini active</div>
          </div>
          {activeTaskCount > 0 && (
            <div className="h-10 w-10 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center shrink-0">
              <span className="text-teal-600 font-bold text-sm">{activeTaskCount}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      href: '/management/activity',
      label: 'Activitate',
      desc: 'Urmăriți toate activitățile și modificările sistemului',
      accentColor: 'border-l-orange-500',
      iconBg: 'bg-orange-50',
      roles: ['admin', 'superior'],
      icon: (
        <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      stat: dataLoading ? <Spinner /> : (
        <div>
          <div className="text-3xl font-bold text-orange-600">{recentActivitiesCount}</div>
          <div className="text-xs text-slate-500 mt-0.5">Activități recente</div>
        </div>
      ),
    },
  ];

  const visibleCards = cards.filter((c) => c.roles.includes(userRole || ''));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Page header ───────────────────────────────── */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Refresh */}
          <div className="flex items-center gap-3 shrink-0">
            {lastRefStr && (
              <span className="text-xs text-slate-400 hidden sm:block">
                Actualizat la {lastRefStr}
              </span>
            )}
            <button
              onClick={loadDashboardData}
              disabled={dataLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 transition shadow-sm"
            >
              <svg className={`h-3.5 w-3.5 ${dataLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizează
            </button>
          </div>
        </div>

        {/* ── Cards grid ────────────────────────────────── */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`group relative overflow-hidden rounded-xl border-l-4 ${card.accentColor} border border-slate-200 bg-white p-7 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
            >
              {/* Arrow indicator */}
              <svg
                className="absolute top-5 right-5 h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>

              <div className="flex items-center gap-3 mb-5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg} shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{card.label}</h3>
                  <p className="text-xs text-slate-500 leading-tight mt-0.5">{card.desc}</p>
                </div>
              </div>

              {card.stat}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
