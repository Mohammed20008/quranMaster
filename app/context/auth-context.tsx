'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type UserRole = 'user' | 'admin' | 'teacher';

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
  isTeacher: boolean;
  teacherId: string | null;
  isAuthModalOpen: boolean;
  login: (userData: Omit<User, 'role'>) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  getLoginRedirectPath: (email: string) => string;
}

// Admin emails - In production, this should come from a database or environment variable
const ADMIN_EMAILS = [
  'mohammedabdalmenem1@gmail.com',
  'admin@quranmaster.com',
];

const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

const isTeacherEmail = (email: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const storedTeachers = localStorage.getItem('teachers');
    if (storedTeachers) {
      const teachers = JSON.parse(storedTeachers);
      return teachers.some((t: any) => t.email.toLowerCase() === email.toLowerCase());
    }
  } catch (e) {
    console.error('Error checking teacher status', e);
  }
  return false;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Get teacher ID by email
  const getTeacherIdByEmail = (email: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const storedTeachers = localStorage.getItem('teachers');
      if (storedTeachers) {
        const teachers = JSON.parse(storedTeachers);
        const teacher = teachers.find((t: any) => t.email.toLowerCase() === email.toLowerCase());
        return teacher?.id || null;
      }
    } catch (e) {
      console.error('Error getting teacher ID', e);
    }
    return null;
  };

  const getLoginRedirectPath = (email: string): string => {
    if (isAdminEmail(email)) return '/admin';
    
    // Check if teacher
    if (isTeacherEmail(email)) {
      const tId = getTeacherIdByEmail(email);
      return tId ? `/teachers/${tId}` : '/teacher/dashboard';
    }

    return '/dashboard'; // Default user dashboard
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const email = session.user.email || '';
      const role = isAdminEmail(email) ? 'admin' : (isTeacherEmail(email) ? 'teacher' : 'user');
      setUser({
        name: session.user.name || 'User',
        email: email,
        avatar: session.user.image || undefined,
        role,
      });
      if (role === 'teacher') {
        setTeacherId(getTeacherIdByEmail(email));
      }
    } else if (status === 'unauthenticated') {
      // Fallback to local storage for manual auth if not in NextAuth session
      const stored = localStorage.getItem('user_session');
      if (stored) {
         try {
           const parsedUser = JSON.parse(stored);
           // Ensure role is set correctly
           const role = isAdminEmail(parsedUser.email) ? 'admin' : (isTeacherEmail(parsedUser.email) ? 'teacher' : 'user');
           setUser({
             ...parsedUser,
             role,
           });
           if (role === 'teacher') {
             setTeacherId(getTeacherIdByEmail(parsedUser.email));
           }
         } catch (e) {
           console.error('Failed to parse user session', e);
         }
      }
    }
  }, [session, status]);


  


  const login = (userData: Omit<User, 'role'>) => {
    const userWithRole: User = {
      ...userData,
      role: isAdminEmail(userData.email) ? 'admin' : (isTeacherEmail(userData.email) ? 'teacher' : 'user'),
    };
    setUser(userWithRole);
    localStorage.setItem('user_session', JSON.stringify(userWithRole));
    setIsAuthModalOpen(false);

    // Smart Redirect
    if (userWithRole.role === 'teacher') {
      const tId = getTeacherIdByEmail(userWithRole.email);
      if (tId) {
        router.push(`/teachers/${tId}`);
      } else {
        router.push('/teacher/dashboard');
      }
    } else if (userWithRole.role === 'admin') {
       router.push('/admin');
    } else {
       // Optional: Redirect to standard dashboard or stay
       // router.push('/dashboard'); 
    }
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
        isTeacher: user?.role === 'teacher',
        teacherId,
        isAuthModalOpen,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        getLoginRedirectPath
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
