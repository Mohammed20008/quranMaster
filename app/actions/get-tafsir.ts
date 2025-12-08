'use server';

import fs from 'fs/promises';
import path from 'path';

// Cache the data in memory to avoid reading from disk on every request
// We use a global variable to persist across hot reloads in dev if possible, 
// though strictly in serverless completely separate invocations might reset this.
// For a long-running process (like `next start`), this works well.
let arTafsirCache: Record<string, any> | null = null;
let enTafsirCache: Record<string, any> | null = null;

export async function getTafsir(verseKey: string) {
  console.log(`[Tafsir] Requested verse key: "${verseKey}"`);
  
  try {
    // Load Arabic Tafsir (As-Saadi)
    if (!arTafsirCache) {
      const arPath = path.join(process.cwd(), 'data', 'tafsir', 'ar_tafsir', 'tafsir-as-saadi.json');
      console.log(`[Tafsir] Loading Arabic tafsir from: ${arPath}`);
      try {
        const arContent = await fs.readFile(arPath, 'utf-8');
        arTafsirCache = JSON.parse(arContent);
        console.log(`[Tafsir] Arabic tafsir loaded. Sample keys:`, arTafsirCache ? Object.keys(arTafsirCache).slice(0, 5) : []);
      } catch (e) {
        console.error('Failed to load Arabic Tafsir:', e);
      }
    }

    // Load English Tafsir (Ibn Kathir)
    if (!enTafsirCache) {
      const enPath = path.join(process.cwd(), 'data', 'tafsir', 'en_tafsir', 'en-tafisr-ibn-kathir.json');
      console.log(`[Tafsir] Loading English tafsir from: ${enPath}`);
      try {
        const enContent = await fs.readFile(enPath, 'utf-8');
        enTafsirCache = JSON.parse(enContent);
        console.log(`[Tafsir] English tafsir loaded. Sample keys:`, enTafsirCache ? Object.keys(enTafsirCache).slice(0, 5) : []);
      } catch (e) {
         console.error('Failed to load English Tafsir:', e);
      }
    }

    // Helper to find tafsir for a verse or its group
    const resolveTafsir = (data: Record<string, any> | null, key: string) => {
        if (!data) return null;
        let item = data[key];
        // If the value is a string, it's a reference to another key (verse grouping)
        if (typeof item === 'string') {
            console.log(`[Tafsir] Key "${key}" is a reference to "${item}"`);
            item = data[item];
        }
        return item;
    };

    const arData = resolveTafsir(arTafsirCache, verseKey);
    const enData = resolveTafsir(enTafsirCache, verseKey);

    console.log(`[Tafsir] Found Arabic data:`, arData ? 'Yes' : 'No');
    console.log(`[Tafsir] Found English data:`, enData ? 'Yes' : 'No');

    return {
      ar: arData,
      en: enData
    };

  } catch (error) {
    console.error('Error in getTafsir:', error);
    return { ar: null, en: null };
  }
}
