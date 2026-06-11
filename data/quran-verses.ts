export interface QuranVerse {
  chapter: number;
  verse: number;
  text: string;
}

// Get all verses for a specific Surah
export async function getVersesBySurah(surahNumber: number): Promise<QuranVerse[]> {
  const quranData = (await import('@/data/quran.json')).default;
  const surahKey = surahNumber.toString();
  if (quranData[surahKey as keyof typeof quranData]) {
    return quranData[surahKey as keyof typeof quranData] as QuranVerse[];
  }
  return [];
}

// Get a specific verse
export async function getVerse(surahNumber: number, verseNumber: number): Promise<QuranVerse | null> {
  const verses = await getVersesBySurah(surahNumber);
  return verses.find(v => v.verse === verseNumber) || null;
}

// Get total verse count for a Surah (for verification)
export async function getTotalVerses(surahNumber: number): Promise<number> {
  const verses = await getVersesBySurah(surahNumber);
  return verses.length;
}

