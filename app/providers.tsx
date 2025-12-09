'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/auth-context';
import { UserDataProvider } from './context/user-data-context';
import { ArticleProvider } from './context/article-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserDataProvider>
        <ArticleProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ArticleProvider>
      </UserDataProvider>
    </SessionProvider>
  );
}
