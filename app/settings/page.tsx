'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData, updateUserProfile } from '@/lib/userRoles';
import { updatePassword } from 'firebase/auth';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      getUserData(user.uid).then(data => { if (data?.name) setName(data.name); });
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Introduceți numele'); return; }
    if (newPassword && newPassword.length < 6) { setError('Parola trebuie să aibă cel puțin 6 caractere'); return; }
    if (newPassword !== confirmPassword) { setError('Parolele nu coincid'); return; }

    try {
      setError(''); setSuccess(''); setLoading(true);
      if (!user) { setError('Utilizator negăsit'); return; }
      if (newPassword) await updatePassword(user, newPassword);
      await updateUserProfile(user.uid, name);
      setSuccess('Profil actualizat cu succes');
      setNewPassword(''); setConfirmPassword('');
      setTimeout(() => router.push('/management'), 1500);
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/requires-recent-login') {
        setError('Din motive de securitate, deconectați-vă și autentificați-vă din nou pentru a schimba parola.');
      } else {
        setError('Eroare la actualizarea profilului: ' + error.message);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (!user) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Setări cont</h1>
          <p className="text-sm text-slate-500 mt-1">Gestionați informațiile și securitatea contului</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">Informații profil</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" disabled value={user.email || ''}
                    className="block w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-slate-500" />
                  <p className="mt-1 text-xs text-slate-400">Emailul nu poate fi modificat</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Nume complet</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="Numele dvs." />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">Schimbare parolă</h3>
              <p className="text-sm text-slate-500 mb-4">Lăsați câmpurile goale dacă nu doriți să schimbați parola.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parolă nouă</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="Minim 6 caractere" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmare parolă nouă</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="Confirmați parola nouă" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Se salvează...' : 'Salvare modificări'}
              </button>
              <button type="button" onClick={() => router.push('/management')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Anulează
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
