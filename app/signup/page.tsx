'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { setUserRole, UserRole, ShowroomLocation, SHOWROOM_LOCATIONS, getUserData } from '@/lib/userRoles';
import Navbar from '@/components/Navbar';
import { logActivity } from '@/lib/activity';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('showroom');
  const [showroomLocation, setShowroomLocation] = useState<ShowroomLocation>('Sibiu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdUserEmail, setCreatedUserEmail] = useState('');
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) { setError('Parolele nu coincid'); return; }
    if (password.length < 6) { setError('Parola trebuie să aibă cel puțin 6 caractere'); return; }
    if (selectedRole === 'showroom' && !showroomLocation) { setError('Selectați locația showroom-ului'); return; }

    try {
      setError(''); setLoading(true);

      const secondaryApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }, 'Secondary');

      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);

      await setUserRole(
        userCredential.user.uid, email, selectedRole, user?.uid,
        selectedRole === 'showroom' ? showroomLocation : undefined
      );

      await signOut(secondaryAuth);

      if (user) {
        const currentUserData = await getUserData(user.uid);
        await logActivity(
          'user_created', user.uid, currentUserData?.name || user.email || 'Admin', user.email || '',
          `Cont creat: ${selectedRole} - ${email}${selectedRole === 'showroom' ? ` la ${showroomLocation}` : ''}`,
          { targetUserEmail: email, targetUserId: userCredential.user.uid, showroomLocation: selectedRole === 'showroom' ? showroomLocation : undefined }
        );
      }

      setCreatedUserEmail(email);
      setShowSuccessModal(true);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') setError('Există deja un cont cu acest email');
      else if (error.code === 'auth/invalid-email') setError('Adresă email invalidă');
      else if (error.code === 'auth/weak-password') setError('Parola este prea slabă');
      else setError('Eroare la crearea contului: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setEmail(''); setPassword(''); setConfirmPassword('');
    setSelectedRole('showroom'); setShowroomLocation('Sibiu');
    router.push('/management/admin');
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

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acces restricționat</h2>
          <p className="text-sm text-slate-600 mb-6">
            {!user ? 'Trebuie să fiți autentificat ca administrator.' : 'Doar administratorii pot crea conturi noi.'}
          </p>
          <button onClick={() => router.push('/management')}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">
            Înapoi la Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Creare cont utilizator</h2>

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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresă email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="utilizator@exemplu.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Rol utilizator</label>
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                <option value="superior">Superior</option>
                <option value="management">Management</option>
                <option value="showroom">Showroom</option>
              </select>
            </div>

            {selectedRole === 'showroom' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Locație showroom</label>
                <select value={showroomLocation} onChange={(e) => setShowroomLocation(e.target.value as ShowroomLocation)}
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
                  {SHOWROOM_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            )}

            <div className="border-t border-slate-200 pt-5">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Parolă temporară</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="Minim 6 caractere" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmare parolă</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="Confirmați parola" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Se creează...' : 'Creare cont'}
              </button>
              <button type="button" onClick={() => router.push('/management/admin')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                Anulează
              </button>
            </div>
          </form>
        </div>

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-center text-xl font-bold text-slate-900">Cont creat cu succes</h3>
              <p className="mb-6 text-center text-sm text-slate-600">
                Contul pentru <span className="font-semibold text-slate-900">{createdUserEmail}</span> a fost creat. Utilizatorul va fi rugat să își configureze profilul la prima autentificare.
              </p>
              <button onClick={handleModalClose}
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/30 hover:from-green-500 hover:to-green-400 transition">
                Înapoi la Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
