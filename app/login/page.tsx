'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserData } from '@/lib/userRoles';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        const userData = await getUserData(currentUser.uid);
        if (userData?.firstLogin) router.push('/setup-profile');
        else if (userData?.role === 'admin' || userData?.role === 'superior') router.push('/management');
        else if (userData?.role === 'management') router.push('/management/analytics');
        else router.push('/management/raportari');
      } else {
        router.push('/management');
      }
    } catch (err: any) {
      const code = err.code || '';
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        setError('Email sau parolă incorectă');
      } else {
        setError('Autentificare eșuată: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { setResetError('Introduceți adresa de email'); return; }
    setResetError(''); setResetLoading(true);
    try {
      await sendPasswordResetEmail(getAuth(), resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setResetError(err.code === 'auth/user-not-found' ? 'Nu există un cont cu acest email' : 'Eroare la trimiterea emailului');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-lg">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Naturen</h1>
          <p className="text-sm text-slate-500 mt-1">Management</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Autentificare</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="email@exemplu.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Parolă</label>
                <button type="button" onClick={() => setShowReset(true)} className="text-xs text-indigo-600 hover:text-indigo-500">
                  Parolă uitată?
                </button>
              </div>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="Parola ta"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Se autentifică...' : 'Autentificare'}
            </button>
          </form>
        </div>
      </div>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            {resetSuccess ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Email trimis</h3>
                <p className="text-sm text-slate-500 mb-6">Verificați inbox-ul pentru link-ul de resetare.</p>
                <button onClick={() => { setShowReset(false); setResetSuccess(false); setResetEmail(''); }}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">
                  Închide
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Resetare parolă</h3>
                <p className="text-sm text-slate-500 mb-6">Introduceți emailul pentru a primi link-ul de resetare.</p>
                <form onSubmit={handleReset} className="space-y-4">
                  {resetError && <p className="text-sm text-red-600">{resetError}</p>}
                  <input
                    type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="email@exemplu.com"
                  />
                  <div className="flex gap-3">
                    <button type="submit" disabled={resetLoading}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50">
                      {resetLoading ? 'Se trimite...' : 'Trimite'}
                    </button>
                    <button type="button" onClick={() => setShowReset(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                      Anulează
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
