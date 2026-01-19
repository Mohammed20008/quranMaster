'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { surahs } from '@/data/surah-data';
import { getVersesBySurah, QuranVerse } from '@/data/quran-verses';
import { ViewMode } from '../header/header';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './quran-reader.module.css';
import Toast from '../ui/toast';
import TafsirSheet from '../tafsir/tafsir-sheet';
import { fetchSurahQPCData } from '@/app/actions/get-qpc-data';
import QPCFontLoader from './qpc-font-loader';
import { QPCVerseData } from '@/types/qpc';
import translationData from '../../../data/translation/en-maarif-ul-quran-simple.json';
import transliterationData from '../../../data/translitration/syllables-transliteration.json';
import MutashabihatView from './mutashabihat-view';
import ShareModal from '../share/share-modal';
import { useAudio } from '@/app/context/audio-context';

interface QuranReaderProps {
  surahNumber: number;
  showTransliteration?: boolean;
  showTranslation?: boolean;
  viewMode?: ViewMode;
  bookmarkedVerses: Set<string>;
  onToggleBookmark: (verseId: string) => void;
  onNextSurah?: () => void;
  fontSize?: number;
  onPageChange?: (page: number) => void;
}


// Helper for collapsible sections
function CollapsibleSection({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={styles.collapsible}>
      <button 
        className={styles.collapsibleHeader} 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
      >
        <span>{title}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.collapsibleContent}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface VersePopupProps {
  verse: QuranVerse;
  verseId: string;
  isBookmarked: boolean;
  onCopy: (verse: QuranVerse) => void;
  onBookmark: (verseId: string) => void;
  onShare: (verse: QuranVerse) => void;
  onTafsir: (verseId: string) => void;
  onMutashabihat: (verseId: string) => void;
  onPlay: (verse: QuranVerse) => void;
}

function VersePopup({ 
  verse, 
  verseId, 
  isBookmarked,
  onCopy,
  onBookmark,
  onShare,
  onTafsir,
  onMutashabihat,
  onPlay
}: VersePopupProps) {
  return (
    <span className={styles.versePopup} onClick={(e) => e.stopPropagation()}>
      <button 
        className={styles.popupBtn}
        onClick={() => onCopy(verse)}
        title="Copy"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button 
        className={`${styles.popupBtn} ${isBookmarked ? styles.active : ''}`}
        onClick={() => onBookmark(verseId)}
        title="Bookmark"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <button 
        className={styles.popupBtn}
        onClick={() => onShare(verse)}
        title="Share"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>
      <button 
        className={styles.popupBtn}
        onClick={() => onPlay(verse)}
        title="Play Verse"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
      <button 
        className={styles.popupBtn}
        onClick={() => onTafsir(verseId)}
        title="Tafsir"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      </button>
      <button 
        className={styles.popupBtn}
        onClick={() => onMutashabihat(verseId)}
        title="Mutashabihat"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="15" y2="9"></line>
          <line x1="9" y1="13" x2="15" y2="13"></line>
          <line x1="9" y1="17" x2="13" y2="17"></line>
        </svg>
      </button>
    </span>
  );
}

export default function QuranReader({ 
  surahNumber, 
  showTransliteration = true, 
  showTranslation = true, 
  viewMode = 'verse',
  bookmarkedVerses,
  onToggleBookmark,
  onNextSurah,
  fontSize = 32,
  onPageChange
}: QuranReaderProps) {
  const { playVerse: playVerseAudio, state: audioState } = useAudio();
  
  const surah = surahs.find(s => s.number === surahNumber);
  const verses = getVersesBySurah(surahNumber);

  if (!surah) {
    return <div className={styles.error}>Surah not found</div>;
  }

  const [toast, setToast] = useState<string | null>(null);
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [revealedVerses, setRevealedVerses] = useState<Set<string>>(new Set());
  
  const [fontMode, setFontMode] = useState<'uthmanic' | 'qpc'>('uthmanic');
  const [qpcData, setQpcData] = useState<Record<string, QPCVerseData>>({});
  const [loadingQPC, setLoadingQPC] = useState(false);
  const [activeMutashabihatVerse, setActiveMutashabihatVerse] = useState<string | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());

  // Notify parent of current page
  useEffect(() => {
    if (visiblePages.size > 0 && onPageChange) {
      // Use the smallest page number in view as the "current" page
      const minPage = Math.min(...Array.from(visiblePages));
      onPageChange(minPage);
    }
  }, [visiblePages, onPageChange]);
  
  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareVerseData, setShareVerseData] = useState<{
    arabic: string;
    english: string;
    verseNumber: number;
    surahName?: string;
  } | null>(null);

  // QPC data loading
  useEffect(() => {
    if (fontMode === 'qpc') {
      setLoadingQPC(true);
      fetchSurahQPCData(surahNumber).then(data => {
         const map: Record<string, QPCVerseData> = {};
         data.forEach(d => {
             const [s, v] = d.id.split(':');
             map[`${s}-${v}`] = d;
         });
         setQpcData(map);
         setLoadingQPC(false);
         if (data.length > 0) {
           const firstPage = data[0]?.page;
           if (firstPage) setVisiblePages(new Set([firstPage]));
         }
      });
    } else {
      setQpcData({});
      setVisiblePages(new Set());
      setLoadedPages(new Set());
    }
  }, [fontMode, surahNumber]);

  // IntersectionObserver for lazy loading fonts
  useEffect(() => {
    if (fontMode !== 'qpc' || Object.keys(qpcData).length === 0) return;
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const verseId = entry.target.id.replace('verse-', '');
          const verseData = qpcData[verseId];
          if (verseData?.page) {
            setVisiblePages(prev => {
              if (prev.has(verseData.page)) return prev;
              const newSet = new Set(prev);
              newSet.add(verseData.page);
              return newSet;
            });
          }
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, { rootMargin: '200px 0px', threshold: 0.1 });
    const verseElements = document.querySelectorAll('[id^="verse-"]');
    verseElements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [fontMode, qpcData]);

  // Lazy loading fonts
  useEffect(() => {
    if (fontMode !== 'qpc') {
      setFontsLoaded(true);
      return;
    }
    const activePages = Array.from(visiblePages);
    if (activePages.length === 0) {
       setFontsLoaded(false); 
       return;
    }
    const pagesToLoad = activePages.filter(page => !loadedPages.has(page));
    if (pagesToLoad.length === 0) {
      setFontsLoaded(true);
      return;
    }
    const checkFonts = async () => {
       const promises = pagesToLoad.map(page => document.fonts.load(`16px "QPC_Page_${page}"`));
       try {
           await Promise.all(promises);
           setLoadedPages(prev => {
             const newSet = new Set(prev);
             pagesToLoad.forEach(p => newSet.add(p));
             return newSet;
           });
           setFontsLoaded(true);
       } catch (e) {
           console.error("Font loading error", e);
           setFontsLoaded(true);
       }
    };
    checkFonts();
  }, [visiblePages, fontMode, loadedPages]);

  // Scroll active verse into view
  useEffect(() => {
    console.log('Audio State Sync:', { 
      audioSurah: audioState.currentSurah, 
      audioVerse: audioState.currentVerse, 
      readerSurah: surahNumber 
    });

    if (audioState.currentSurah === surahNumber && audioState.currentVerse) {
        const verseId = `${surahNumber}-${audioState.currentVerse}`;
        const verseEl = document.getElementById(`verse-${verseId}`);
        if (verseEl) {
            console.log('Scrolling to verse:', verseId);
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            console.warn('Verse element not found for scrolling:', verseId);
        }
    }
  }, [audioState.currentSurah, audioState.currentVerse, surahNumber]);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    setRevealedVerses(new Set());
    setToast(!isTestMode ? 'Test Mode Enabled' : 'Test Mode Disabled');
  };

  const toggleVerseReveal = (verseId: string) => {
    const newRevealed = new Set(revealedVerses);
    if (newRevealed.has(verseId)) newRevealed.delete(verseId);
    else newRevealed.add(verseId);
    setRevealedVerses(newRevealed);
  };

  const handleBookmark = (verseId: string) => {
    const isBookmarked = bookmarkedVerses.has(verseId);
    onToggleBookmark(verseId);
    setToast(isBookmarked ? 'Bookmark removed' : 'Verse bookmarked');
  };

  const copyVerse = async (verse: QuranVerse) => {
    const text = `${verse.text}\n\n— Quran ${surahNumber}:${verse.verse}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast('Verse copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      setToast('Failed to copy');
    }
  };

  const playVerse = (verse: QuranVerse) => {
    setToast(`Playing verse ${verse.verse}...`);
  };

  const shareVerse = (verse: QuranVerse) => {
    const englishText = (translationData as any)[`${surahNumber}:${verse.verse}`]?.t || "";
    setShareVerseData({
      arabic: verse.text,
      english: englishText,
      verseNumber: verse.verse
    });
    setShareModalOpen(true);
  };

  // Only load fonts for visible pages
  const activePagesArray = Array.from(visiblePages);

  return (
    <div className={styles.reader}>
      <QPCFontLoader pages={activePagesArray} />
      
      {/* Share Modal */}
      {shareVerseData && (
        <ShareModal 
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title={`Share Surah ${surah.name} : ${shareVerseData.verseNumber}`}
          sourceTitle={`Surah ${surah.transliteration}`}
          arabicText={shareVerseData.arabic}
          englishText={shareVerseData.english}
          meta={{
            title: `Surah ${surah.transliteration} (${surahNumber}:${shareVerseData.verseNumber})`,
            subtitle: 'QuranMaster'
          }}
        />
      )}

      {/* Surah Header */}
      <div className={styles.surahHeader}>
        <div className={styles.surahHeaderContent}>
          <div className={styles.surahTitle}>
            <h1 className="arabic-heading">{surah.name}</h1>
            <div className={styles.surahSubtitle}>
              <span className={styles.surahTransliteration}>{surah.transliteration}</span>
              <span className={styles.separator}>•</span>
              <span className={styles.surahTranslation}>{surah.translation}</span>
            </div>
          </div>
          <div className={styles.surahMeta}>
            <div className={styles.metaItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>{surah.totalVerses} Verses</span>
            </div>
            <div className={styles.metaItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{surah.revelationType}</span>
            </div>
            {/* Test Mode Button */}
            <button 
              className={`${styles.testBtn} ${!isTestMode ? styles.pulsate : ''} ${isTestMode ? styles.active : ''}`}
              onClick={toggleTestMode}
              title={isTestMode ? "Exit Test Mode" : "Start Memorization Test"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
            <button
                className={`${styles.fontToggleBtn} ${fontMode === 'qpc' ? styles.active : ''}`}
                onClick={() => setFontMode(fontMode === 'uthmanic' ? 'qpc' : 'uthmanic')}
                title="Toggle Font"
            >
                {fontMode === 'qpc' ? 'QPC' : 'Hafs'}
            </button>
          </div>
        </div>

        {/* Bismillah (except for Surah 1 and 9) */}
        {surahNumber !== 1 && surahNumber !== 9 && (
          <div className={styles.bismillah}>
            <p className="arabic-text">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          </div>
        )}
      </div>

      {/* Verses */}
      <div className={styles.verses}>
        {verses.length > 0 ? (
          <>
            {/* Page View - Continuous Mushaf Style */}
            {(viewMode === 'page' || viewMode === 'spread') && (
              <div className={viewMode === 'spread' ? styles.spreadView : styles.pageView}>
                {viewMode === 'spread' ? (
                  (() => {
                    const pages: Record<number, QuranVerse[]> = {};
                    verses.forEach((v: QuranVerse) => {
                      const page = qpcData[`${surahNumber}-${v.verse}`]?.page || 0;
                      if (!pages[page]) pages[page] = [];
                      pages[page].push(v);
                    });
                    const pageNumbers = Object.keys(pages).map(Number).sort((a, b) => a - b);
                    const spreads: number[][] = [];
                    for (let i = 0; i < pageNumbers.length; i += 2) {
                      spreads.push([pageNumbers[i], pageNumbers[i+1]].filter(Boolean));
                    }

                    return spreads.map((spread, idx) => (
                      <div key={idx} className={styles.spreadContainer}>
                        <div className={styles.mushafBook}>
                          <div className={styles.spineShadow}></div>
                          {spread.map((pageNum, pIdx) => (
                            <div 
                              key={pageNum} 
                              className={`${styles.mushafPage} ${pIdx === 0 ? styles.rightPage : styles.leftPage}`}
                            >
                              <div className={styles.pageHeader}>
                                <span>Page {pageNum}</span>
                              </div>
                              <div className={styles.pageText}>
                                {pages[pageNum].map((verse: QuranVerse) => {
                                  const verseId = `${surahNumber}-${verse.verse}`;
                                  const isBlurred = isTestMode && !revealedVerses.has(verseId);
                                  return (
                                    <span 
                                      key={verseId}
                                      id={`verse-${verseId}`}
                                      className={`${styles.pageVerse} ${isBlurred ? styles.blurred : styles.revealed} ${
                                        audioState.currentSurah === surahNumber && audioState.currentVerse === verse.verse ? styles.playing : ''
                                      }`}
                                      onClick={() => isTestMode && toggleVerseReveal(verseId)}
                                    >
                                      <span 
                                        className={fontMode === 'qpc' ? `qpc-page-${qpcData[verseId]?.page || 0}` : "arabic-text"} 
                                        style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                                      >
                                        {fontMode === 'qpc' ? (
                                          (!qpcData[verseId] || loadingQPC || !fontsLoaded) ? (
                                            <span className={styles.skeletonText} style={{ 
                                              display: 'inline-block', 
                                              width: `${50 + (verse.verse % 3) * 30}px`, 
                                              height: '1.2em', 
                                              verticalAlign: 'middle',
                                              marginLeft: '4px'
                                            }}></span>
                                          ) : (
                                            qpcData[verseId].words.map((w: any) => (
                                                <span key={w.id} className={`qpc-word`}>{w.text}{' '}</span>
                                            ))
                                          )
                                        ) : (
                                            verse.text
                                        )}
                                      </span>
                                      {!isTestMode && (
  <VersePopup 
    verse={verse} 
    verseId={verseId} 
    isBookmarked={bookmarkedVerses.has(verseId)}
    onCopy={copyVerse}
    onBookmark={handleBookmark}
    onShare={shareVerse}
    onTafsir={setActiveTafsirVerse}
    onMutashabihat={setActiveMutashabihatVerse}
    onPlay={(v) => playVerseAudio(surahNumber, v.verse)}
  />
)}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                  <div className={styles.pageText}>
                    {verses.map((verse, index) => {
                      const verseId = `${surahNumber}-${verse.verse}`;
                      const isBlurred = isTestMode && !revealedVerses.has(verseId);
                      
                      return (
                        <Fragment key={verseId}>
                           {/* Page Break Indicator */}
                           {index > 0 && fontMode === 'qpc' && qpcData[verseId]?.page && qpcData[`${surahNumber}-${verses[index-1].verse}`]?.page && 
                            qpcData[verseId].page !== qpcData[`${surahNumber}-${verses[index-1].verse}`]?.page && (
                             <div className={styles.pageBreak}>
                               <span>Page {qpcData[verseId].page}</span>
                             </div>
                           )}
                        <span 
                          id={`verse-${verseId}`}
                          className={`${styles.pageVerse} ${isBlurred ? styles.blurred : styles.revealed} ${
                            audioState.currentSurah === surahNumber && audioState.currentVerse === verse.verse ? styles.playing : ''
                          }`}
                          onClick={() => isTestMode && toggleVerseReveal(verseId)}
                        >
                          <span 
                            className={fontMode === 'qpc' ? `qpc-page-${qpcData[verseId]?.page || 0}` : "arabic-text"} 
                            style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                          >
                            {fontMode === 'qpc' ? (
                              (!qpcData[verseId] || loadingQPC || !fontsLoaded) ? (
                                <span className={styles.skeletonText} style={{ 
                                  display: 'inline-block', 
                                  width: `${50 + (verse.verse % 3) * 30}px`, 
                                  height: '1.2em', 
                                  verticalAlign: 'middle',
                                  marginLeft: '4px'
                                }}></span>
                              ) : (
                                qpcData[verseId].words.map(w => (
                                    <span key={w.id} className={`qpc-word`}>{w.text}{' '}</span>
                                ))
                              )
                            ) : (
                                verse.text
                            )}
                          </span>
                          
                          {/* Hover Popup Actions */}
                          {!isTestMode && (
  <VersePopup 
    verse={verse} 
    verseId={verseId} 
    isBookmarked={bookmarkedVerses.has(verseId)}
    onCopy={copyVerse}
    onBookmark={handleBookmark}
    onShare={shareVerse}
    onTafsir={setActiveTafsirVerse}
    onMutashabihat={setActiveMutashabihatVerse}
    onPlay={(v) => playVerseAudio(surahNumber, v.verse)}
  />
)}

                          {fontMode !== 'qpc' && (
                            <span className={styles.verseNumberInline}>
                              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Outer decorative circle */}
                                <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="18" cy="18" r="13" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                                <text x="18" y="23" textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                                  {verse.verse}
                                </text>
                              </svg>
                            </span>
                          )}
                        </span>
                        </Fragment>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Verse View - Card Based */}
            {viewMode === 'verse' && (
              <>
                {verses.map((verse) => {
                  const verseId = `${surahNumber}-${verse.verse}`;
                  const isBookmarked = bookmarkedVerses.has(verseId);
                  const isBlurred = isTestMode && !revealedVerses.has(verseId);

                  return (
                    <div 
                      key={verseId} 
                      id={`verse-${verseId}`}
                      className={`${styles.verseCard} ${isBlurred ? styles.blurredVerse : styles.revealedVerse} ${
                        audioState.currentSurah === surahNumber && audioState.currentVerse === verse.verse ? styles.playing : ''
                      }`}
                      onClick={() => isTestMode && toggleVerseReveal(verseId)}
                    >
                      {/* Verse Number Badge */}
                      {fontMode !== 'qpc' && (
                        <div className={styles.verseNumber}>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <path d="M20 3L25 15L38 15L28 23L32 36L20 28L8 36L12 23L2 15L15 15L20 3Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1.5"/>
                            <text x="20" y="25" textAnchor="middle" fontSize="14" fontWeight="600" fill="currentColor">
                              {verse.verse}
                            </text>
                          </svg>
                        </div>
                      )}

                      {/* Arabic Text */}
                      <div className={styles.arabicText}>
                        {fontMode === 'qpc' && (loadingQPC || !qpcData[verseId] || !fontsLoaded) ? (
                           <div className={styles.skeletonVerse}>
                             <div className={styles.skeletonLine} style={{ width: '95%' }}></div>
                             <div className={styles.skeletonLine} style={{ width: '80%' }}></div>
                             <div className={styles.skeletonLine} style={{ width: '70%' }}></div>
                           </div>
                        ) : (
                          <p 
                            className={fontMode === 'qpc' ? `qpc-page-${qpcData[verseId]?.page || 0}` : "arabic-text"}
                            style={{ 
                              fontSize: `${fontSize}px`, 
                              lineHeight: '2',
                              marginBottom: '0',
                              textAlign: 'right',
                              direction: 'rtl'
                            }}
                          >
                            {fontMode === 'qpc' && qpcData[verseId] ? (
                                qpcData[verseId].words.map((w: any) => (
                                    <span key={w.id}>{w.text}{' '}</span>
                                ))
                            ) : (
                                verse.text
                            )}
                          </p>
                        )}
                      </div>

                      {/* Translation and Transliteration */}
                      <div className={styles.verseTranslations}>
                        {(transliterationData as any)[`${surahNumber}:${verse.verse}`] && (
                          <CollapsibleSection title="Transliteration">
                            <div className={styles.transliteration}>
                              <p>{(transliterationData as any)[`${surahNumber}:${verse.verse}`]}</p>
                            </div>
                          </CollapsibleSection>
                        )}
                        
                        {(translationData as any)[`${surahNumber}:${verse.verse}`]?.t && (
                          <CollapsibleSection title="Translation">
                            <div className={styles.translation}>
                              <p>{(translationData as any)[`${surahNumber}:${verse.verse}`]?.t}</p>
                            </div>
                          </CollapsibleSection>
                        )}
                      </div>

                      {/* Verse Actions - Hide actions when blurred to prevent cheating/accidental clicks */}
                      <div className={styles.verseActions} style={{ opacity: isBlurred ? 0 : 1, pointerEvents: isBlurred ? 'none' : 'auto' }}>
                        <button
                          className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarked : ''}`}
                          onClick={(e) => { e.stopPropagation(); handleBookmark(verseId); }}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this verse'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </button>

                        <button
                          className={styles.actionBtn}
                          onClick={(e) => { e.stopPropagation(); copyVerse(verse); }}
                          aria-label="Copy verse"
                          title="Copy verse"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>

                        <button
                          className={styles.actionBtn}
                          onClick={(e) => { e.stopPropagation(); playVerseAudio(surahNumber, verse.verse); }}
                          aria-label="Play audio"
                          title="Play verse audio"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </button>

                        <button
                          className={styles.actionBtn}
                          onClick={(e) => { e.stopPropagation(); setActiveMutashabihatVerse(verseId); }}
                          aria-label="Mutashabihat"
                          title="Similar Verses (Mutashabihat)"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                              <line x1="9" y1="9" x2="15" y2="9"></line>
                              <line x1="9" y1="13" x2="15" y2="13"></line>
                              <line x1="9" y1="17" x2="13" y2="17"></line>
                          </svg>
                        </button>

                        <button
                          className={styles.actionBtn}
                          onClick={(e) => { e.stopPropagation(); setActiveTafsirVerse(verseId); }}
                          aria-label="Read Tafsir"
                          title="Read Tafsir"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                        </button>

                        <button
                          className={styles.actionBtn}
                          onClick={(e) => { e.stopPropagation(); shareVerse(verse); }}
                          aria-label="Share verse"
                          title="Share verse"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Next Surah Button */}
            {onNextSurah && surahNumber < 114 && (
              <div className={styles.nextSurahContainer}>
                <button 
                  className={styles.nextSurahBtn}
                  onClick={onNextSurah}
                  title="Go to next Surah"
                >
                  <div className={`${styles.arrowIcon} ${styles.pulsate}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                  </div>
                  <span>Next Surah</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noVerses}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h3>No Verses Found</h3>
            <p>This Surah doesn't have any verses in the database.</p>
          </div>
        )}
      </div>

      {/* Reusable Toast Notification */}
      <Toast 
        message={toast} 
        onClose={() => setToast(null)} 
      />

      {/* Tafsir Sheet */}
      <TafsirSheet 
        verseKey={activeTafsirVerse} 
        onClose={() => setActiveTafsirVerse(null)} 
      />

      {activeMutashabihatVerse && (
        <MutashabihatView 
            verseKey={activeMutashabihatVerse} 
            onClose={() => setActiveMutashabihatVerse(null)} 
            verseWords={qpcData[activeMutashabihatVerse]?.words}
            versePage={qpcData[activeMutashabihatVerse]?.page}
        />
      )}
    </div>
  );
}
