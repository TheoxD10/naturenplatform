'use client';

import { useEffect, useState, useRef } from 'react';
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

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeReclamatii((data) => { setReclamatii(data); setLoading(false); });
    const unsub2 = subscribeEtichete(setEtichete);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const filtered = reclamatii.filter(r => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterUrgenta && r.urgenta !== filterUrgenta) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.numeClient.toLowerCase().includes(q) && !r.numar.toLowerCase().includes(q) && !r.emailClient.toLowerCase().includes(q)) return false;
    }
    return true;
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
      const userName = user.displayName || user.email || '';
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

  const etichetaMap = Object.fromEntries(etichete.map(e => [e.id!, e]));

  const counts: Record<ReclamatieStatus, number> = { noua: 0, in_lucru: 0, rezolvata: 0, inchisa: 0 };
  reclamatii.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <ReclamatiiNavbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reclamații</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestionarea reclamațiilor clienților</p>
          </div>
          <div className="flex gap-3">
            <Link href="/reclamatii/etichete"
              className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition">
              Etichete
            </Link>
            <button onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg hover:from-rose-700 hover:to-rose-600 shadow-sm transition">
              Reclamație nouă
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {(Object.entries(counts) as [ReclamatieStatus, number][]).map(([status, count]) => (
            <button key={status} onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
              className={`rounded-xl p-4 text-left border transition ${filterStatus === status ? 'ring-2 ring-rose-500' : ''} bg-white border-slate-200 shadow-sm hover:shadow`}>
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <div className={`mt-1 inline-flex px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <input type="text" placeholder="Caută după client, număr..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ReclamatieStatus | '')}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white">
            <option value="">Toate statusurile</option>
            {(Object.entries(STATUS_LABELS) as [ReclamatieStatus, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={filterUrgenta} onChange={e => setFilterUrgenta(e.target.value as UrgentaNivel | '')}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white">
            <option value="">Toate urgențele</option>
            {(Object.entries(URGENTA_LABELS) as [UrgentaNivel, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {(filterStatus || filterUrgenta || search) && (
            <button onClick={() => { setFilterStatus(''); setFilterUrgenta(''); setSearch(''); }}
              className="px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
              Resetare
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">{filtered.length} reclamații</h2>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <svg className="mx-auto h-10 w-10 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-400 text-sm">Nicio reclamație găsită</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Număr', 'Client', 'Status', 'Urgență', 'Atribuit', 'Etichete', 'Data', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => router.push(`/reclamatii/${r.id}`)}>
                      <td className="px-4 py-3 text-xs font-mono font-semibold text-slate-700 whitespace-nowrap">{r.numar}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{r.numeClient}</div>
                        <div className="text-xs text-slate-400">{r.emailClient}</div>
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
                        {r.assignedToNume || <span className="text-slate-300 italic">Neatribuit</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.etichete?.map(eid => etichetaMap[eid] && (
                            <TagBadge key={eid} eticheta={etichetaMap[eid]} size="sm" />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-mono">
                        {r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString('ro-RO') : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Reclamație nouă</h2>
              <button onClick={() => { setShowCreate(false); setError(''); setForm(INITIAL_FORM); }}
                className="p-1 rounded-lg hover:bg-slate-100 transition">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nume client <span className="text-red-500">*</span></label>
                  <input value={form.numeClient} onChange={e => setForm(f => ({ ...f, numeClient: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email client <span className="text-red-500">*</span></label>
                  <input type="email" value={form.emailClient} onChange={e => setForm(f => ({ ...f, emailClient: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descriere problemă <span className="text-red-500">*</span></label>
                <textarea rows={4} value={form.descriere} onChange={e => setForm(f => ({ ...f, descriere: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Informații suplimentare</label>
                <textarea rows={2} value={form.informatiiExtra} onChange={e => setForm(f => ({ ...f, informatiiExtra: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Urgență</label>
                  <select value={form.urgenta} onChange={e => setForm(f => ({ ...f, urgenta: e.target.value as UrgentaNivel }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white">
                    {(Object.entries(URGENTA_LABELS) as [UrgentaNivel, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Etichete</label>
                  <select onChange={e => {
                    const val = e.target.value;
                    if (val && !form.etichete.includes(val)) setForm(f => ({ ...f, etichete: [...f.etichete, val] }));
                    e.target.value = '';
                  }} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900 bg-white">
                    <option value="">+ Adaugă etichetă</option>
                    {etichete.filter(e => !form.etichete.includes(e.id!)).map(e => <option key={e.id} value={e.id}>{e.nume}</option>)}
                  </select>
                  {form.etichete.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {form.etichete.map(eid => etichetaMap[eid] && (
                        <TagBadge key={eid} eticheta={etichetaMap[eid]} size="sm"
                          onRemove={() => setForm(f => ({ ...f, etichete: f.etichete.filter(id => id !== eid) }))} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowCreate(false); setError(''); setForm(INITIAL_FORM); }} disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition">
                  Anulare
                </button>
                <button type="submit" disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 rounded-lg hover:from-rose-700 hover:to-rose-600 disabled:opacity-50 transition">
                  {submitting ? 'Se creează...' : 'Creare reclamație'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
