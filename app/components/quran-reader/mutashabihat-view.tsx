
import React, { useMemo, useState, useEffect } from 'react';
import styles from './quran-reader.module.css';
import { surahs } from '../../../data/surah-data';
import phraseVersesRaw from '../../../data/Mutashabihat ul Quran.json/phrase_verses.json';
import phrasesRaw from '../../../data/Mutashabihat ul Quran.json/phrases.json';
import { fetchSurahQPCData } from '@/app/actions/get-qpc-data';
import { QPCVerseData } from '@/types/qpc';
import QPCFontLoader from './qpc-font-loader';

// Type definitions for the JSON data
type PhraseVerses = Record<string, number[]>;

interface PhraseSource {
  key: string;
  from: number;
  to: number;
}

interface PhraseData {
  surahs: number;
  ayahs: number;
  count: number;
  source: PhraseSource;
  ayah: Record<string, number[][]>; // key "surah:verse" -> array of [start, end] word indices
}

type Phrases = Record<string, PhraseData>;

// Handle potential default export differences in build environments
const phraseVerses = (phraseVersesRaw as any).default || phraseVersesRaw as PhraseVerses;
const phrases = (phrasesRaw as any).default || phrasesRaw as unknown as Phrases;

interface MutashabihatViewProps {
  verseKey: string; // e.g. "2-25"
  onClose: () => void;
  verseWords?: { id: number; text: string; page?: number; line?: number }[];
  versePage?: number; // Page number for the current verse
}

