import fs from 'fs';
import path from 'path';

// Cache in memory
let qpcData: Record<string, any> | null = null;
let pageMapping: Record<string, number> | null = null;

const DATA_DIR = path.join(process.cwd(), 'data/qpc_data');

function getQPCData() {
  if (!qpcData) {
    // The file seems to be nested based on previous exploration
    const filePath = path.join(DATA_DIR, 'qpc-v1-glyph-codes-wbw.json', 'qpc-v1-glyph-codes-wbw.json');
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      qpcData = JSON.parse(fileContent);
    } catch (e) {
      console.error('Failed to load QPC data:', e);
      return {};
    }
  }
  return qpcData;
}

function getPageMapping() {
  if (!pageMapping) {
    const filePath = path.join(DATA_DIR, 'quran-page-mapping.json');
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      pageMapping = JSON.parse(fileContent);
    } catch (e) {
      console.error('Failed to load page mapping:', e);
      return {};
    }
  }
  return pageMapping;
}

export function getPageForVerse(surah: number, verse: number): number {
  const mapping = getPageMapping();
  return mapping?.[`${surah}:${verse}`] || 0;
}

import { QPCVerseData } from '@/types/qpc';

export type { QPCVerseData };

export function getSurahQPCData(surahNumber: number): QPCVerseData[] {
  const allData = getQPCData();
  if (!allData) return [];

  const mapping = getPageMapping();
  const result: Record<string, QPCVerseData> = {};

  // Iterating all keys might be slow if we do it every time. 
  // But keys are sorted? No guarantee.
  // Ideally we optimized this structure on server start, but for now filtering is O(N) where N=77k words. fast enough.
  
  const prefix = `${surahNumber}:`;
  
  // Optimization: use keys starting with prefix
  // Object.keys order is not guaranteed but usually insertion order.
  
  for (const key in allData) {
    if (key.startsWith(prefix)) {
      const item = allData[key];
      // item: { id, surah, ayah, word, location, text }
      
      const verseKey = `${item.surah}:${item.ayah}`;
      const verseId = `${item.surah}:${item.ayah}`;
      
      if (!result[verseId]) {
        result[verseId] = {
          id: verseId,
          page: mapping?.[verseKey] || 0,
          words: []
        };
      }
      
      result[verseId].words.push({
        word: parseInt(item.word),
        text: item.text,
        id: item.id
      });
    }
  }

  // Convert to array and sort words
  return Object.values(result).map(verse => {
    verse.words.sort((a, b) => a.word - b.word);
    return verse;
  });
}
