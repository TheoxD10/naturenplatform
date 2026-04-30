'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRole, setUserRole, UserRole } from '@/lib/userRoles';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserRole = async () => {
    if (user) setUserRoleState(await getUserRole(user.uid));
    else setUserRoleState(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) setUserRoleState(await getUserRole(u.uid));
      else setUserRoleState(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setUserRole(cred.user.uid, email, 'showroom', user?.uid);
    await refreshUserRole();
  };

  return (
    <AuthContext.Provider value={{
      user, userRole, loading, isAdmin: userRole === 'admin',
      signup,
      login: (email, password) => signInWithEmailAndPassword(auth, email, password).then(() => {}),
      logout: () => signOut(auth),
      refreshUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
