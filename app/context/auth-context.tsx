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
  updateUser: (updates: Partial<User>) => void;
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
  if (!email || !email.trim()) return false;
  try {
    const storedTeachers = localStorage.getItem('teachers');
    if (storedTeachers) {
      const teachers = JSON.parse(storedTeachers);
      return teachers.some((t: any) => t.email && t.email.toLowerCase() === email.toLowerCase());
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
      
      let name = session.user.name || 'User';
      let avatar = session.user.image || undefined;

      // If teacher, prefer teacher profile data
      if (role === 'teacher') {
        if (typeof window !== 'undefined') {
            try {
                const storedTeachers = JSON.parse(localStorage.getItem('teachers') || '[]');
                const teacherProfile = storedTeachers.find((t: any) => t.email.toLowerCase() === email.toLowerCase());
                if (teacherProfile) {
                    name = teacherProfile.name;
                    avatar = teacherProfile.photo;
                }
            } catch (e) { console.error(e); }
        }
      }

      setUser({
        name,
        email,
        avatar,
        role,
      });
      if (role === 'teacher') {
          setTeacherId(getTeacherIdByEmail(email));
        }

        // Add to global user registry for Admin
        try {
            const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
            const existingIndex = allUsers.findIndex((u: User) => u.email === email);
            const newUser = {
                name: session.user.name || 'User',
                email: email,
                avatar: session.user.image || undefined,
                role
            };
            
            if (existingIndex >= 0) {
                // Update existing? Optional. Let's start by ensuring existence.
                // Maybe update if login provides newer info?
                allUsers[existingIndex] = { ...allUsers[existingIndex], ...newUser };
            } else {
                allUsers.push(newUser);
            }
            localStorage.setItem('all_users', JSON.stringify(allUsers));
        } catch(e) { console.error('Registry update failed', e); }
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
    // 1. Clear state locally first
    setUser(null);
    setTeacherId(null);

    // 2. Clear all persistence immediately
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('user_session');
        window.localStorage.removeItem('next-auth.session-token'); // Just in case
        window.localStorage.removeItem('next-auth.callback-url');
        window.sessionStorage.clear();
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    
    // 3. Attempt NextAuth signout
    try {
      await signOut({ redirect: false, callbackUrl: '/' });
    } catch (e) {
      console.error('SignOut error:', e);
    }

    // 4. Force hard navigation/reload with a slight delay to ensure cookies are cleared
    if (typeof window !== 'undefined') {
      setTimeout(() => {
          window.location.replace('/');
      }, 100);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user_session', JSON.stringify(updatedUser));
    
    // Update registry
    try {
        const allUsers = JSON.parse(localStorage.getItem('all_users') || '[]');
        const index = allUsers.findIndex((u: User) => u.email === user.email);
        if (index >= 0) {
            allUsers[index] = { ...allUsers[index], ...updates };
            localStorage.setItem('all_users', JSON.stringify(allUsers));
        }
    } catch(e) {}

    // Sync with Teacher Profile if applicable
    if (user.role === 'teacher') {
        try {
            const tId = teacherId || getTeacherIdByEmail(user.email);
            if (tId) {
                const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
                const tIndex = teachers.findIndex((t: any) => t.id === tId);
                if (tIndex >= 0) {
                    if (updates.name) teachers[tIndex].name = updates.name;
                    if (updates.avatar) teachers[tIndex].photo = updates.avatar;
                    localStorage.setItem('teachers', JSON.stringify(teachers));
                }
            }
        } catch(e) { console.error('Teacher sync failed', e); }
    }
  };

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
        getLoginRedirectPath,
        updateUser
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
