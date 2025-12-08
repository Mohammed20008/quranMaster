export interface Surah {
  number: number;
  name: string; // Arabic name
  transliteration: string;
  translation: string; // English name
  totalVerses: number;
  revelationType: 'Meccan' | 'Medinan';
  juz: number[];
}

export interface Verse {
  number: number;
  surahNumber: number;
  text: string; // Arabic text
  transliteration?: string;
  translation: string; // English translation
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  verseNumber: number;
  timestamp: number;
  note?: string;
}

export interface ReadingProgress {
  lastReadSurah: number;
  lastReadVerse: number;
  completedSurahs: number[];
  timestamp: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showTransliteration: boolean;
  showTranslation: boolean;
  reciter: string;
  playbackSpeed: number;
}
