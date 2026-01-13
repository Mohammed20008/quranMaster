'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { surahs } from '@/data/surah-data';
import styles from './page.module.css';

interface QuranResult {
  type: 'quran';
  surahNum: number;
  verseNum: number;
  arabicText: string;
  englishText: string;
  key: string;
}

interface HadithResult {
  type: 'hadith';
  bookName: string;
  hadithId: number;
  idInBook: number;
  arabicText: string;
  englishNarrator: string;
  englishText: string;
}

type SearchResult = QuranResult | HadithResult;

const HADITH_BOOKS = [
  { file: 'bukhari', nameEn: 'Sahih al-Bukhari', nameAr: 'صحيح البخاري' },
  { file: 'muslim', nameEn: 'Sahih Muslim', nameAr: 'صحيح مسلم' },
  { file: 'abudawud', nameEn: 'Sunan Abu Dawud', nameAr: 'سنن أبي داود' },
  { file: 'tirmidhi', nameEn: 'Jami` at-Tirmidhi', nameAr: 'جامع الترمذي' },
  { file: 'nasai', nameEn: 'Sunan an-Nasa\'i', nameAr: 'سنن النسائي' },
  { file: 'ibnmajah', nameEn: 'Sunan Ibn Majah', nameAr: 'سنن ابن ماجه' },
  { file: 'malik', nameEn: 'Muwatta Malik', nameAr: 'موطأ مالك' },
  { file: 'ahmed', nameEn: 'Musnad Ahmad', nameAr: 'مسند أحمد' },
  { file: 'darimi', nameEn: 'Sunan ad-Darimi', nameAr: 'سنن الدارمي' },
];

export default function SearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quran' | 'hadith'>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search Quran
  useEffect(() => {
    if (activeTab !== 'quran' || !searchQuery || searchQuery.length < 2) {
      if (activeTab === 'quran') setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [quranData, translationData] = await Promise.all([
          import('@/data/quran.json').then(m => m.default),
          import('@/data/translation/en-maarif-ul-quran-simple.json').then(m => m.default),
        ]);

        const quranResults: QuranResult[] = [];
        const queryLower = searchQuery.toLowerCase();
        let matchCount = 0;

        // Search Arabic Quran
        for (const [surahKey, verses] of Object.entries(quranData)) {
          if (matchCount >= 50) break;
          for (const verse of verses as Array<{ chapter: number; verse: number; text: string }>) {
            if (matchCount >= 50) break;
            const key = `${verse.chapter}:${verse.verse}`;
            const translationEntry = (translationData as Record<string, { t: string }>)[key];
            const englishText = translationEntry?.t || '';
            
            // Check if matches Arabic or English
            if (verse.text.includes(searchQuery) || englishText.toLowerCase().includes(queryLower)) {
              quranResults.push({
                type: 'quran',
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

        setResults(quranResults);
      } catch (error) {
        console.error('Quran search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Search Hadith
  useEffect(() => {
    if (activeTab !== 'hadith' || !searchQuery || searchQuery.length < 2) {
      if (activeTab === 'hadith') setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const hadithResults: HadithResult[] = [];
        const queryLower = searchQuery.toLowerCase();
        let matchCount = 0;

        // Search all hadith books
        for (const book of HADITH_BOOKS) {
          if (matchCount >= 50) break;

          try {
            const bookData = await import(`@/data/sunnah/by_book/the_9_books/${book.file}.json`).then(m => m.default);
            const hadiths = bookData.hadiths as Array<{
              id: number;
              idInBook: number;
              arabic: string;
              english: { narrator: string; text: string };
            }>;

            for (const hadith of hadiths) {
              if (matchCount >= 50) break;

              const matchesArabic = hadith.arabic.includes(searchQuery);
              const matchesEnglish = 
                hadith.english.narrator.toLowerCase().includes(queryLower) ||
                hadith.english.text.toLowerCase().includes(queryLower);

              if (matchesArabic || matchesEnglish) {
                hadithResults.push({
                  type: 'hadith',
                  bookName: book.nameEn,
                  hadithId: hadith.id,
                  idInBook: hadith.idInBook,
                  arabicText: hadith.arabic,
                  englishNarrator: hadith.english.narrator,
                  englishText: hadith.english.text,
                });
                matchCount++;
              }
            }
          } catch (error) {
            console.error(`Error searching ${book.file}:`, error);
          }
        }

        setResults(hadithResults);
      } catch (error) {
        console.error('Hadith search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const handleQuranResultClick = (result: QuranResult) => {
    router.push(`/?surah=${result.surahNum}#verse-${result.surahNum}-${result.verseNum}`);
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchHeader}>
        <h1>Advanced Search</h1>
        <p>Search the Quran and Hadith</p>
      </div>

      <div className={styles.searchTabs}>
        <button
          className={`${styles.tab} ${activeTab === 'quran' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('quran');
            setResults([]);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          Quran
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'hadith' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('hadith');
            setResults([]);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          Hadith
        </button>
      </div>

      <div className={styles.searchBox}>
        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          placeholder={activeTab === 'quran' ? 'Search verses in Arabic or English...' : 'Search hadiths in Arabic or English...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      <div className={styles.resultsContainer}>
        {isSearching ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className={styles.resultsList}>
            {results.map((result, index) =>
              result.type === 'quran' ? (
                <div
                  key={`${result.key}-${index}`}
                  className={`${styles.resultItem} ${styles.quranResult}`}
                  onClick={() => handleQuranResultClick(result)}
                >
                  <div className={styles.resultHeader}>
                    <span className={styles.resultRef}>
                      {surahs[result.surahNum - 1]?.transliteration} {result.key}
                    </span>
                  </div>
                  <p className={`${styles.arabicText} arabic-text`}>{result.arabicText}</p>
                  {result.englishText && <p className={styles.englishText}>{result.englishText}</p>}
                </div>
              ) : (
                <div key={`hadith-${result.hadithId}-${index}`} className={`${styles.resultItem} ${styles.hadithResult}`}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultRef}>
                      {result.bookName} #{result.idInBook}
                    </span>
                  </div>
                  <p className={`${styles.arabicText} arabic-text`}>{result.arabicText}</p>
                  <div className={styles.hadithEnglish}>
                    <p className={styles.narrator}>{result.englishNarrator}</p>
                    <p className={styles.englishText}>{result.englishText}</p>
                  </div>
                </div>
              )
            )}
          </div>
        ) : searchQuery.length >= 2 ? (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>No results found</h3>
            <p>Try different keywords or search terms</p>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h3>Start Searching</h3>
            <p>Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
