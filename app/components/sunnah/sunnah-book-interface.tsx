'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './sunnah-book.module.css';

interface Hadith {
  id: number | string;
  arabic: string;
  english: { text: string; narrator?: string };
  grade?: string;
  [key: string]: any;
}

interface ChapterInfo {
  id: number | string;
  arabic: string;
  english: string;
}

interface BookMeta {
  title: string;
  arabicTitle: string;
  author: string;
}

interface SunnahBookInterfaceProps {
  initialHadiths: Hadith[];
  totalCount: number;
  chapterList: ChapterInfo[];
  currentChapter: number | string;
  category: string;
  book: string;
  meta: BookMeta;
}

// Normalize Arabic text helper
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[\u0653-\u065F]/g, '')
    .trim();
}

export default function SunnahBookInterface({
  initialHadiths,
  totalCount,
  chapterList,
  currentChapter: initialChapterId,
  category,
  book,
  meta
}: SunnahBookInterfaceProps) {
  // State
  const [hadiths, setHadiths] = useState<Hadith[]>(initialHadiths);
  const [currentChapter, setCurrentChapter] = useState(initialChapterId);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter chapters for dropdown
  const filteredChapters = chapterList.filter(c => 
    c.english.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    c.arabic.includes(chapterSearch)
  );

  // Handle Chapter Change
  const handleChapterSelect = async (chapterId: number | string) => {
    setIsDropdownOpen(false);
    if (chapterId === currentChapter) return;
    
    setLoading(true);
    setCurrentChapter(chapterId);
    
    try {
      const res = await fetch(`/api/sunnah/${category}/${book}/${chapterId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.hadiths)) {
        setHadiths(data.hadiths);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // We'll search across all hadiths in this book using the API or loading the full JSON if possible
        // For performance, let's try to fetch the full book data client-side once, or use a search API endpoint
        // Since we don't have a specific search API for a book, we'll implement a client-side search 
        // by lazily loading the full book json. This might be heavy but accurate.
        
        const bookData = await import(`@/data/sunnah/by_book/${category}/${book}.json`);
        const allHadiths = (bookData.hadiths || bookData.default?.hadiths || []) as Hadith[];
        
        const normalizedQuery = normalizeArabic(searchQuery);
        const queryLower = searchQuery.toLowerCase();
        
        const results = allHadiths.filter(h => {
            const normArabic = normalizeArabic(h.arabic || '');
            const engText = (h.english?.text || '').toLowerCase();
            const narrator = (h.english?.narrator || '').toLowerCase();
            
            return normArabic.includes(normalizedQuery) || 
                   engText.includes(queryLower) || 
                   narrator.includes(queryLower);
        }).slice(0, 50); // Limit results
        
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, category, book]);

  // Find current chapter info
  const activeChapterInfo = chapterList.find(c => c.id === currentChapter);

  return (
    <div className={styles.container}>
      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className={styles.searchOverlay} onClick={() => setIsSearchOpen(false)}>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={styles.searchPanel}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.searchHeader}>
                <div className={styles.searchInputWrapper}>
                  <svg className={styles.panelSearchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search in this book..." 
                    className={styles.panelSearchInput}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <button className={styles.closeSearchBtn} onClick={() => setIsSearchOpen(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className={styles.searchResults}>
                {isSearching ? (
                  <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((hadith, idx) => (
                    <div 
                      key={hadith.id} 
                      className={styles.searchResultCard}
                      onClick={() => {
                        // Navigate to chapter if possible, or just show text
                        // For now we will populate the main view with this result or just handle selection
                        // To keep it simple, let's close search and set just this hadith in view if specific logic needed
                        // But better: load the chapter this hadith belongs to. 
                        // However we don't always know chapter ID easily from hadith object without lookup.
                        // Assuming hadith object has chapterId:
                        if (hadith.chapterId) {
                            handleChapterSelect(hadith.chapterId);
                            setIsSearchOpen(false);
                            // Scroll to hadith logic would go here
                        }
                      }}
                    >
                      <div className={styles.hadithMeta} style={{marginBottom: '8px', border: 'none', padding: 0}}>
                        <span className={styles.hadithNum}>#{hadith.idInBook || hadith.id}</span>
                      </div>
                      <p className={styles.arabicText} style={{fontSize: '1.2rem', marginBottom: '8px'}}>{hadith.arabic.substring(0, 100)}...</p>
                      <p className={styles.englishText} style={{fontSize: '0.9rem', marginBottom: '0'}}>{hadith.english.text.substring(0, 100)}...</p>
                    </div>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div style={{textAlign: 'center', color: 'var(--foreground-secondary)', padding: '2rem'}}>No matches found</div>
                ) : (
                  <div style={{textAlign: 'center', color: 'var(--foreground-secondary)', padding: '2rem'}}>Type to search...</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={styles.backgroundPattern}></div>

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navLeft}>
            <Link href="/" className={styles.navBtn} title="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </Link>
            
            <Link href="/sunnah" className={styles.navBtn} title="Back to Collections">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>

            <div className={styles.bookInfo}>
              <h1 className={styles.bookTitle}>{meta.title}</h1>
              <span className={styles.bookSubtitle}>{meta.arabicTitle}</span>
            </div>
          </div>

          <div className={styles.navRight}>
            {/* Chapter Dropdown */}
            <div className={styles.chapterDropdown} ref={dropdownRef}>
              <div 
                className={styles.dropdownTrigger}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <div className={styles.currentChapter}>
                   {activeChapterInfo ? `${activeChapterInfo.id}. ${activeChapterInfo.english}` : 'Select Chapter'}
                </div>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.chapterSearch}>
                     <input 
                       className={styles.chapterSearchInput}
                       placeholder="Filter chapters..."
                       value={chapterSearch}
                       onChange={e => setChapterSearch(e.target.value)}
                       onClick={e => e.stopPropagation()}
                     />
                  </div>
                  {filteredChapters.map(chapter => (
                    <button
                      key={chapter.id}
                      className={`${styles.dropdownItem} ${currentChapter === chapter.id ? styles.dropdownItemActive : ''}`}
                      onClick={() => handleChapterSelect(chapter.id)}
                    >
                      <span className={styles.dropdownItemEn}>{chapter.id}. {chapter.english}</span>
                      <span className={styles.dropdownItemAr}>{chapter.arabic}</span>
                    </button>
                  ))}
                  {filteredChapters.length === 0 && (
                     <div style={{padding: '12px', color: 'var(--foreground-secondary)', textAlign: 'center'}}>No chapters found</div>
                  )}
                </div>
              )}
            </div>

            <button 
              className={`${styles.navBtn} ${isSearchOpen ? styles.navBtnActive : ''}`}
              onClick={() => setIsSearchOpen(true)}
              title="Search Book"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {activeChapterInfo && (
          <div className={styles.chapterHeader}>
            <h2 className={styles.chapterTitle}>{activeChapterInfo.english}</h2>
            <div className={styles.chapterArabic}>{activeChapterInfo.arabic}</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.loadingContainer}
            >
              <div className={styles.spinner}></div>
            </motion.div>
          ) : (
             <motion.div
               key={currentChapter}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.3 }}
             >
                {hadiths.map((hadith, index) => (
                  <div key={hadith.id} className={styles.hadithCard}>
                    <div className={styles.hadithMeta}>
                       <div className={styles.hadithBadges}>
                         <span className={styles.hadithNum}>Hadith {hadith.idInBook || hadith.id}</span>
                         {hadith.grade && <span className={styles.hadithGrade}>{hadith.grade}</span>}
                       </div>
                       <div className={styles.hadithActions}>
                         <button 
                           className={styles.actionBtn} 
                           title="Copy"
                           onClick={() => {
                             navigator.clipboard.writeText(`${hadith.arabic}\n\n${hadith.english.text}`);
                           }}
                         >
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                             <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                           </svg>
                         </button>
                       </div>
                    </div>
                    
                    <p className={styles.arabicText}>{hadith.arabic}</p>
                    
                    {hadith.english.narrator && (
                      <div className={styles.narrator}>{hadith.english.narrator}</div>
                    )}
                    
                    <p className={styles.englishText}>{hadith.english.text}</p>
                  </div>
                ))}
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
