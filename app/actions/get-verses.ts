'use server';

import fs from 'fs';
import path from 'path';
import { QuranVerse } from '@/data/quran-verses';
import { surahs } from '@/data/surah-data';

export interface SurahDataPayload {
  verses: QuranVerse[];
  translations: Record<string, string>;
  transliterations: Record<string, string>;
}

export interface SearchResult {
  surahNum: number;
  verseNum: number;
  arabicText: string;
  englishText: string;
  key: string;
}

// Keep caches in memory on the server
let quranCache: any = null;
let translationCache: any = null;
let transliterationCache: any = null;

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

function loadTranslationData() {
  if (translationCache) return translationCache;
  const filePath = path.join(process.cwd(), 'data', 'translation', 'en-maarif-ul-quran-simple.json');
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Translation file not found: ${filePath}`);
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    translationCache = JSON.parse(content);
    return translationCache;
  } catch (e) {
    console.error('Failed to load translation JSON:', e);
    return {};
  }
}

function loadTransliterationData() {
  if (transliterationCache) return transliterationCache;
  const filePath = path.join(process.cwd(), 'data', 'translitration', 'syllables-transliteration.json');
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Transliteration file not found: ${filePath}`);
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    transliterationCache = JSON.parse(content);
    return transliterationCache;
  } catch (e) {
    console.error('Failed to load transliteration JSON:', e);
    return {};
  }
}

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Remove diacritics and Quranic marks
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Normalize Alifs (أ, إ, آ, ٱ -> ا)
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // Normalize Teh Marbuta to Heh (ة -> ه)
    .replace(/\u0629/g, '\u0647')
    // Normalize Alif Maksura to Yeh (ى -> ي)
    .replace(/\u0649/g, '\u064A')
    // Normalize multiple spaces to a single space
    .replace(/\s+/g, ' ')
    .trim();
}

