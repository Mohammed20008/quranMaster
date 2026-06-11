"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { surahs } from "@/data/surah-data";
import { QuranVerse } from "@/data/quran-verses";
import { ViewMode } from "../header/header";
import { AnimatePresence } from "framer-motion";
import styles from "./quran-reader.module.css";
import Toast from "../ui/toast";
import { fetchSurahQPCData } from "@/app/actions/get-qpc-data";
import {
  fetchQuranMetadata,
  fetchPageMapping,
} from "@/app/actions/get-metadata";
import QPCFontLoader from "./qpc-font-loader";
import { QPCVerseData } from "@/types/qpc";
import dynamic from "next/dynamic";

// Dynamic imports for heavy dialogs/sheets
const TafsirSheet = dynamic(() => import("../tafsir/tafsir-sheet"), {
  ssr: false,
});
const MutashabihatView = dynamic(() => import("./mutashabihat-view"), {
  ssr: false,
});
const ShareModal = dynamic(() => import("../share/share-modal"), {
  ssr: false,
});
import { useAudio } from "@/app/context/audio-context";
import { useUserData } from "@/app/context/user-data-context";
import {
  ORDINAL_WORDS,
  QuranReaderProps,
  RUB_POSITIONS,
} from "./quran-reader.types";

// Sub-components
import {
  TransitionNotification,
  QuranPageLoader,
  NextSurahTrigger,
} from "./quran-reader-ui";
import SpreadView from "./spread-view";
import PageView from "./page-view";
import VerseView from "./verse-view";

// Types & constants

// ─── Main Component ───────────────────────────────────────────────────────────

