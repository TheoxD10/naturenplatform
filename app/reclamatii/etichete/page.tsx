'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ReclamatiiNavbar from '../components/ReclamatiiNavbar';
import { Eticheta, subscribeEtichete, createEticheta, updateEticheta, deleteEticheta, PRESET_COLORS } from '@/lib/etichete';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ConfirmModal from '../components/ConfirmModal';

export default function EtichetePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [etichete, setEtichete] = useState<Eticheta[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [creating, setCreating] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeEtichete(data => { setEtichete(data); setLoading(false); });
    return () => unsub();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName.trim()) { setError('Introduceți un nume'); return; }
    if (etichete.some(e => e.nume.toLowerCase() === newName.trim().toLowerCase())) {
      setError('O etichetă cu acest nume există deja');
      return;
    }
    setCreating(true); setError('');
    try {
      await createEticheta(newName.trim(), newColor, user.uid);
      setNewName(''); setNewColor('#3b82f6');
    } catch { setError('Eroare la creare'); }
    finally { setCreating(false); }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    setEditSaving(true);
    try {
      await updateEticheta(id, { nume: editName.trim(), culoare: editColor });
      setEditId(null);
    } finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true); setDeleteError('');
    try {
      const snap = await getDocs(query(collection(db, 'reclamatii'), where('etichete', 'array-contains', deleteId)));
      if (!snap.empty) {
        setDeleteError(`Această etichetă este folosită în ${snap.size} reclamații și nu poate fi ștearsă.`);
        setDeleteLoading(false);
        return;
      }
      await deleteEticheta(deleteId);
      setDeleteId(null);
    } catch { setDeleteError('Eroare la ștergere'); }
    finally { setDeleteLoading(false); }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ReclamatiiNavbar />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.push('/reclamatii')}
            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition">
            <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Etichete</h1>
            <p className="text-sm text-slate-500 mt-0.5">Gestionați etichetele pentru categorisirea reclamațiilor</p>
          </div>
        </div>

        {/* Create */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Etichetă nouă</h2>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nume</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Numele etichetei..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Culoare</label>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg border border-slate-300 flex-shrink-0"
                    style={{ backgroundColor: newColor }} />
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                    className="h-9 w-9 rounded border border-slate-300 cursor-pointer" />
                </div>
              </div>
              <button type="submit" disabled={creating || !newName.trim()}
                className="px-5 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition flex-shrink-0">
                {creating ? 'Se creează...' : 'Creare'}
              </button>
            </div>

            {/* Preset colors */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Culori predefinite</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setNewColor(c)}
                    className={`h-6 w-6 rounded-full border-2 transition ${newColor === c ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700">Etichete ({etichete.length})</h2>
          </div>

          {etichete.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">Nicio etichetă creată</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {etichete.map(e => (
                <div key={e.id} className="px-6 py-4 flex items-center gap-4">
                  {editId === e.id ? (
                    <div className="flex-1 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex-shrink-0" style={{ backgroundColor: editColor }} />
                      <input type="color" value={editColor} onChange={ev => setEditColor(ev.target.value)}
                        className="h-8 w-8 rounded border border-slate-300 cursor-pointer flex-shrink-0" />
                      <input value={editName} onChange={ev => setEditName(ev.target.value)} autoFocus
                        className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-900" />
                      <button onClick={() => handleEdit(e.id!)} disabled={editSaving}
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 transition">
                        {editSaving ? '...' : 'Salvare'}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                        Anulare
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-8 w-8 rounded-lg flex-shrink-0" style={{ backgroundColor: e.culoare }} />
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: `${e.culoare}20`, color: e.culoare, border: `1px solid ${e.culoare}50` }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.culoare }} />
                          {e.nume}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditId(e.id!); setEditName(e.nume); setEditColor(e.culoare); }}
                          className="p-2 rounded-lg hover:bg-slate-100 transition">
                          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => { setDeleteId(e.id!); setDeleteError(''); }}
                          className="p-2 rounded-lg hover:bg-red-50 transition">
                          <svg className="h-4 w-4 text-slate-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Ștergere etichetă</h3>
            {deleteError ? (
              <p className="text-sm text-red-700 mb-4">{deleteError}</p>
            ) : (
              <p className="text-sm text-slate-600 mb-6">Sigur doriți să ștergeți eticheta? Se va verifica dacă este folosită în reclamații.</p>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setDeleteId(null); setDeleteError(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                {deleteError ? 'Închide' : 'Anulare'}
              </button>
              {!deleteError && (
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                  {deleteLoading ? 'Se verifică...' : 'Ștergere'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
