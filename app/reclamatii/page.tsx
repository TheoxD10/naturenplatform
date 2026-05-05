'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ReclamatiiNavbar from './components/ReclamatiiNavbar';
import Link from 'next/link';
import {
  Reclamatie, ReclamatieStatus, UrgentaNivel,
  STATUS_LABELS, STATUS_COLORS, URGENTA_LABELS, URGENTA_COLORS,
  subscribeReclamatii, createReclamatie,
} from '@/lib/reclamatii';
import { Eticheta, subscribeEtichete } from '@/lib/etichete';
import TagBadge from './components/TagBadge';

type SortKey = 'numar' | 'status' | 'urgenta' | 'date' | '';
type SortDir = 'asc' | 'desc';

const URGENTA_ORDER: Record<UrgentaNivel, number> = { ridicata: 0, medie: 1, scazuta: 2 };
const STATUS_ORDER: Record<ReclamatieStatus, number> = { noua: 0, in_lucru: 1, rezolvata: 2, inchisa: 3 };

const URGENTA_ROW: Record<UrgentaNivel, string> = {
  ridicata: 'border-l-4 border-l-rose-500',
  medie:    'border-l-4 border-l-amber-400',
  scazuta:  'border-l-4 border-l-blue-400',
};

const URGENTA_STAT_COLOR: Record<UrgentaNivel, { bg: string; icon: string }> = {
  ridicata: { bg: 'bg-rose-50 border-rose-200',   icon: 'text-rose-500' },
  medie:    { bg: 'bg-amber-50 border-amber-200',  icon: 'text-amber-500' },
  scazuta:  { bg: 'bg-blue-50 border-blue-200',    icon: 'text-blue-500' },
};

const INITIAL_FORM = {
  numeClient: '', emailClient: '', descriere: '',
  informatiiExtra: '', urgenta: 'medie' as UrgentaNivel, etichete: [] as string[],
};

