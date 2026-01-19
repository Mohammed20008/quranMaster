'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/auth-context';
import { UserDataProvider } from './context/user-data-context';
import { ArticleProvider } from './context/article-context';
import { MessagesProvider } from './context/messages-context';
import { TeacherProvider } from './context/teacher-context';
import { AudioProvider } from './context/audio-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UserDataProvider>
        <AudioProvider>
          <ArticleProvider>
            <AuthProvider>
              <MessagesProvider>
                <TeacherProvider>
                  {children}
                </TeacherProvider>
              </MessagesProvider>
            </AuthProvider>
          </ArticleProvider>
        </AudioProvider>
      </UserDataProvider>
    </SessionProvider>
  );
}
