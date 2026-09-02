'use server';

import fs from 'fs/promises';
import path from 'path';

// Cache the local data in memory to avoid reading from disk on every fallback request
let arTafsirCache: Record<string, any> | null = null;
let enTafsirCache: Record<string, any> | null = null;

// Helper to find local tafsir for a verse or its group
const resolveLocalTafsir = (data: Record<string, any> | null, key: string) => {
  if (!data) return null;
  let item = data[key];
  // If the value is a string, it's a reference to another key (verse grouping)
  if (typeof item === 'string') {
    item = data[item];
  }
  return item;
};

async function getLocalTafsirFallback(verseKey: string, resourceId: number) {
  try {
    if (resourceId === 912) { // Tafsir As-Saadi (Arabic)
      if (!arTafsirCache) {
        const arPath = path.join(process.cwd(), 'data', 'tafsir', 'ar_tafsir', 'tafsir-as-saadi.json');
        const arContent = await fs.readFile(arPath, 'utf-8');
        arTafsirCache = JSON.parse(arContent);
      }
      return resolveLocalTafsir(arTafsirCache, verseKey);
    } else if (resourceId === 169) { // Tafsir Ibn Kathir (English)
      if (!enTafsirCache) {
        const enPath = path.join(process.cwd(), 'data', 'tafsir', 'en_tafsir', 'en-tafisr-ibn-kathir.json');
        const enContent = await fs.readFile(enPath, 'utf-8');
        enTafsirCache = JSON.parse(enContent);
      }
      return resolveLocalTafsir(enTafsirCache, verseKey);
    }
  } catch (e) {
    console.error(`Local fallback failed for resource ${resourceId}:`, e);
  }
  return null;
}

export interface QulTafsirItem {
  id?: number;
  resource_id: number;
  resource_name?: string;
  language_name?: string;
  text: string;
  verses?: string[];
}

export async function getTafsir(verseKey: string, resourceIds: number[] = [912, 169]): Promise<QulTafsirItem[]> {
  console.log(`[Tafsir] Requested verse key: "${verseKey}" for resources: ${resourceIds.join(', ')}`);
  
  if (!resourceIds || resourceIds.length === 0) {
    return [];
  }

  try {
    // 1. Attempt to fetch from QUL API
    // Format: https://qul.tarteel.ai/api/v1/tafsirs/for_ayah/:key?resource_ids=...
    const url = `https://qul.tarteel.ai/api/v1/tafsirs/for_ayah/${verseKey}?resource_ids=${resourceIds.join(',')}`;
    const response = await fetch(url, {
      next: { revalidate: 86400 } // cache for 24 hours in NextJS data cache
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.tafsirs) && data.tafsirs.length > 0) {
        console.log(`[Tafsir] Successfully loaded ${data.tafsirs.length} tafsirs from QUL API`);
        return data.tafsirs;
      }
    }
    console.warn(`[Tafsir] QUL API returned non-ok or empty. Falling back to local files.`);
  } catch (error) {
    console.error(`[Tafsir] Error calling QUL API:`, error);
  }

  // 2. Fallback to local files for 912 (As-Saadi) and 169 (Ibn Kathir)
  const results: QulTafsirItem[] = [];
  for (const id of resourceIds) {
    const localItem = await getLocalTafsirFallback(verseKey, id);
    if (localItem) {
      results.push({
        resource_id: id,
        resource_name: id === 912 ? 'Tafsir As-Saadi' : 'Tafsir Ibn Kathir',
        language_name: id === 912 ? 'arabic' : 'english',
        text: localItem.text
      });
    }
  }

  return results;
}