export default function ReclamatiiPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reclamatii, setReclamatii] = useState<Reclamatie[]>([]);
  const [etichete, setEtichete] = useState<Eticheta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  const [filterStatus, setFilterStatus] = useState<ReclamatieStatus | ''>('');
  const [filterUrgenta, setFilterUrgenta] = useState<UrgentaNivel | ''>('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeReclamatii((data) => { setReclamatii(data); setLoading(false); });
    const unsub2 = subscribeEtichete(setEtichete);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const filtered = reclamatii
    .filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterUrgenta && r.urgenta !== filterUrgenta) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.numeClient.toLowerCase().includes(q) && !r.numar.toLowerCase().includes(q) && !r.emailClient.toLowerCase().includes(q))
          return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'date': {
          const ta = a.createdAt?.toDate?.()?.getTime() ?? 0;
          const tb = b.createdAt?.toDate?.()?.getTime() ?? 0;
          return (ta - tb) * dir;
        }
        case 'urgenta':
          return (URGENTA_ORDER[a.urgenta] - URGENTA_ORDER[b.urgenta]) * dir;
        case 'status':
          return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir;
        case 'numar':
          return a.numar.localeCompare(b.numar) * dir;
        default:
          return 0;
      }
    });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.numeClient.trim() || !form.emailClient.trim() || !form.descriere.trim()) {
      setError('Completați toate câmpurile obligatorii');
      return;
    }
    try {
      setSubmitting(true); setError('');
      const { id, numar, tokenAcces } = await createReclamatie({
        numeClient: form.numeClient.trim(),
        emailClient: form.emailClient.trim(),
        descriere: form.descriere.trim(),
        informatiiExtra: form.informatiiExtra.trim(),
        urgenta: form.urgenta,
        etichete: form.etichete,
        createdBy: user.uid,
        createdByEmail: user.email || '',
      });
      await fetch('/api/reclamatii-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_complaint',
          to: form.emailClient.trim(),
          numeClient: form.numeClient.trim(),
          numarReclamatie: numar,
          statusLink: `${window.location.origin}/reclamatii/status/${tokenAcces}`,
        }),
      }).catch(() => {});
      setForm(INITIAL_FORM);
      setShowCreate(false);
      router.push(`/reclamatii/${id}`);
    } catch { setError('Eroare la crearea reclamației'); }
    finally { setSubmitting(false); }
  };

  const etichetaMap = Object.fromEntries(etichete.map((e) => [e.id!, e]));
  const counts: Record<ReclamatieStatus, number> = { noua: 0, in_lucru: 0, rezolvata: 0, inchisa: 0 };
  reclamatii.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  const urgentaCounts: Record<UrgentaNivel, number> = { ridicata: 0, medie: 0, scazuta: 0 };
  reclamatii.filter(r => r.status !== 'inchisa').forEach(r => { urgentaCounts[r.urgenta]++; });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return (
      <svg className="h-3.5 w-3.5 text-slate-400 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
    return (
      <svg className="h-3.5 w-3.5 text-rose-500 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={sortDir === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
      </svg>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500" />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <ReclamatiiNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reclamații</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestionarea reclamațiilor clienților</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/reclamatii/etichete"
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              Etichete
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg hover:from-rose-700 hover:to-rose-600 shadow-sm transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Reclamație nouă
            </button>
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {(Object.entries(counts) as [ReclamatieStatus, number][]).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              className={`rounded-xl p-4 text-left border transition-all ${
                filterStatus === status
                  ? 'ring-2 ring-rose-500 ring-offset-1 bg-white border-rose-200'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow'
              }`}
            >
              <div className="text-2xl font-black text-slate-900 mb-1">{count}</div>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </button>
          ))}
        </div>

        {/* ── Urgency mini-bar ─────────────────────────────── */}
        {(urgentaCounts.ridicata > 0 || urgentaCounts.medie > 0 || urgentaCounts.scazuta > 0) && (
          <div className="flex gap-2 mb-4">
            {(Object.entries(urgentaCounts) as [UrgentaNivel, number][])
              .filter(([, c]) => c > 0)
              .map(([urg, c]) => {
                const cfg = URGENTA_STAT_COLOR[urg];
                return (
                  <button
                    key={urg}
                    onClick={() => setFilterUrgenta(filterUrgenta === urg ? '' : urg)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${cfg.bg} ${filterUrgenta === urg ? 'ring-2 ring-offset-1 ring-rose-400' : ''}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${urg === 'ridicata' ? 'bg-rose-500' : urg === 'medie' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className={cfg.icon}>{URGENTA_LABELS[urg]}</span>
                    <span className="text-slate-500">({c})</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────── */}
        <div className="mb-4 flex flex-wrap gap-3 bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
          <div className="relative flex-1 min-w-[180px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Caută după client, număr…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReclamatieStatus | '')}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white outline-none"
          >
            <option value="">Toate statusurile</option>
            {(Object.entries(STATUS_LABELS) as [ReclamatieStatus, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <select
            value={filterUrgenta}
            onChange={(e) => setFilterUrgenta(e.target.value as UrgentaNivel | '')}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white outline-none"
          >
            <option value="">Toate urgențele</option>
            {(Object.entries(URGENTA_LABELS) as [UrgentaNivel, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {(filterStatus || filterUrgenta || search) && (
            <button
              onClick={() => { setFilterStatus(''); setFilterUrgenta(''); setSearch(''); }}
              className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              ✕ Resetare
            </button>
          )}
        </div>

        {/* ── Table ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              {filtered.length} {filtered.length === 1 ? 'reclamație' : 'reclamații'}
            </h2>
            <span className="text-xs text-slate-400">Click pe coloană pentru sortare</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-medium">Nicio reclamație găsită</p>
              {(filterStatus || filterUrgenta || search) && (
                <button
                  onClick={() => { setFilterStatus(''); setFilterUrgenta(''); setSearch(''); }}
                  className="mt-3 text-xs text-rose-500 hover:underline"
                >
                  Șterge filtrele
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                      onClick={() => toggleSort('numar')}
                    >
                      Număr<SortIcon k="numar" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Client
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                      onClick={() => toggleSort('status')}
                    >
                      Status<SortIcon k="status" />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                      onClick={() => toggleSort('urgenta')}
                    >
                      Urgență<SortIcon k="urgenta" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Atribuit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Etichete
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
                      onClick={() => toggleSort('date')}
                    >
                      Data<SortIcon k="date" />
                    </th>
                    <th className="px-4 py-3 w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50 transition cursor-pointer group ${URGENTA_ROW[r.urgenta]}`}
                      onClick={() => router.push(`/reclamatii/${r.id}`)}
                    >
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {r.numar}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-slate-900">{r.numeClient}</p>
                        <p className="text-xs text-slate-400">{r.emailClient}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${URGENTA_COLORS[r.urgenta]}`}>
                          {URGENTA_LABELS[r.urgenta]}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {r.assignedToNume || <span className="text-slate-300 italic text-xs">Neatribuit</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.etichete?.map((eid) => etichetaMap[eid] && (
                            <TagBadge key={eid} eticheta={etichetaMap[eid]} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-mono">
                        {r.createdAt?.toDate
                          ? new Date(r.createdAt.toDate()).toLocaleDateString('ro-RO')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <svg className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Create modal ─────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Reclamație nouă</h2>
                <p className="text-xs text-slate-500">Completați detaliile reclamației</p>
              </div>
              <button
                onClick={() => { setShowCreate(false); setError(''); setForm(INITIAL_FORM); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nume client <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.numeClient}
                    onChange={(e) => setForm((f) => ({ ...f, numeClient: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email client <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.emailClient}
                    onChange={(e) => setForm((f) => ({ ...f, emailClient: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Descriere problemă <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.descriere}
                  onChange={(e) => setForm((f) => ({ ...f, descriere: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 resize-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Informații suplimentare</label>
                <textarea
                  rows={2}
                  value={form.informatiiExtra}
                  onChange={(e) => setForm((f) => ({ ...f, informatiiExtra: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 resize-none outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Urgență</label>
                  <select
                    value={form.urgenta}
                    onChange={(e) => setForm((f) => ({ ...f, urgenta: e.target.value as UrgentaNivel }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white outline-none"
                  >
                    {(Object.entries(URGENTA_LABELS) as [UrgentaNivel, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Etichete</label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !form.etichete.includes(val)) setForm((f) => ({ ...f, etichete: [...f.etichete, val] }));
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white outline-none"
                  >
                    <option value="">+ Adaugă etichetă</option>
                    {etichete.filter((e) => !form.etichete.includes(e.id!)).map((e) => (
                      <option key={e.id} value={e.id}>{e.nume}</option>
                    ))}
                  </select>
                  {form.etichete.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.etichete.map((eid) => etichetaMap[eid] && (
                        <TagBadge
                          key={eid}
                          eticheta={etichetaMap[eid]}
                          size="sm"
                          onRemove={() => setForm((f) => ({ ...f, etichete: f.etichete.filter((id) => id !== eid) }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setError(''); setForm(INITIAL_FORM); }}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Anulare
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg hover:from-rose-700 hover:to-rose-600 disabled:opacity-50 transition shadow-sm"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Se creează…
                    </span>
                  ) : 'Creare reclamație'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