export default function QuranReader({
  surahNumber,
  viewMode: propViewMode = "verse",
  bookmarkedVerses,
  onToggleBookmark,
  onNextSurah,
  fontSize = 32,
  onPageChange,
  onPageSurahsChange,
}: QuranReaderProps) {
  const { playVerse: playVerseAudio, state: audioState } = useAudio();

  // ── Responsive: disable spread on narrow screens ──
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);
  const viewMode: ViewMode =
    propViewMode === "spread" && isSmallScreen ? "page" : propViewMode;

  // ── Data ──────────────────────────────────────────
  const surah = surahs.find((s) => s.number === surahNumber);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(true);

  // Load verses asynchronously using Server Action
  useEffect(() => {
    let active = true;
    const loadVerses = async () => {
      setLoadingVerses(true);
      const { fetchSurahVerses } = await import("@/app/actions/get-verses");
      const data = await fetchSurahVerses(surahNumber);
      if (active) {
        setVerses(data);
        setLoadingVerses(false);
      }
    };
    loadVerses();
    return () => {
      active = false;
    };
  }, [surahNumber]);

  // ── User settings ────────────────────────────────
  const { settings, updateSettings } = useUserData();
  const fontMode = settings.fontMode;
  const isTestMode = settings.isTestMode;

  // ── Font size helpers ─────────────────────────────
  const baseFontSize =
    settings.fontMode === "qpc" && settings.mushafLayout === "v4"
      ? fontSize * 0.80 // Scaled down slightly to fit the new compact 530px container width
      : fontSize * 0.92; // Scaled down slightly for V1 as well to make it compact
  const displayFontSize =
    viewMode === "spread"
      ? baseFontSize * 0.58 // Adjusted spread scaling
      : viewMode === "page"
        ? baseFontSize * 0.74 // Make page mode font size bigger (0.74 instead of 0.58)
        : baseFontSize;
  const displayLineHeight =
    viewMode === "spread" ? 1.75 : viewMode === "page" ? 1.75 : 2.2;

  // ── UI State ──────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<string | null>(
    null
  );
  const [activeMutashabihatVerse, setActiveMutashabihatVerse] = useState<
    string | null
  >(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareVerseData, setShareVerseData] = useState<{
    arabic: string;
    english: string;
    verseNumber: number;
    surahName?: string;
  } | null>(null);

  const [revealedVerses, setRevealedVerses] = useState<Set<string>>(new Set());

  // ── QPC / Font state ─────────────────────────────
  const [qpcData, setQpcData] = useState<Record<string, QPCVerseData>>({});
  const [loadingQPC, setLoadingQPC] = useState(false);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    setLoadedPages(new Set());
    setFontsLoaded(false);
  }, [settings.mushafLayout]);

  // ── Metadata for transition notifications ─────────
  const [juzData, setJuzData] = useState<any>(null);
  const [hizbData, setHizbData] = useState<any>(null);
  const [rubData, setRubData] = useState<any>(null);
  const [outstandingNotification, setOutstandingNotification] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [lastKeys, setLastKeys] = useState({ juz: "", hizb: "", rub: "" });
  const [pageMapping, setPageMapping] = useState<Record<string, number>>({});

  // ── Effects ───────────────────────────────────────

  useEffect(() => {
    import("@/app/actions/get-all-metadata").then(
      ({ fetchAllQuranSettings }) => {
        fetchAllQuranSettings().then((data) => {
          setJuzData(data.juz);
          setHizbData(data.hizb);
          setRubData(data.rub);
          setPageMapping(data.mapping);
        });
      }
    );
  }, []);

  // Transition detection
  useEffect(() => {
    if (
      !audioState.currentVerse ||
      !audioState.currentSurah ||
      !juzData ||
      !hizbData ||
      !rubData
    )
      return;

    const currentKey = `${audioState.currentSurah}:${audioState.currentVerse}`;
    let newNotif: { title: string; message: string } | null = null;
    const nextLastKeys = { ...lastKeys };
    let triggered = false;

    // 1. Juz
    for (const j of Object.values(juzData) as any[]) {
      // Check for start of Juz 1
      if (
        j.juz_number === 1 &&
        j.first_verse_key === currentKey &&
        lastKeys.juz !== "juz-1-start"
      ) {
        triggered = true;
        nextLastKeys.juz = "juz-1-start";
        newNotif = { title: "Al-Juz", message: "Juz 1 starts here" };
        break;
      }
      // Check for completion of any Juz
      if (
        j.last_verse_key === currentKey &&
        lastKeys.juz !== `juz-${j.juz_number}-finished`
      ) {
        triggered = true;
        nextLastKeys.juz = `juz-${j.juz_number}-finished`;
        newNotif = {
          title: "Al-Juz",
          message: `You just finished the ${ORDINAL_WORDS[j.juz_number]} Juz`,
        };
        break;
      }
    }

    // 2. Hizb (only if no Juz notification)
    if (!newNotif) {
      for (const h of Object.values(hizbData) as any[]) {
        // Check for start of Hizb 1
        if (
          h.hizb_number === 1 &&
          h.first_verse_key === currentKey &&
          lastKeys.hizb !== "hizb-1-start"
        ) {
          triggered = true;
          nextLastKeys.hizb = "hizb-1-start";
          newNotif = { title: "Al-Hizb", message: "Hizb 1 starts here" };
          break;
        }
        // Check for completion of any Hizb
        if (
          h.last_verse_key === currentKey &&
          lastKeys.hizb !== `hizb-${h.hizb_number}-finished`
        ) {
          triggered = true;
          nextLastKeys.hizb = `hizb-${h.hizb_number}-finished`;
          newNotif = {
            title: "Al-Hizb",
            message: `You just finished the ${ORDINAL_WORDS[h.hizb_number]} Hizb`,
          };
          break;
        }
      }
    }

    // 3. Rub (only if no notification yet)
    if (!newNotif) {
      for (const r of Object.values(rubData) as any[]) {
        // Check for start of Rub 1
        if (
          r.rub_number === 1 &&
          r.first_verse_key === currentKey &&
          lastKeys.rub !== "rub-1-start"
        ) {
          triggered = true;
          nextLastKeys.rub = "rub-1-start";
          newNotif = { title: "Rub el Hizb", message: "A new quarter started" };
          break;
        }
        // Check for completion of any Rub
        if (
          r.last_verse_key === currentKey &&
          lastKeys.rub !== `rub-${r.rub_number}-finished`
        ) {
          triggered = true;
          nextLastKeys.rub = `rub-${r.rub_number}-finished`;
          const juz = Math.ceil(r.rub_number / 8);
          const rubInJuz = ((r.rub_number - 1) % 8) + 1;
          newNotif = {
            title: "Rub el Hizb",
            message: `You just finished ${RUB_POSITIONS[rubInJuz - 1].toLowerCase()} rub from the ${ORDINAL_WORDS[juz].toLowerCase()} juz`,
          };
          break;
        }
      }
    }

    if (triggered) {
      if (newNotif) setOutstandingNotification(newNotif);
      setLastKeys(nextLastKeys);
    }
  }, [
    audioState.currentVerse,
    audioState.currentSurah,
    juzData,
    hizbData,
    rubData,
    lastKeys,
  ]);

  // Auto-close notification after 5 s
  useEffect(() => {
    if (outstandingNotification) {
      const t = setTimeout(() => setOutstandingNotification(null), 5000);
      return () => clearTimeout(t);
    }
  }, [outstandingNotification]);

  // Notify parent of current page and surahs on it
  useEffect(() => {
    if (visiblePages.size > 0) {
      const minPage = Math.min(...Array.from(visiblePages));
      if (onPageChange) onPageChange(minPage);

      if (onPageSurahsChange && Object.keys(pageMapping).length > 0) {
        const surahsOnPage: number[] = [];
        // Find all surahs that have at least one verse on the minPage
        const seen = new Set<number>();
        Object.entries(pageMapping).forEach(([key, page]) => {
          if (page === minPage) {
            const sNum = parseInt(key.split(":")[0]);
            if (!seen.has(sNum)) {
              seen.add(sNum);
              surahsOnPage.push(sNum);
            }
          }
        });

        // Also check if Verse 1 of any surah is on this page
        const startsSurahOnPage = surahsOnPage.filter((s) => {
          return pageMapping[`${s}:1`] === minPage;
        });

        onPageSurahsChange({
          page: minPage,
          surahs: surahsOnPage,
          startsSurahOnPage,
        });
      }
    }
  }, [visiblePages, onPageChange, onPageSurahsChange, pageMapping]);

  // Load QPC data for all surahs present on the pages containing the current surah
  useEffect(() => {
    if (Object.keys(pageMapping).length === 0) return;

    setLoadingQPC(true);

    // 1. Find all pages that contain verses from the current surah
    const surahPages = new Set<number>();
    Object.entries(pageMapping).forEach(([key, page]) => {
      const [s] = key.split(":");
      if (parseInt(s) === surahNumber) surahPages.add(page);
    });

    // 2. Find all surahs that have verses on those pages
    const surahsOnThesePages = new Set<number>();
    Object.entries(pageMapping).forEach(([key, page]) => {
      if (surahPages.has(page)) {
        const [s] = key.split(":");
        surahsOnThesePages.add(parseInt(s));
      }
    });

    // 3. For spread mode, we also want the neighboring pages' surahs
    if (viewMode === "spread") {
      const minPage = Math.min(...Array.from(surahPages));
      const maxPage = Math.max(...Array.from(surahPages));
      const neighboringPages = [minPage - 1, maxPage + 1];
      Object.entries(pageMapping).forEach(([key, page]) => {
        if (neighboringPages.includes(page)) {
          const [s] = key.split(":");
          surahsOnThesePages.add(parseInt(s));
        }
      });
    }

    const surahsToLoad = Array.from(surahsOnThesePages).filter(
      (n) => n >= 1 && n <= 114
    );

    Promise.all(
      surahsToLoad.map((n) => fetchSurahQPCData(n, settings.mushafLayout))
    ).then((results) => {
      const map: Record<string, QPCVerseData> = {};
      results.forEach((surahData) => {
        surahData.forEach((d) => {
          const [s, v] = d.id.split(":");
          map[`${s}-${v}`] = d;
        });
      });
      setQpcData(map);
      setLoadingQPC(false);

      const initialData = results.find(
        (_, idx) => surahsToLoad[idx] === surahNumber
      );
      if (initialData && initialData.length > 0) {
        const firstPage = initialData[0]?.page;
        if (firstPage) setVisiblePages(new Set([firstPage]));
      }
    });
  }, [surahNumber, viewMode, pageMapping, settings.mushafLayout]);

  // IntersectionObserver – track visible pages
  useEffect(() => {
    if (fontMode !== "qpc" || Object.keys(qpcData).length === 0) return;
    const cb = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const verseId = entry.target.id.replace("verse-", "");
          const page = qpcData[verseId]?.page;
          if (page) {
            setVisiblePages((prev) => {
              if (prev.has(page)) return prev;
              return new Set([...prev, page]);
            });
          }
        }
      });
    };
    const observer = new IntersectionObserver(cb, {
      rootMargin: "200px 0px",
      threshold: 0.1,
    });
    document
      .querySelectorAll('[id^="verse-"]')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [fontMode, qpcData]);

  // Load all pages for the current surah so there is no FOUT
  useEffect(() => {
    if (fontMode !== "qpc") {
      setFontsLoaded(true);
      return;
    }

    const surahPages = new Set<number>();
    surahPages.add(1); // ALWAYS load page 1 for Basmalah typography
    Object.values(qpcData).forEach((v) => {
      const [sNum] = v.id.split(":");
      if (v.page && parseInt(sNum) === surahNumber) surahPages.add(v.page);
    });

    const targetPages = Array.from(surahPages);
    if (targetPages.length === 0) {
      if (!loadingQPC && Object.keys(qpcData).length > 0) setFontsLoaded(true);
      return;
    }

    const pagesToLoad = targetPages.filter((p) => !loadedPages.has(p));
    if (pagesToLoad.length === 0) {
      setFontsLoaded(true);
      return;
    }

    const checkFonts = async () => {
      const promises = pagesToLoad.map((page) =>
        document.fonts.load(`16px "QPC_Page_${page}"`)
      );
      try {
        await Promise.all(promises);
        setLoadedPages((prev) => new Set([...prev, ...pagesToLoad]));
        setFontsLoaded(true);
      } catch {
        setFontsLoaded(true);
      }
    };
    checkFonts();
  }, [fontMode, qpcData, loadingQPC, loadedPages, surahNumber]);

  // ── Scroll to top on Surah change ────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [surahNumber]);

  // ── Audio-driven Surah transition ────────────────────────────────────────────
  // Track previous audio Surah so we can detect cross-Surah transitions
  const prevAudioSurahRef = useRef<number | null>(null);

  useEffect(() => {
    const audioSurah = audioState.currentSurah;
    if (!audioSurah) return;

    // If audio moved into a DIFFERENT Surah than the one currently displayed,
    // navigate to that Surah and scroll to the top smoothly.
    if (audioSurah !== surahNumber && audioSurah === surahNumber + 1) {
      onNextSurah?.();
      // Small delay so the new content mounts before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 300);
    }

    prevAudioSurahRef.current = audioSurah;
  }, [audioState.currentSurah]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll active verse into view ────────────────────────────────────────────
  useEffect(() => {
    if (audioState.currentVerse && audioState.currentSurah) {
      const el = document.getElementById(
        `verse-${audioState.currentSurah}-${audioState.currentVerse}`
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [audioState.currentSurah, audioState.currentVerse]);

  // ── Derived ───────────────────────────────────────

  const qpcPagesForLoader = useMemo(() => {
    const p = new Set<number>();
    p.add(1); // ALWAYS load page 1 for Basmalah typography
    Object.values(qpcData).forEach((v) => {
      if (v.page) p.add(v.page);
    });
    return Array.from(p).sort();
  }, [qpcData]);

  const isLoadingPages =
    (viewMode === "page" || viewMode === "spread") &&
    (loadingQPC || !fontsLoaded);

  // ── Handlers ──────────────────────────────────────

  const toggleTestMode = () => {
    const newMode = !isTestMode;
    updateSettings({ isTestMode: newMode });
    setRevealedVerses(new Set());
    setToast(newMode ? "Test Mode Enabled" : "Test Mode Disabled");
  };

  const toggleVerseReveal = (verseId: string) => {
    setRevealedVerses((prev) => {
      const next = new Set(prev);
      next.has(verseId) ? next.delete(verseId) : next.add(verseId);
      return next;
    });
  };

  const handleBookmark = (verseId: string) => {
    const isBookmarked = bookmarkedVerses.has(verseId);
    onToggleBookmark(verseId);
    setToast(isBookmarked ? "Bookmark removed" : "Verse bookmarked");
  };

  const copyVerse = async (verse: any) => {
    const text = `${verse.text}\n\n— Quran ${surahNumber}:${verse.verse}`;
    try {
      await navigator.clipboard.writeText(text);
      setToast("Verse copied to clipboard");
    } catch {
      setToast("Failed to copy");
    }
  };

  const shareVerse = async (verse: any) => {
    const translation = (await import("../../../data/translation/en-maarif-ul-quran-simple.json")).default;
    const englishText =
      (translation as any)[`${surahNumber}:${verse.verse}`]?.t || "";
    setShareVerseData({
      arabic: verse.text,
      english: englishText,
      verseNumber: verse.verse,
    });
    setShareModalOpen(true);
  };

  // Shared props for view sub-components
  const sharedViewProps = {
    surahNumber,
    qpcData,
    loadingQPC,
    fontsLoaded,
    isTestMode,
    revealedVerses,
    bookmarkedVerses,
    fontMode,
    mushafLayout: settings.mushafLayout,
    displayFontSize,
    displayLineHeight,
    juzData,
    audioCurrentSurah: audioState.currentSurah,
    audioCurrentVerse: audioState.currentVerse,
    audioIsPlaying: audioState.isPlaying,
    toggleVerseReveal,
    copyVerse,
    handleBookmark,
    shareVerse,
    setActiveTafsirVerse,
    setActiveMutashabihatVerse,
    playVerseAudio,
  };

  // ── Guard renders ─────────────────────────────────

  if (!surah) {
    return (
      <div className={styles.error}>
        <h2>Surah not found</h2>
        <p>Surah #{surahNumber} could not be loaded.</p>
      </div>
    );
  }

  if (loadingVerses) {
    return (
      <div className={styles.reader} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <QuranPageLoader surahName={surah.transliteration} />
      </div>
    );
  }

  if (verses.length === 0) {
    return (
      <div className={styles.error}>
        <h2>No verses found</h2>
        <p>Surah {surah.name} has no verses loaded.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────

  return (
    <div className={styles.reader}>
      {/* Premium page loader for page/spread modes */}
      <AnimatePresence>
        {isLoadingPages && (
          <QuranPageLoader surahName={surah.transliteration} />
        )}
      </AnimatePresence>

      {/* Transition Notification */}
      <AnimatePresence>
        {outstandingNotification && (
          <TransitionNotification
            title={outstandingNotification.title}
            message={outstandingNotification.message}
            onClose={() => setOutstandingNotification(null)}
          />
        )}
      </AnimatePresence>

      <QPCFontLoader
        pages={qpcPagesForLoader}
        mushafLayout={settings.mushafLayout}
      />

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
            subtitle: "QuranMaster",
          }}
        />
      )}

      {/* Surah Header removed per user request for single page mode as well */}

      {/* Verses */}
      <div className={styles.verses}>
        {verses.length > 0 ? (
          <>
            {/* Page / Spread View */}
            {(viewMode === "page" || viewMode === "spread") && (
              <div
                className={
                  viewMode === "spread" ? styles.spreadView : styles.pageView
                }
              >
                {viewMode === "spread" ? (
                  <SpreadView {...sharedViewProps} verses={verses} />
                ) : (
                  <PageView {...sharedViewProps} verses={verses} />
                )}
              </div>
            )}

            {/* List/Verse View */}
            {viewMode === "verse" && (
              <VerseView {...sharedViewProps} verses={verses} />
            )}

            {/* Continuous Next Surah Trigger */}
            <NextSurahTrigger
              onNext={surahNumber < 114 ? onNextSurah : undefined}
              nextSurahNumber={surahNumber + 1}
              nextSurahName={
                surahs.find((s) => s.number === surahNumber + 1)?.transliteration
              }
              nextSurahNameArabic={
                surahs.find((s) => s.number === surahNumber + 1)?.name
              }
            />
          </>
        ) : (
          <div className={styles.noVerses}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <h3>No Verses Found</h3>
            <p>This Surah doesn&apos;t have any verses in the database.</p>
          </div>
        )}
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
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
