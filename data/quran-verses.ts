import quranData from '@/data/quran.json';

export interface QuranVerse {
  chapter: number;
  verse: number;
  text: string;
}

// Get all verses for a specific Surah
export function getVersesBySurah(surahNumber: number): QuranVerse[] {
  const surahKey = surahNumber.toString();
  if (quranData[surahKey as keyof typeof quranData]) {
    return quranData[surahKey as keyof typeof quranData] as QuranVerse[];
  }
  return [];
}

// Get a specific verse
export function getVerse(surahNumber: number, verseNumber: number): QuranVerse | null {
  const verses = getVersesBySurah(surahNumber);
  return verses.find(v => v.verse === verseNumber) || null;
}

// Get total verse count for a Surah (for verification)
export function getTotalVerses(surahNumber: number): number {
  const verses = getVersesBySurah(surahNumber);
  return verses.length;
}
