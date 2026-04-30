'use client';

import { useAuth } from '@/contexts/AuthContext';
import { getUserData, UserData } from '@/lib/userRoles';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, userRole, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) getUserData(user.uid).then(setUserData);
    else setUserData(null);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getRoleBadge = () => {
    const map: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      superior: 'bg-green-100 text-green-800',
      management: 'bg-blue-100 text-blue-800',
      showroom: 'bg-orange-100 text-orange-800',
    };
    return map[userRole || ''] || 'bg-slate-100 text-slate-700';
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition ${
        pathname === href
          ? 'text-indigo-600'
          : 'text-slate-600 hover:text-indigo-600'
      }`}
    >
      {label}
    </Link>
  );

  if (!user) return null;

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">Naturen</span>
                <p className="text-xs text-slate-400 leading-none">Management</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {(userRole === 'admin' || userRole === 'superior') && (
              <>
                {navLink('/management', 'Acasă')}
                {navLink('/management/raportari', 'Raportări')}
              </>
            )}
            {(userRole === 'admin' || userRole === 'superior' || userRole === 'management') && navLink('/management/analytics', 'Analiză')}
            {(userRole === 'admin' || userRole === 'superior') && (
              <>
                {navLink('/management/admin', 'Dashboard')}
                {navLink('/management/activity', 'Activitate')}
              </>
            )}
            {userRole === 'admin' && navLink('/signup', 'Creare Cont')}
          </nav>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{userData?.name || 'Utilizator'}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getRoleBadge()}`}>
                    {userRole}
                  </span>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-sm font-bold text-white">
                {(userData?.name || user.email || '?').charAt(0).toUpperCase()}
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{userData?.name || 'Utilizator'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                  >
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Setări profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Deconectare
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
