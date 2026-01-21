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
import { fetchQuranMetadata } from '@/app/actions/get-metadata';
import QPCFontLoader from './qpc-font-loader';
import { QPCVerseData } from '@/types/qpc';
import quranData from '@/data/quran.json';
import translationData from '../../../data/translation/en-maarif-ul-quran-simple.json';
import transliterationData from '../../../data/translitration/syllables-transliteration.json';
import MutashabihatView from './mutashabihat-view';
import ShareModal from '../share/share-modal';
import { useAudio } from '@/app/context/audio-context';
import { useUserData } from '@/app/context/user-data-context';

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

// Outstanding Notification Component
function TransitionNotification({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  const isJuz = title.toLowerCase().includes('juz');
  const isHizb = title.toLowerCase().includes('hizb');

  return (
    <motion.div 
      initial={{ opacity: 0, y: -100, scale: 0.9 }}
      animate={{ opacity: 1, y: 30, scale: 1 }}
      exit={{ opacity: 0, y: -100, scale: 0.9 }}
      className={styles.outstandingNotification}
    >
      <div className={styles.notificationGlow}></div>
      <div className={styles.notificationContent}>
        <div className={`${styles.notificationIcon} ${isJuz ? styles.iconJuz : isHizb ? styles.iconHizb : styles.iconRub}`}>
          {isJuz ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          ) : isHizb ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          )}
        </div>
        <div className={styles.notificationText}>
          <h3>{title}</h3>
          <p>{message}</p>
        </div>
        <button onClick={onClose} className={styles.notificationClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </motion.div>
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

  // Target specific line counts for Mushaf modes
  const displayFontSize = viewMode === 'spread' ? fontSize * 0.581 : (viewMode === 'page' ? fontSize * 1.1 : fontSize);
  const displayLineHeight = viewMode === 'spread' ? 1.65 : (viewMode === 'page' ? 1.85 : 2.2);

  if (!surah) {
    return <div className={styles.error}>Surah not found</div>;
  }

  const [toast, setToast] = useState<string | null>(null);
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(null);
    
  const { settings, updateSettings } = useUserData();
  const fontMode = settings.fontMode;
  const isTestMode = settings.isTestMode;
  
  // Use a temporary local state for revealedVerses to keep it fast, but sync with settings if needed
  // For now, let's keep it simple and use local for session-only reveal
  const [revealedVerses, setRevealedVerses] = useState<Set<string>>(new Set());

  const [qpcData, setQpcData] = useState<Record<string, QPCVerseData>>({});
  const [loadingQPC, setLoadingQPC] = useState(false);
  const [activeMutashabihatVerse, setActiveMutashabihatVerse] = useState<string | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Metadata for transitions
  const [juzData, setJuzData] = useState<any>(null);
  const [hizbData, setHizbData] = useState<any>(null);
  const [rubData, setRubData] = useState<any>(null);

  const [outstandingNotification, setOutstandingNotification] = useState<{ title: string; message: string } | null>(null);
  const [lastNotificationKey, setLastNotificationKey] = useState<string | null>(null);

  useEffect(() => {
    fetchQuranMetadata('juz').then(setJuzData);
    fetchQuranMetadata('hizb').then(setHizbData);
    fetchQuranMetadata('rub').then(setRubData);
  }, []);

  // Transition Detection Logic
  useEffect(() => {
    if (!audioState.currentVerse || !audioState.currentSurah || !juzData || !hizbData || !rubData) return;

    const currentKey = `${audioState.currentSurah}:${audioState.currentVerse}`;
    
    // Check for Juz Start
    Object.values(juzData).forEach((j: any) => {
      if (j.first_verse_key === currentKey && lastNotificationKey !== `juz-${j.juz_number}`) {
        setOutstandingNotification({ 
          title: 'Al-Juz', 
          message: `Juz ${j.juz_number} starts here` 
        });
        setLastNotificationKey(`juz-${j.juz_number}`);
      }
    });

    // Check for Hizb Start
    Object.values(hizbData).forEach((h: any) => {
        if (h.first_verse_key === currentKey && lastNotificationKey !== `hizb-${h.hizb_number}`) {
          setOutstandingNotification({ 
            title: 'Al-Hizb', 
            message: `Hizb ${h.hizb_number} starts here` 
          });
          setLastNotificationKey(`hizb-${h.hizb_number}`);
        }
    });

    // Check for Rub Start
    Object.values(rubData).forEach((r: any) => {
        if (r.first_verse_key === currentKey && lastNotificationKey !== `rub-${r.rub_number}`) {
          setOutstandingNotification({ 
            title: 'Rub el Hizb', 
            message: `A new quarter started` 
          });
          setLastNotificationKey(`rub-${r.rub_number}`);
        }
    });
  }, [audioState.currentVerse, audioState.currentSurah, juzData, hizbData, rubData, lastNotificationKey]);

  // Auto-close notification
  useEffect(() => {
    if (outstandingNotification) {
      const timer = setTimeout(() => setOutstandingNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [outstandingNotification]);

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

  // QPC data loading (Needed for page structure even in Hafs mode)
  useEffect(() => {
    setLoadingQPC(true);
    // Fetch current and adjacent surahs for spread mode
    const surahsToLoad = viewMode === 'spread' 
      ? [surahNumber - 1, surahNumber, surahNumber + 1].filter(n => n >= 1 && n <= 114)
      : [surahNumber];

    Promise.all(surahsToLoad.map(n => fetchSurahQPCData(n))).then(results => {
       const map: Record<string, QPCVerseData> = {};
       results.forEach(surahData => {
          surahData.forEach(d => {
              const [s, v] = d.id.split(':');
              map[`${s}-${v}`] = d;
          });
       });
       setQpcData(map);
       setLoadingQPC(false);
       // Find initial visible page
       const initialData = results.find((rd, idx) => surahsToLoad[idx] === surahNumber);
       if (initialData && initialData.length > 0) {
          const firstPage = initialData[0]?.page;
          if (firstPage) setVisiblePages(new Set([firstPage]));
       }
    });
  }, [surahNumber, viewMode]);

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
    if (audioState.currentSurah === surahNumber && audioState.currentVerse) {
        const verseId = `${surahNumber}-${audioState.currentVerse}`;
        const verseEl = document.getElementById(`verse-${verseId}`);
        if (verseEl) {
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [audioState.currentSurah, audioState.currentVerse, surahNumber]);

  const toggleTestMode = () => {
    const newMode = !isTestMode;
    updateSettings({ isTestMode: newMode });
    setRevealedVerses(new Set());
    setToast(newMode ? 'Test Mode Enabled' : 'Test Mode Disabled');
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
      <AnimatePresence>
        {outstandingNotification && (
          <TransitionNotification 
            title={outstandingNotification.title}
            message={outstandingNotification.message}
            onClose={() => setOutstandingNotification(null)}
          />
        )}
      </AnimatePresence>

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
        
        {/* New Image-based Header Frame */}
        <div className={styles.surahFrameContainer}>
          <img 
            src="/surah-header.png" 
            alt="Surah Header" 
            className={styles.surahFrameImg}
          />
          <div className={styles.surahFrameContent}>
            <h1 className={styles.surahFrameTitle}>{surah.name}</h1>
          </div>
        </div>

        {/* Meta Info & Actions */}
        <div className={styles.surahMeta} style={{ marginTop: '0', marginBottom: '24px' }}>
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
        </div>



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
                    const pages: Record<number, any[]> = {};
                    
                    // Flatten all verses from quranData to allow cross-surah spreads
                    const allVerses = Object.keys(quranData).flatMap(sNum => 
                      (quranData[sNum as keyof typeof quranData] as any).map((v: any) => ({
                        ...v,
                        chapter: parseInt(sNum)
                      }))
                    );

                    // Find all pages that contain verses from the current surah
                    const currentSurahPages = new Set<number>();
                    verses.forEach((v: QuranVerse) => {
                      const page = qpcData[`${surahNumber}-${v.verse}`]?.page;
                      if (page) currentSurahPages.add(page);
                    });

                    // For each page in the current surah, find its partner in the spread
                    const activePages = new Set<number>();
                    currentSurahPages.forEach(p => {
                      if (p % 2 === 1) { // Odd page (Right)
                        activePages.add(p);
                        activePages.add(p + 1);
                      } else { // Even page (Left)
                        activePages.add(p - 1);
                        activePages.add(p);
                      }
                    });

                    // Populate pages with verses
                    activePages.forEach(p => {
                      pages[p] = allVerses.filter(v => {
                        const vKey = `${v.chapter}-${v.verse}`;
                        return qpcData[vKey]?.page === p;
                      });
                    });

                    const getPageInfo = (pNum: number) => {
                        const pageVerses = pages[pNum];
                        if (!pageVerses || pageVerses.length === 0) return { surahName: '', juzNumber: '' };
                        const firstV = pageVerses[0];
                        const sInfo = surahs.find(s => s.number === firstV.chapter);
                        let jNum = '';
                        if (juzData) {
                            const found = Object.values(juzData).find((j: any) => {
                                const mapping = j.verse_mapping[firstV.chapter];
                                if (!mapping) return false;
                                const parts = mapping.split('-');
                                const vIndex = firstV.verse;
                                if (parts.length === 2) {
                                    return vIndex >= Number(parts[0]) && vIndex <= Number(parts[1]);
                                }
                                return vIndex === Number(parts[0]);
                            });
                            if (found) jNum = (found as any).juz_number;
                        }
                        return { surahName: sInfo ? `Surat ${sInfo.transliteration}` : '', juzNumber: jNum };
                    };

                    const sortedPages = Array.from(activePages).sort((a, b) => a - b);
                    const spreads: number[][] = [];
                    for (let i = 0; i < sortedPages.length; i += 2) {
                      spreads.push([sortedPages[i], sortedPages[i + 1]].filter(Boolean));
                    }

                    // Helper to render Surah Header
                    const renderSurahHeader = (sNum: number) => {
                      const s = surahs.find(x => x.number === sNum);
                      if (!s) return null;
                      
                      const surahName = s.name.startsWith('سورة') ? s.name : `سورة ${s.name}`;

                      return (
                        <div className={styles.surahHeaderInPage} key={`header-${sNum}`}>
                          <div className={styles.surahFrameContainer}>
                            <img 
                              src="/surah-header.png" 
                              alt="Surah Header" 
                              className={styles.surahFrameImg}
                            />
                            <div className={styles.surahFrameContent}>
                              <h1 className={styles.surahFrameTitle}>{surahName}</h1>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return spreads.map((spread, idx) => (
                      <div key={idx} className={styles.spreadContainer}>
                        <div className={styles.mushafBook} dir="rtl">
                          <div className={styles.spineShadow}></div>
                          {spread.map((pageNum, pIdx) => {
                            const info = getPageInfo(pageNum);
                            // Get unique surahs on this page to potentially render headers
                            const pageVerses = pages[pageNum] || [];
                            const surahsOnPage = Array.from(new Set(pageVerses.map(v => v.chapter)));
                            
                            return (
                              <div 
                                key={pageNum}
                                data-page={pageNum}
                                className={`${styles.mushafPage} ${pIdx === 0 ? styles.rightPage : styles.leftPage}`}
                              >
                                <div className={styles.pageHeader}>
                                  <span>{info.surahName}</span>
                                  <span>Juz' {info.juzNumber}</span>
                                </div>
                                <div 
                                  className={styles.pageText}
                                  style={{ 
                                    textJustify: 'inter-word', 
                                    wordSpacing: '0.12em',
                                    fontSize: `${displayFontSize}px`,
                                    lineHeight: displayLineHeight
                                  } as React.CSSProperties}
                                >
                                  {pageVerses.map((verse: any, vIndex: number) => {
                                  const verseId = `${verse.chapter}-${verse.verse}`;
                                  const isBlurred = isTestMode && !revealedVerses.has(verseId);
                                  const isPlaying = audioState.currentSurah === verse.chapter && audioState.currentVerse === verse.verse.toString();
                                  
                                  // Check if this verse is the start of a surah (verse 1)
                                  const isSurahStart = verse.verse === 1;
                                  
                                  return (
                                    <Fragment key={verseId}>
                                      {isSurahStart && renderSurahHeader(verse.chapter)}
                                      <span 
                                        id={`verse-${verseId}`}
                                        className={`${styles.pageVerse} ${isBlurred ? styles.blurred : styles.revealed} ${
                                          isPlaying ? styles.playing : ''
                                        }`}
                                        onClick={() => isTestMode && toggleVerseReveal(verseId)}
                                      >
                                        <span 
                                          className={fontMode === 'qpc' ? `qpc-page-${qpcData[verseId]?.page || 0}` : "arabic-text"} 
                                          style={{ 
                                            fontSize: fontMode === 'qpc' ? 'inherit' : `${displayFontSize}px`, 
                                            lineHeight: 'inherit',
                                            fontFamily: fontMode === 'qpc' ? 'inherit' : "'Uthmanic Hafs', var(--font-arabic)"
                                          }}
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
                                              <>
                                                {verse.text}
                                                <span className={styles.hafsVerseMarker}>{verse.verse}</span>
                                              </>
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
                                            onPlay={(v) => playVerseAudio(v.chapter, v.verse)}
                                          />
                                        )}
                                      </span>
                                    </Fragment>
                                  );
                                })}
                                </div>
                                <div className={styles.pageFooter}>
                                  <span>{pageNum}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()
                ) : (
                    (() => {
                        // Group verses by page for standard page view too
                        const pages: Record<number, any[]> = {};
                        const allVerses = Object.keys(quranData).flatMap(sNum => 
                          (quranData[sNum as keyof typeof quranData] as any).map((v: any) => ({
                            ...v,
                            chapter: parseInt(sNum)
                          }))
                        );
                        
                        const currentSurahPages = new Set<number>();
                        verses.forEach((v: QuranVerse) => {
                          const page = qpcData[`${surahNumber}-${v.verse}`]?.page;
                          if (page) currentSurahPages.add(page);
                        });

                        const sortedActivePages = Array.from(currentSurahPages).sort((a, b) => a - b);
                        sortedActivePages.forEach(p => {
                          pages[p] = allVerses.filter(v => {
                            const vKey = `${v.chapter}-${v.verse}`;
                            return qpcData[vKey]?.page === p;
                          });
                        });

                        const getPageInfo = (pNum: number) => {
                            const pVerses = pages[pNum];
                            if (!pVerses || pVerses.length === 0) return { sName: '', jNum: '' };
                            const firstV = pVerses[0];
                            const sInfo = surahs.find(s => s.number === firstV.chapter);
                            let jNum = '';
                            if (juzData) {
                                const found = Object.values(juzData).find((j: any) => {
                                    const mapping = j.verse_mapping[firstV.chapter];
                                    if (!mapping) return false;
                                    const parts = mapping.split('-');
                                    const vIndex = firstV.verse;
                                    if (parts.length === 2) {
                                        return vIndex >= Number(parts[0]) && vIndex <= Number(parts[1]);
                                    }
                                    return vIndex === Number(parts[0]);
                                });
                                if (found) jNum = (found as any).juz_number;
                            }
                            return { sName: sInfo ? `Surat ${sInfo.transliteration}` : '', jNum };
                        };

                        return sortedActivePages.map(pageNum => {
                            const info = getPageInfo(pageNum);
                            return (
                                <div key={pageNum} className={styles.mushafPage} style={{ marginBottom: '40px', boxShadow: 'var(--shadow-md)', borderRadius: '16px' }}>
                                    <div className={styles.pageHeader}>
                                        <span>{info.sName}</span>
                                        <span>Juz' {info.jNum}</span>
                                    </div>
                                    <div 
                                        className={styles.pageText}
                                        style={{ 
                                            textJustify: 'inter-word', 
                                            wordSpacing: '0.1em',
                                            fontSize: `${displayFontSize}px`,
                                            lineHeight: displayLineHeight
                                        } as React.CSSProperties}
                                    >
                                        {pages[pageNum].map((verse: any) => {
                                            const verseId = `${verse.chapter}-${verse.verse}`;
                                            const isBlurred = isTestMode && !revealedVerses.has(verseId);
                                            const isPlaying = audioState.currentSurah === verse.chapter && audioState.currentVerse === verse.verse.toString();
                                            
                                            return (
                                                <span 
                                                    key={verseId}
                                                    id={`verse-${verseId}`}
                                                    className={`${styles.pageVerse} ${isBlurred ? styles.blurred : styles.revealed} ${
                                                        isPlaying ? styles.playing : ''
                                                    }`}
                                                    onClick={() => isTestMode && toggleVerseReveal(verseId)}
                                                >
                                                    <span 
                                                        className={fontMode === 'qpc' ? `qpc-page-${qpcData[verseId]?.page || 0}` : "arabic-text"} 
                                                        style={{ 
                                                            fontSize: fontMode === 'qpc' ? 'inherit' : `${displayFontSize}px`, 
                                                            lineHeight: 'inherit',
                                                            fontFamily: fontMode === 'qpc' ? 'inherit' : "'Uthmanic Hafs', var(--font-arabic)"
                                                        }}
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
                                                            <>
                                                              {verse.text}
                                                              <span className={styles.hafsVerseMarker}>{verse.verse}</span>
                                                            </>
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
                                                            onPlay={(v) => playVerseAudio(v.chapter, v.verse)}
                                                        />
                                                    )}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className={styles.pageFooter}>
                                        <span>{pageNum}</span>
                                    </div>
                                </div>
                            );
                        });
                    })()
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
                        <div className={styles.hafsVerseMarker} style={{ position: 'absolute', top: '24px', left: '24px', margin: 0, fontSize: '1rem', width: '40px', height: '40px' }}>
                          {verse.verse}
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
                              fontSize: `${displayFontSize}px`, 
                              lineHeight: '2',
                              marginBottom: '0',
                              textAlign: 'right',
                              direction: 'rtl',
                              fontFamily: fontMode === 'qpc' ? 'inherit' : "'Uthmanic Hafs', var(--font-arabic)"
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