const MutashabihatView: React.FC<MutashabihatViewProps> = ({ verseKey, onClose, verseWords, versePage }) => {
  // Normalize verse key to match JSON format (surah:verse)
  const normalizedKey = verseKey.replace('-', ':');
  const phraseIds = phraseVerses[normalizedKey] || [];
  
  // State for QPC data
  const [qpcDataCache, setQpcDataCache] = useState<Record<string, QPCVerseData>>({});
  const [loadingSurahs, setLoadingSurahs] = useState<Set<number>>(new Set());
  
  const versePhrases = useMemo(() => {
    return phraseIds.map((id: any) => {
      const phraseData = phrases[String(id)];
      if (!phraseData) return null;

      // Get the word ranges for the current verse
      const currentRanges = phraseData.ayah[normalizedKey];
      
      // Extract arabic content with QPC font - ensure it always renders
      let arabicContent = null;
      if (verseWords && currentRanges && currentRanges.length > 0 && versePage) {
        const range = currentRanges[0];
        const start = range[0];
        const end = range[1];
        const words = verseWords.slice(Math.max(0, start - 1), end);
        
        if (words.length > 0) {
          arabicContent = (
              <div className={styles.phraseArabic} dir="rtl">
                  {words.map((w, i) => (
                      <span key={i} className={`qpc-page-${versePage}`} style={{ fontSize: '1.75rem', lineHeight: '2' }}>
                          {w.text}{' '}
                      </span>
                  ))}
              </div>
          );
        }
      }

      return {
        id,
        data: phraseData,
        arabicContent
      };
    }).filter((p: null) => p !== null);
  }, [verseKey, phraseIds, verseWords, normalizedKey, versePage]);

  // Get all unique pages for font loading
  const activePages = useMemo(() => {
    const pages = new Set<number>();
    
    // Add page from current verse
    if (versePage) {
      pages.add(versePage);
    }
    
    // Add pages from loaded verse previews
    Object.values(qpcDataCache).forEach(verse => {
      if (verse.page) pages.add(verse.page);
    });
    
    return Array.from(pages);
  }, [versePage, qpcDataCache]);

  // Load all verse data for occurrences immediately
  useEffect(() => {
    const loadAllVerses = async () => {
      const surahsToLoad = new Set<number>();
      
      // Collect all unique surahs from all phrases
      versePhrases.forEach((item: any) => {
        if (!item) return;
        const { data } = item;
        
        Object.keys(data.ayah).forEach(verseKey => {
          const [surahStr] = verseKey.split(':');
          const surahNum = parseInt(surahStr);
          
          // Only load if we don't have this surah's data yet
          if (!loadingSurahs.has(surahNum)) {
            const hasAllVerses = Object.keys(qpcDataCache).some(key => key.startsWith(`${surahNum}-`));
            if (!hasAllVerses) {
              surahsToLoad.add(surahNum);
            }
          }
        });
      });

      // Load all needed surahs
      for (const surahNum of Array.from(surahsToLoad)) {
        setLoadingSurahs(prev => new Set(prev).add(surahNum));
        
        try {
          const data = await fetchSurahQPCData(surahNum);
          setQpcDataCache(prev => {
            const newCache = { ...prev };
            data.forEach(d => {
              const [s, v] = d.id.split(':');
              newCache[`${s}-${v}`] = d;
            });
            return newCache;
          });
        } catch (error) {
          console.error(`Error loading QPC data for surah ${surahNum}:`, error);
        } finally {
          setLoadingSurahs(prev => {
            const newSet = new Set(prev);
            newSet.delete(surahNum);
            return newSet;
          });
        }
      }
    };

    if (versePhrases.length > 0) {
      loadAllVerses();
    }
  }, [versePhrases]);

  const getSurahName = (surahNum: number) => {
    const surah = surahs.find(s => s.number === surahNum);
    return surah ? surah.transliteration : `Surah ${surahNum}`;
  };

  const getVerseData = (verseKey: string) => {
    const [surahStr, verseStr] = verseKey.split(':');
    const cacheKey = `${surahStr}-${verseStr}`;
    return qpcDataCache[cacheKey];
  };

  if (phraseIds.length === 0) {
    return (
      <>
        <div className={styles.mutashabihatBackdrop} onClick={onClose}></div>
        <div className={styles.mutashabihatContainer}>
          <div className={styles.mutashabihatHeader}>
            <h3>Mutashabihat</h3>
            <button onClick={onClose} className={styles.closeButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className={styles.mutashabihatContent}>
            <p>No Mutashabihat found for this verse.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.mutashabihatBackdrop} onClick={onClose}></div>
      <div className={styles.mutashabihatContainer}>
        <QPCFontLoader pages={activePages} />
      
      <div className={styles.mutashabihatHeader}>
        <h3>Mutashabihat Matches ({phraseIds.length})</h3>
        <button onClick={onClose} className={styles.closeButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
      </div>
      
      <div className={styles.mutashabihatContent}>
        {versePhrases.map((item: { id: any; data: any; arabicContent: any; }) => {
            if (!item) return null;
            const { id, data, arabicContent } = item;
            
            // Sort occurrences
            const occurrences = Object.keys(data.ayah).sort((a, b) => {
                const [s1, v1] = a.split(':').map(Number);
                const [s2, v2] = b.split(':').map(Number);
                if (s1 !== s2) return s1 - s2;
                return v1 - v2;
            });

            return (
                <div key={id} className={styles.phraseCard}>
                    <div className={styles.phraseHeader}>
                        {arabicContent || <div className={styles.phraseArabic}>Phrase #{id}</div>}
                        <div className={styles.phraseStats}>
                            <span>{data.count} Occurrences</span>
                            <span>{data.surahs} Surahs</span>
                        </div>
                    </div>
                    
                    <div className={styles.occurrencesList}>
                        {occurrences.map(occKey => {
                            const [sNum, vNum] = occKey.split(':').map(Number);
                            const isCurrent = occKey === normalizedKey;
                            const verseData = getVerseData(occKey);
                            
                            return (
                                <div 
                                    key={occKey} 
                                    className={`${styles.occurrenceCard} ${isCurrent ? styles.currentOccurrence : ''}`}
                                >
                                    <div className={styles.occLocation}>
                                        {getSurahName(sNum)} {sNum}:{vNum}
                                    </div>
                                    
                                    {/* Full Verse Text */}
                                    {verseData ? (
                                      <div className={styles.verseText} dir="rtl">
                                        {verseData.words.map((w, i) => (
                                          <span 
                                            key={i} 
                                            className={`qpc-page-${verseData.page}`}
                                          >
                                            {w.text}{' '}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className={styles.verseLoading}>
                                        <div className={styles.skeletonText} style={{ height: '2em', width: '90%', marginBottom: '0.5em' }}></div>
                                        <div className={styles.skeletonText} style={{ height: '2em', width: '80%' }}></div>
                                      </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>
    </div>
    </>
  );
};

export default MutashabihatView;
