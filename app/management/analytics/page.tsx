'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getAnalytics, getPaymentMethodStats, getDailyRevenue, getTopPerformers, getVisitorSources, getPeriodRanges, ShowroomAnalytics, PaymentMethodStats, DailyRevenue, TopPerformer, VisitorSource } from '@/lib/analytics';
import { ShowroomLocation, SHOWROOM_LOCATIONS } from '@/lib/userRoles';
import { getMonthlyTargets, calculateTargetStatus, MonthlyTarget } from '@/lib/monthlyTargets';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import Link from 'next/link';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<ShowroomAnalytics[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentMethodStats | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [visitorSources, setVisitorSources] = useState<VisitorSource[]>([]);
  const [monthlyTargets, setMonthlyTargets] = useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedLocation, setSelectedLocation] = useState<ShowroomLocation | 'all'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const canView = userRole === 'admin' || userRole === 'superior' || userRole === 'management';

  useEffect(() => {
    if (!authLoading && (!user || !canView)) router.push('/management');
  }, [authLoading, user, canView, router]);

  useEffect(() => {
    if (user && canView) loadAnalytics();
  }, [user, canView, selectedPeriod, selectedLocation, customStartDate, customEndDate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const periods = getPeriodRanges();
      let startDate: Date, endDate: Date;
      if (selectedPeriod === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate); endDate = new Date(customEndDate);
      } else {
        const period = periods[selectedPeriod as keyof typeof periods] || periods.thisMonth;
        startDate = period.startDate; endDate = period.endDate;
      }
      const location = selectedLocation === 'all' ? undefined : selectedLocation;
      const now = new Date();
      const [analyticsData, paymentStatsData, dailyRevenueData, topPerformersData, visitorSourcesData, targetsData] = await Promise.all([
        getAnalytics(startDate, endDate, location),
        getPaymentMethodStats(startDate, endDate, location),
        getDailyRevenue(startDate, endDate, location),
        getTopPerformers(startDate, endDate, 5),
        getVisitorSources(startDate, endDate, location),
        selectedPeriod === 'thisMonth' ? getMonthlyTargets(now.getMonth() + 1, now.getFullYear()) : Promise.resolve([])
      ]);
      setAnalytics(analyticsData); setPaymentStats(paymentStatsData); setDailyRevenue(dailyRevenueData);
      setTopPerformers(topPerformersData); setVisitorSources(visitorSourcesData); setMonthlyTargets(targetsData);
    } catch (error) { console.error('Error loading analytics:', error); }
    finally { setLoading(false); }
  };

  const fmt = (v: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + ' RON';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ro-RO', { month: 'short', day: 'numeric' });

  const totalRevenue = analytics.reduce((s, a) => s + a.totalRevenue, 0);
  const totalVisitors = analytics.reduce((s, a) => s + a.totalVisitors, 0);
  const totalOrders = analytics.reduce((s, a) => s + a.totalOrders, 0);
  const avgConversion = analytics.length > 0 ? analytics.reduce((s, a) => s + a.conversionRate, 0) / analytics.length : 0;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <svg className="h-8 w-8 animate-spin text-purple-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user || !canView) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Analiză Dashboard</h1>
          <p className="text-slate-500 text-sm">Performanța detaliată a showroom-urilor</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Perioadă</label>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500">
              <option value="today">Azi</option>
              <option value="thisMonth">Luna curentă</option>
              <option value="lastMonth">Luna trecută</option>
              <option value="thisYear">Anul curent</option>
              <option value="lastYear">Anul trecut</option>
              <option value="custom">Interval personalizat</option>
            </select>
          </div>
          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Data început</label>
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Data sfârșit</label>
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Locație</label>
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value as ShowroomLocation | 'all')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500">
              <option value="all">Toate locațiile</option>
              {SHOWROOM_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Venituri totale', value: fmt(totalRevenue), color: 'from-purple-500 to-purple-600', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Total vizitatori', value: totalVisitors.toString(), color: 'from-blue-500 to-blue-600', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { label: 'Total comenzi', value: totalOrders.toString(), color: 'from-green-500 to-green-600', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { label: 'Conversie medie', value: `${avgConversion.toFixed(1)}%`, color: 'from-orange-500 to-orange-600', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">{label}</span>
                <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
              <div className="text-3xl font-bold">{value}</div>
            </div>
          ))}
        </div>

        {/* Monthly Target Progress */}
        {selectedPeriod === 'thisMonth' && monthlyTargets.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Progres Target Lunar</h2>
              {userRole === 'admin' && (
                <Link href="/management/targets" className="text-sm text-purple-600 hover:underline">Gestionare target-uri →</Link>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={analytics.map(a => {
                    const target = monthlyTargets.find(t => t.showroomLocation === a.location);
                    const status = calculateTargetStatus(a.totalRevenue, target?.targetAmount || 0);
                    return { location: a.location, actual: a.totalRevenue, target: target?.targetAmount || 0, expected: status.expectedRevenue };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="location" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(v: any) => fmt(Number(v))} />
                    <Legend />
                    <Bar dataKey="target" fill="#94a3b8" name="Target" />
                    <Bar dataKey="expected" fill="#f59e0b" name="Așteptat (pro-rata)" />
                    <Bar dataKey="actual" fill="#8b5cf6" name="Realizat" />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {analytics.map(a => {
                    const target = monthlyTargets.find(t => t.showroomLocation === a.location);
                    if (!target) return null;
                    const status = calculateTargetStatus(a.totalRevenue, target.targetAmount);
                    const sc = status.status === 'ahead' ? 'text-green-600' : status.status === 'on-pace' ? 'text-blue-600' : 'text-red-600';
                    const sb = status.status === 'ahead' ? 'bg-green-100' : status.status === 'on-pace' ? 'bg-blue-100' : 'bg-red-100';
                    const barColor = status.status === 'ahead' ? 'bg-green-600' : status.status === 'on-pace' ? 'bg-blue-600' : 'bg-red-600';
                    return (
                      <div key={a.location} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900">{a.location}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sb} ${sc} font-semibold`}>{status.status.toUpperCase()}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between"><span className="text-slate-500">Realizat:</span><span className="font-semibold">{fmt(a.totalRevenue)}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Target:</span><span className="font-semibold">{fmt(target.targetAmount)}</span></div>
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${Math.min(status.percentageOfTarget, 100)}%` }} />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className={sc}>{status.difference >= 0 ? '+' : ''}{fmt(status.difference)}</span>
                            <span className="text-slate-500">{status.percentageOfTarget.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Evoluție venituri zilnice</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={fmtDate} />
                <YAxis />
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Venituri" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Top performeri</h2>
            <div className="space-y-4">
              {topPerformers.map((p, i) => (
                <div key={p.location} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold text-sm">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-900 text-sm">{p.location}</span>
                      <span className="text-xs text-slate-500">{p.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${p.percentage}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">{fmt(p.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Metode de plată</h2>
            {paymentStats && (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={[{ name: 'Numerar', value: paymentStats.cash }, { name: 'Card', value: paymentStats.card }]}
                      cx="50%" cy="50%" outerRadius={100} dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(1)}%`}>
                      <Cell fill="#10b981" /><Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip formatter={(v: any) => fmt(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{fmt(paymentStats.cash)}</div>
                    <div className="text-xs text-slate-500">Numerar ({paymentStats.cashPercentage}%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{fmt(paymentStats.card)}</div>
                    <div className="text-xs text-slate-500">Card ({paymentStats.cardPercentage}%)</div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Surse vizitatori</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitorSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="source" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Analiză detaliată pe locații</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Locație', 'Venituri', 'Vizitatori', 'Comenzi', 'Comenzi noi', 'Conversie', 'Valoare medie'].map(h => (
                    <th key={h} className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${h === 'Locație' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {analytics.map((d, i) => (
                  <tr key={d.location} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{d.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{fmt(d.totalRevenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{d.totalVisitors}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{d.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{d.newOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{d.conversionRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-600">{fmt(d.avgOrderValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