function findSurahByName(name: string): number | null {
  if (!name) return null;
  
  const cleanName = name.toLowerCase()
    .replace(/^(al-)/i, '')
    .replace(/^(at-)/i, '')
    .replace(/^(an-)/i, '')
    .replace(/^(ar-)/i, '')
    .replace(/^(as-)/i, '')
    .replace(/^(ash-)/i, '')
    .replace(/^(az-)/i, '')
    .replace(/^(ad-)/i, '')
    .replace(/['’\s-]/g, '');
    
  const normalizedCleanName = normalizeArabic(cleanName);

  // 1. Exact transliteration match
  for (const s of surahs) {
    const sTrans = s.transliteration.toLowerCase()
      .replace(/^(al-)/i, '')
      .replace(/^(at-)/i, '')
      .replace(/^(an-)/i, '')
      .replace(/^(ar-)/i, '')
      .replace(/^(as-)/i, '')
      .replace(/^(ash-)/i, '')
      .replace(/^(az-)/i, '')
      .replace(/^(ad-)/i, '')
      .replace(/['’\s-]/g, '');

    if (sTrans === cleanName) {
      return s.number;
    }
  }

  // 2. Exact Arabic name match
  for (const s of surahs) {
    const sNameNorm = normalizeArabic(s.name);
    if (sNameNorm === normalizedCleanName) {
      return s.number;
    }
  }

  // 3. Fuzzy match
  for (const s of surahs) {
    const sTrans = s.transliteration.toLowerCase()
      .replace(/^(al-)/i, '')
      .replace(/^(at-)/i, '')
      .replace(/^(an-)/i, '')
      .replace(/^(ar-)/i, '')
      .replace(/^(as-)/i, '')
      .replace(/^(ash-)/i, '')
      .replace(/^(az-)/i, '')
      .replace(/^(ad-)/i, '')
      .replace(/['’\s-]/g, '');

    const sNameNorm = normalizeArabic(s.name);

    if (
      sTrans.includes(cleanName) ||
      s.transliteration.toLowerCase().includes(name.toLowerCase()) ||
      sNameNorm.includes(normalizedCleanName) ||
      s.translation.toLowerCase().includes(name.toLowerCase())
    ) {
      return s.number;
    }
  }

  return null;
}

export async function fetchSurahVerses(surahNumber: number): Promise<SurahDataPayload> {
  try {
    const quranData = loadQuranData();
    const translationData = loadTranslationData();
    const transliterationData = loadTransliterationData();

    const surahKey = surahNumber.toString();
    const verses = (quranData[surahKey] || []) as QuranVerse[];

    const translations: Record<string, string> = {};
    const transliterations: Record<string, string> = {};

    const prefix = `${surahNumber}:`;
    
    // Filter translation keys
    for (const key in translationData) {
      if (key.startsWith(prefix)) {
        translations[key] = translationData[key]?.t || '';
      }
    }

    // Filter transliteration keys
    for (const key in transliterationData) {
      if (key.startsWith(prefix)) {
        transliterations[key] = transliterationData[key] || '';
      }
    }

    return {
      verses,
      translations,
      transliterations,
    };
  } catch (error) {
    console.error(`Error fetching verses for surah ${surahNumber}:`, error);
    return {
      verses: [],
      translations: {},
      transliterations: {},
    };
  }
}

export async function fetchVerseById(surahNumber: number, verseNumber: number): Promise<QuranVerse | null> {
  try {
    const { verses } = await fetchSurahVerses(surahNumber);
    return verses.find(v => v.verse === verseNumber) || null;
  } catch (error) {
    console.error(`Error fetching verse ${surahNumber}:${verseNumber}:`, error);
    return null;
  }
}

export async function searchQuran(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const trimmedQuery = query.trim();

  try {
    const quranData = loadQuranData();
    const translationData = loadTranslationData();
    const results: SearchResult[] = [];
    
    // 1. Direct Reference Check (e.g., "2:255" or "2-255" or "2 255")
    const refMatch = trimmedQuery.match(/^(\d+)\s*[:\s-]\s*(\d+)$/);
    if (refMatch) {
      const surahNum = parseInt(refMatch[1], 10);
      const verseNum = parseInt(refMatch[2], 10);
      if (surahNum >= 1 && surahNum <= 114) {
        const verses = quranData[surahNum.toString()] || [];
        const verse = (verses as any[]).find((v) => v.verse === verseNum);
        if (verse) {
          const key = `${surahNum}:${verseNum}`;
          const translationEntry = translationData[key];
          const englishText = translationEntry?.t || '';
          return [{
            surahNum,
            verseNum,
            arabicText: verse.text,
            englishText,
            key,
          }];
        }
      }
    }

    // 2. Named Reference Check (e.g., "Fatihah 4" or "Al-Baqarah 255" or "الفاتحة 4")
    const nameRefMatch = trimmedQuery.match(/^([a-zA-Z'\s\u0600-\u06FF-]+)\s+(\d+)$/);
    if (nameRefMatch) {
      const namePart = nameRefMatch[1].trim();
      const verseNum = parseInt(nameRefMatch[2], 10);
      const surahNum = findSurahByName(namePart);
      if (surahNum) {
        const verses = quranData[surahNum.toString()] || [];
        const verse = (verses as any[]).find((v) => v.verse === verseNum);
        if (verse) {
          const key = `${surahNum}:${verseNum}`;
          const translationEntry = translationData[key];
          const englishText = translationEntry?.t || '';
          return [{
            surahNum,
            verseNum,
            arabicText: verse.text,
            englishText,
            key,
          }];
        }
      }
    }

    // 3. General Text Search (English translation and Arabic text)
    const queryLower = trimmedQuery.toLowerCase();
    const normalizedQuery = normalizeArabic(trimmedQuery);
    let matchCount = 0;

    for (const [, verses] of Object.entries(quranData)) {
      if (matchCount >= 50) break;
      for (const verse of verses as Array<{ chapter: number; verse: number; text: string }>) {
        if (matchCount >= 50) break;
        const key = `${verse.chapter}:${verse.verse}`;
        const translationEntry = translationData[key];
        const englishText = translationEntry?.t || '';
        
        const normalizedVerseText = normalizeArabic(verse.text);
        
        if (
          normalizedVerseText.includes(normalizedQuery) || 
          englishText.toLowerCase().includes(queryLower)
        ) {
          results.push({
            surahNum: verse.chapter,
            verseNum: verse.verse,
            arabicText: verse.text,
            englishText,
            key,
          });
          matchCount++;
        }
      }
    }
    return results;
  } catch (e) {
    console.error('Failed to search Quran:', e);
    return [];
  }
}
