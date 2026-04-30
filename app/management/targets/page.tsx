'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { SHOWROOM_LOCATIONS, ShowroomLocation } from '@/lib/userRoles';
import { getMonthlyTargets, setMonthlyTarget, MonthlyTarget } from '@/lib/monthlyTargets';

export default function TargetsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [targets, setTargets] = useState<MonthlyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [targetAmounts, setTargetAmounts] = useState<Record<ShowroomLocation, number>>({
    Sibiu: 0, Iasi: 0, Constanta: 0, Oradea: 0, Bucuresti: 0, Timisoara1: 0, Timisoara2: 0, Cluj: 0
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/management');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) loadTargets();
  }, [user, isAdmin, selectedMonth, selectedYear]);

  const loadTargets = async () => {
    try {
      setLoading(true);
      const data = await getMonthlyTargets(selectedMonth, selectedYear);
      setTargets(data);
      const amounts: Record<ShowroomLocation, number> = { Sibiu: 0, Iasi: 0, Constanta: 0, Oradea: 0, Bucuresti: 0, Timisoara1: 0, Timisoara2: 0, Cluj: 0 };
      data.forEach(t => { amounts[t.showroomLocation] = t.targetAmount; });
      setTargetAmounts(amounts);
    } catch { setError('Eroare la încărcarea target-urilor'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setSaving(true); setError(''); setSuccess('');
      await Promise.all(SHOWROOM_LOCATIONS.map(loc => setMonthlyTarget(loc, targetAmounts[loc], selectedMonth, selectedYear, user.uid)));
      setSuccess('Target-uri salvate cu succes!');
      await loadTargets();
    } catch { setError('Eroare la salvarea target-urilor'); }
    finally { setSaving(false); }
  };

  const handleCopyPrevious = async () => {
    try {
      setLoading(true);
      let prevMonth = selectedMonth - 1, prevYear = selectedYear;
      if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
      const prev = await getMonthlyTargets(prevMonth, prevYear);
      if (prev.length === 0) { setError('Nu există target-uri pentru luna anterioară'); return; }
      const amounts = { ...targetAmounts };
      prev.forEach(t => { amounts[t.showroomLocation] = t.targetAmount; });
      setTargetAmounts(amounts);
      setSuccess('Target-uri copiate din luna anterioară!');
    } catch { setError('Eroare la copierea target-urilor'); }
    finally { setLoading(false); }
  };

  const fmt = (v: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v) + ' RON';
  const monthName = (m: number) => new Date(2000, m - 1, 1).toLocaleDateString('ro-RO', { month: 'long' });
  const totalTarget = Object.values(targetAmounts).reduce((s, v) => s + v, 0);

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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.push('/management/analytics')}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Target-uri lunare</h1>
            <p className="text-sm text-slate-500 mt-0.5">Setați target-uri de venituri pentru fiecare locație</p>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Selectare perioadă</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lună</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{monthName(m)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">An</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500">
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleCopyPrevious}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium">
                Copiați din luna anterioară
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-purple-100 text-sm font-medium">Total target lunar</span>
              <div className="text-3xl font-bold mt-1">{fmt(totalTarget)}</div>
            </div>
            <svg className="w-10 h-10 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Target-uri pe locație</h2>
          </div>
          <div className="p-6 space-y-4">
            {SHOWROOM_LOCATIONS.map(loc => (
              <div key={loc} className="flex items-center gap-4">
                <label className="w-32 font-medium text-slate-900 text-sm">{loc}</label>
                <div className="flex-1 relative">
                  <input type="number" value={targetAmounts[loc]} step="1000"
                    onChange={(e) => setTargetAmounts({ ...targetAmounts, [loc]: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">RON</span>
                </div>
                <div className="w-40 text-right text-sm text-slate-500">{fmt(targetAmounts[loc])}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button onClick={() => router.push('/management/analytics')}
              className="px-5 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm">
              Anulează
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg hover:from-purple-700 hover:to-purple-600 transition disabled:opacity-50 text-sm font-semibold">
              {saving ? 'Se salvează...' : 'Salvare target-uri'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
