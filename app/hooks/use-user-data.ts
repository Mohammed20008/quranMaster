'use client';

// Re-export everything from context to avoid breaking imports
export { useUserData } from '../context/user-data-context';
export type { UserStats, LastRead, UserSettings, UserDataContextType } from '../context/user-data-context';
