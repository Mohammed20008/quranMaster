'use server';

import { getSurahQPCData } from '@/app/lib/qpc-server';
import { QPCVerseData } from '@/types/qpc';

export async function fetchSurahQPCData(surahNumber: number): Promise<QPCVerseData[]> {
  try {
    return getSurahQPCData(surahNumber);
  } catch (error) {
    console.error('Error fetching QPC data:', error);
    return [];
  }
}
