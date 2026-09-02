/**
 * High-performance persistent client-side caching using IndexedDB.
 * Provides instant (<5ms) retrieval of Quran verses, page mappings, and QPC font layout data.
 */

const DB_NAME = "quranmaster-cache-v1";
const STORE_NAME = "keyval";

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available on server"));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  return dbPromise;
}

export async function getPersistentCache<T>(key: string): Promise<T | null> {
  if (typeof window === "undefined") return null;

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    // Fallback to localStorage for small items
    try {
      const item = localStorage.getItem(`qm_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}

export async function setPersistentCache<T>(key: string, value: T): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    try {
      localStorage.setItem(`qm_${key}`, JSON.stringify(value));
    } catch {
      // Storage quota or disabled
    }
  }
}
