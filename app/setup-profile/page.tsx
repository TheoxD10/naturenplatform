'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/lib/userRoles';

export default function SetupProfilePage() {
  const { user, userRole, refreshUserRole } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true); setError('');
    try {
      await updateUserProfile(user.uid, name.trim());
      await refreshUserRole();
      if (userRole === 'admin' || userRole === 'superior') router.push('/management');
      else if (userRole === 'management') router.push('/management/analytics');
      else router.push('/management/raportari');
    } catch {
      setError('Eroare la salvarea profilului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
              <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Configurare profil</h2>
            <p className="text-sm text-slate-500 mt-1">Introduceți numele dvs. pentru a continua</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nume complet</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="Numele dvs."
              />
            </div>
            <button type="submit" disabled={loading || !name.trim()}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Se salvează...' : 'Continuă'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
