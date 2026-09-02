import { QuranVerse } from "@/data/quran-verses";
import { QPCVerseData } from "@/types/qpc";

export type ViewMode = "verse" | "page";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface QuranReaderProps {
  surahNumber: number;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  viewMode?: ViewMode;
  bookmarkedVerses: Set<string>;
  onToggleBookmark: (verseId: string) => void;
  onNextSurah?: () => void;
  fontSize?: number;
  onPageChange?: (page: number) => void;
  onPageSurahsChange?: (data: {
    page: number;
    surahs: number[];
    startsSurahOnPage: number[];
  }) => void;
}

export interface VersePopupProps {
  verse: QuranVerse;
  verseId: string;
  isBookmarked: boolean;
  onCopy: (verse: QuranVerse) => void;
  onBookmark: (verseId: string) => void;
  onShare: (verse: QuranVerse) => void;
  onTafsir: (verseId: string) => void;
  onMutashabihat: (verseId: string) => void;
  onPlay: (verse: QuranVerse) => void;
  onToggleTranslation?: (verseId: string) => void;
}

// ─── Shared render props passed into view sub-components ─────────────────────

export interface SharedViewProps {
  surahNumber: number;
  qpcData: Record<string, QPCVerseData>;
  loadingQPC: boolean;
  fontsLoaded: boolean;
  isTestMode: boolean;
  revealedVerses: Set<string>;
  bookmarkedVerses: Set<string>;
  fontMode: string;
  mushafLayout: "v1" | "v4";
  displayFontSize: number;
  displayLineHeight: number;
  juzData: any;
  pageMapping: Record<string, number>;
  translations: Record<string, string>;
  transliterations: Record<string, string>;
  audioCurrentSurah: number | null;
  audioCurrentVerse: number | null;
  audioIsPlaying: boolean;
  toggleVerseReveal: (verseId: string) => void;
  copyVerse: (verse: QuranVerse) => void;
  handleBookmark: (verseId: string) => void;
  shareVerse: (verse: QuranVerse) => void;
  setActiveTafsirVerse: (id: string) => void;
  setActiveMutashabihatVerse: (id: string) => void;
  playVerseAudio: (surah: number, verse: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ORDINAL_WORDS = [
  "Zero",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
  "Thirteenth",
  "Fourteenth",
  "Fifteenth",
  "Sixteenth",
  "Seventeenth",
  "Eighteenth",
  "Nineteenth",
  "Twentieth",
  "Twenty-First",
  "Twenty-Second",
  "Twenty-Third",
  "Twenty-Fourth",
  "Twenty-Fifth",
  "Twenty-Sixth",
  "Twenty-Seventh",
  "Twenty-Eighth",
  "Twenty-Ninth",
  "Thirtieth",
];

export const RUB_POSITIONS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
];
