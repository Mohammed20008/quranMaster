'use server';

import fs from 'fs';
import path from 'path';
import { QuranVerse } from '@/data/quran-verses';

// Keep cache in memory on the server
let quranCache: any = null;

function loadQuranData() {
  if (quranCache) return quranCache;
  const filePath = path.join(process.cwd(), 'data', 'quran.json');
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Quran file not found: ${filePath}`);
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    quranCache = JSON.parse(content);
    return quranCache;
  } catch (e) {
    console.error('Failed to load Quran JSON:', e);
    return {};
  }
}

export async function fetchSurahVerses(surahNumber: number): Promise<QuranVerse[]> {
  try {
    const quranData = loadQuranData();
    const surahKey = surahNumber.toString();
    if (quranData[surahKey]) {
      return quranData[surahKey] as QuranVerse[];
    }
    return [];
  } catch (error) {
    console.error(`Error fetching verses for surah ${surahNumber}:`, error);
    return [];
  }
}

export async function fetchVerseById(surahNumber: number, verseNumber: number): Promise<QuranVerse | null> {
  try {
    const verses = await fetchSurahVerses(surahNumber);
    return verses.find(v => v.verse === verseNumber) || null;
  } catch (error) {
    console.error(`Error fetching verse ${surahNumber}:${verseNumber}:`, error);
    return null;
  }
}
