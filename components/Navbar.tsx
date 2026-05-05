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
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (user) getUserData(user.uid).then(setUserData);
    else setUserData(null);
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const roleBadge: Record<string, string> = {
    admin:      'bg-purple-100 text-purple-700',
    superior:   'bg-green-100 text-green-700',
    management: 'bg-blue-100 text-blue-700',
    showroom:   'bg-orange-100 text-orange-700',
  };

  const isActive = (href: string) =>
    href === '/management'
      ? pathname === '/management'
      : pathname === href || pathname.startsWith(href + '/');

  const pill = (href: string) =>
    isActive(href)
      ? 'bg-indigo-50 text-indigo-700 font-semibold'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100';

  if (!user) return null;

  const navLinks = [
    ...(userRole === 'admin' || userRole === 'superior'
      ? [
          { href: '/management',           label: 'Acasă' },
          { href: '/management/raportari', label: 'Raportări' },
        ]
      : []),
    ...((userRole === 'admin' || userRole === 'superior' || userRole === 'management')
      ? [{ href: '/management/analytics', label: 'Analiză' }]
      : []),
    ...((userRole === 'admin' || userRole === 'superior')
      ? [
          { href: '/management/admin',    label: 'Dashboard' },
          { href: '/management/activity', label: 'Activitate' },
        ]
      : []),
    ...(userRole === 'admin' ? [{ href: '/signup', label: 'Creare Cont' }] : []),
    { href: '/management/tasks', label: 'Sarcini' },
  ];

  return (
    <>
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-sm group-hover:shadow-indigo-500/30 transition-shadow">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="font-bold text-slate-900 text-sm">Naturen</p>
                <p className="text-xs text-slate-400">Management</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${pill(href)}`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right: user menu + hamburger */}
            <div className="flex items-center gap-1 shrink-0">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-900 leading-tight">
                      {userData?.name || 'Utilizator'}
                    </p>
                    <p className={`text-xs px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block ${roleBadge[userRole || ''] || 'bg-slate-100 text-slate-700'}`}>
                      {userRole}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 text-xs font-bold text-white shrink-0">
                    {(userData?.name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-54 rounded-xl border border-slate-200 bg-white shadow-xl z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{userData?.name || 'Utilizator'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="py-1.5">
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Setări profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Deconectare
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-slate-100 transition"
                aria-label="Meniu"
              >
                {mobileOpen ? (
                  <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-30 bg-white border-b border-slate-200 shadow-lg animate-slide-down">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition ${pill(href)}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
