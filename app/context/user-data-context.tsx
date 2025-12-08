'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserStats {
  streak: number;
  versesRead: number;
  lastReadDate: string | null;
  completion: number;
}

export interface LastRead {
  surah: number;
  verse: number;
  timestamp: number;
}

export interface UserSettings {
  fontSize: number;
  viewMode: 'verse' | 'page';
  showTranslation: boolean;
  showTransliteration: boolean;
  theme: 'light' | 'dark';
}

export interface UserDataContextType {
  bookmarks: Set<string>;
  lastRead: LastRead | null;
  stats: UserStats;
  settings: UserSettings;
  isLoading: boolean;
  toggleBookmark: (verseId: string) => void;
  updateLastRead: (surah: number, verse: number) => void;
  incrementVersesRead: (count?: number) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const DEFAULT_STATS: UserStats = {
  streak: 0,
  versesRead: 0,
  lastReadDate: null,
  completion: 0,
};

const DEFAULT_SETTINGS: UserSettings = {
  fontSize: 32,
  viewMode: 'verse',
  showTranslation: true,
  showTransliteration: true,
  theme: 'light',
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem('bookmarks');
      if (savedBookmarks) setBookmarks(new Set(JSON.parse(savedBookmarks)));

      const savedLastRead = localStorage.getItem('lastRead');
      if (savedLastRead) setLastRead(JSON.parse(savedLastRead));

      const savedStats = localStorage.getItem('userStats');
      if (savedStats) setStats(JSON.parse(savedStats));

      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      else {
          // Check system preference if no settings saved
          if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
              setSettings(prev => ({ ...prev, theme: 'dark' }));
          }
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply theme global effect
  useEffect(() => {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', settings.theme);
    }
  }, [settings.theme]);

  const toggleBookmark = (verseId: string) => {
    setBookmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(verseId)) {
        newSet.delete(verseId);
      } else {
        newSet.add(verseId);
      }
      localStorage.setItem('bookmarks', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const updateLastRead = (surah: number, verse: number) => {
    const newLastRead = { surah, verse, timestamp: Date.now() };
    setLastRead(newLastRead);
    localStorage.setItem('lastRead', JSON.stringify(newLastRead));
    updateStatsOnRead();
  };

  const updateStatsOnRead = () => {
    setStats(prev => {
      const today = new Date().toISOString().split('T')[0];
      const lastDate = prev.lastReadDate ? prev.lastReadDate.split('T')[0] : null;
      let newStreak = prev.streak;
      
      if (lastDate !== today) {
        if (lastDate) {
          const last = new Date(lastDate);
          const now = new Date(today);
          const diffTime = Math.abs(now.getTime() - last.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 1;
        } else {
          newStreak = 1;
        }
      }

      const newStats = {
        ...prev,
        streak: newStreak,
        lastReadDate: new Date().toISOString(),
      };
      
      localStorage.setItem('userStats', JSON.stringify(newStats));
      return newStats;
    });
  };
  
  const incrementVersesRead = (count: number = 1) => {
     setStats(prev => {
         const newStats = { ...prev, versesRead: prev.versesRead + count };
         localStorage.setItem('userStats', JSON.stringify(newStats));
         return newStats;
     });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('userSettings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserDataContext.Provider value={{
      bookmarks,
      lastRead,
      stats,
      settings,
      isLoading,
      toggleBookmark,
      updateLastRead,
      incrementVersesRead,
      updateSettings
    }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
