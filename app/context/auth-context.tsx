'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

type UserRole = 'user' | 'admin';

interface User {
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  login: (userData: Omit<User, 'role'>) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

// Admin emails - In production, this should come from a database or environment variable
const ADMIN_EMAILS = [
  'mohammedabdalmenem1@gmail.com',
  'admin@quranmaster.com',
];

const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const email = session.user.email || '';
      setUser({
        name: session.user.name || 'User',
        email: email,
        avatar: session.user.image || undefined,
        role: isAdminEmail(email) ? 'admin' : 'user',
      });
    } else if (status === 'unauthenticated') {
      // Fallback to local storage for manual auth if not in NextAuth session
      const stored = localStorage.getItem('user_session');
      if (stored) {
         try {
           const parsedUser = JSON.parse(stored);
           // Ensure role is set correctly
           setUser({
             ...parsedUser,
             role: isAdminEmail(parsedUser.email) ? 'admin' : 'user',
           });
         } catch (e) {
           console.error('Failed to parse user session', e);
         }
      }
    }
  }, [session, status]);

  const login = (userData: Omit<User, 'role'>) => {
    const userWithRole: User = {
      ...userData,
      role: isAdminEmail(userData.email) ? 'admin' : 'user',
    };
    setUser(userWithRole);
    localStorage.setItem('user_session', JSON.stringify(userWithRole));
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('user_session');
    if (status === 'authenticated') {
      await signOut();
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isAuthModalOpen,
        login,
        logout,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
