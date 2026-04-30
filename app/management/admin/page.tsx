'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { UserRole, ShowroomLocation } from '@/lib/userRoles';
import Navbar from '@/components/Navbar';

interface UserRecord {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  showroomLocation?: ShowroomLocation;
  createdAt: any;
  createdBy?: string;
  firstLogin: boolean;
}

const roleBadge = (role: UserRole) => {
  const map: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800', superior: 'bg-green-100 text-green-800',
    management: 'bg-blue-100 text-blue-800', showroom: 'bg-orange-100 text-orange-800'
  };
  return map[role] || 'bg-slate-100 text-slate-700';
};

const roleLabel = (role: UserRole) => ({ admin: 'Admin', superior: 'Superior', management: 'Management', showroom: 'Showroom' }[role] || role);

export default function AdminPage() {
  const { user, isAdmin, userRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const canView = userRole === 'admin' || userRole === 'superior';

  useEffect(() => {
    if (!authLoading && (!user || !canView)) { router.push('/management'); return; }
    if (user && canView) loadUsers();
  }, [user, canView, authLoading, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserRecord[]);
    } catch (error) { console.error('Error loading users:', error); }
    finally { setLoading(false); }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard utilizatori</h1>
          <button onClick={() => router.push('/management')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
            Înapoi
          </button>
        </div>

        {isAdmin && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href="/signup"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-400 transition">
              Creare utilizator
            </Link>
            <Link href="/management/admin/email-config"
              className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:from-purple-500 hover:to-purple-400 transition">
              Email automat
            </Link>
            <Link href="/management/targets"
              className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/30 hover:from-green-500 hover:to-green-400 transition">
              Target-uri
            </Link>
            <button onClick={loadUsers}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
              Reîmprospătare
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Toți utilizatorii ({users.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {['Email', 'Nume', 'Rol', 'Locație', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500">Niciun utilizator găsit</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className={u.id === user.uid ? 'bg-purple-50' : ''}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {u.email}
                      {u.id === user.uid && <span className="ml-2 text-xs text-purple-600">(Tu)</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {u.name || <span className="italic text-slate-400">Nesetat</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(u.role)}`}>{roleLabel(u.role)}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {u.showroomLocation ? (
                        <span className="flex items-center gap-1">
                          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {u.showroomLocation}
                        </span>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {u.firstLogin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Configurare în așteptare
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Activ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
