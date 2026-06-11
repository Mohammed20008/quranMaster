'use server';

import { getSurahQPCData } from '@/app/lib/qpc-server';
import { QPCVerseData } from '@/types/qpc';

export async function fetchSurahQPCData(surahNumber: number, layout: string = 'v1'): Promise<QPCVerseData[]> {
  try {
    return getSurahQPCData(surahNumber, layout);
  } catch (error) {
    console.error('Error fetching QPC data:', error);
    return [];
  }
}
