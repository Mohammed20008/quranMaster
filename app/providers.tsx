'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/auth-context';
import { UserDataProvider } from './context/user-data-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserDataProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </UserDataProvider>
    </SessionProvider>
  );
}
