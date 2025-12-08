'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  login: (userData: User) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        name: session.user.name || 'User',
        email: session.user.email || '',
        avatar: session.user.image || undefined,
      });
    } else if (status === 'unauthenticated') {
      // Fallback to local storage for manual auth if not in NextAuth session
      const stored = localStorage.getItem('user_session');
      if (stored) {
         try {
           setUser(JSON.parse(stored));
         } catch (e) {
           console.error('Failed to parse user session', e);
         }
      }
    }
  }, [session, status]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user_session', JSON.stringify(userData));
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
