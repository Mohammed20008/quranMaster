"use client";

import React, { useState, useEffect, useRef } from "react";
import { surahs } from "@/data/surah-data";
import styles from "./header.module.css";
import { reciters, Reciter } from "@/data/reciters";
import { useUserData } from "@/app/context/user-data-context";
import { useAudio } from "@/app/context/audio-context";
import { motion, AnimatePresence } from "framer-motion";

export type ViewMode = "verse" | "page" | "spread";

export interface PlaybackOption {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
}

interface HeaderProps {
  currentSurah: number;
  onPrevSurah: () => void;
  onNextSurah: () => void;
  onThemeToggle: () => void;
  theme: "light" | "dark";
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentPage?: number;
  pageContext?: {
    page: number;
    surahs: number[];
    startsSurahOnPage: number[];
  };
}

export default function Header({
  currentSurah,
  onPrevSurah,
  onNextSurah,
  // onThemeToggle,
  // theme,
  viewMode,
  onViewModeChange,
  currentPage,
  pageContext,
}: HeaderProps) {
  const { settings, updateSettings } = useUserData();
  const {
    state: audioState,
    playSurah,
    playPage,
    togglePlay,
    currentReciter,
  } = useAudio();

  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showReciters, setShowReciters] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [playbackOptions, setPlaybackOptions] = useState<PlaybackOption[]>([]);
  const [, setQueuedReciter] = useState<Reciter | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const surah = surahs.find((s) => s.number === currentSurah);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Update scrolled state (for glass effect)
      setIsScrolled(currentScrollY > 20);

      // Show header when scrolling up or at top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowReciters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReciterSelect = (reciter: Reciter) => {
    updateSettings({ selectedReciterId: reciter.id });
    setQueuedReciter(reciter);
    setShowReciters(false);
  };

  const startPlayback = (
    type: "surah" | "page",
    sNum?: number,
    pNum?: number,
  ) => {
    const s = sNum || currentSurah;
    if (type === "surah") {
      playSurah(s);
    } else if (type === "page") {
      const p = pNum || currentPage;
      if (p) playPage(s, p);
    }
    setShowPrompt(false);
  };

  const handlePlayClick = () => {
    if (!surah) return;

    if (audioState.isPlaying) {
      togglePlay();
      return;
    }

    if (audioState.currentSurah && audioState.currentTime > 0) {
      togglePlay();
      return;
    }

    // Generate context-aware options
    const options: PlaybackOption[] = [];

    if (pageContext && pageContext.surahs.length > 0) {
      const { surahs: sOnPage, startsSurahOnPage } = pageContext;

      // If multiple surahs or transitions
      if (sOnPage.length > 1 || startsSurahOnPage.length > 0) {
        // Option for each surah starting on this page
        startsSurahOnPage.forEach((sNum) => {
          const sObj = surahs.find((s) => s.number === sNum);
          options.push({
            id: `start-${sNum}`,
            title: `Beginning of Surah ${sObj?.transliteration}`,
            description: `Start reciting ${sObj?.name} from Verse 1`,
            action: () => startPlayback("surah", sNum),
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            ),
          });
        });

        // "From Current Page" option
        const firstSurahOnPage = sOnPage[0];
        const sObj = surahs.find((s) => s.number === firstSurahOnPage);

        // Redundancy check: if the only surah on page starts at verse 1, "From Current Page" is redundant
        const isRedundant =
          sOnPage.length === 1 && startsSurahOnPage.includes(firstSurahOnPage);

        if (!isRedundant) {
          options.push({
            id: "page-top",
            title: `From Top of Page`,
            description: `Recite from the first verse visible (${sObj?.transliteration})`,
            action: () => startPlayback("page", firstSurahOnPage),
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            ),
          });
        }
      }
    }

    // Default options if no complex context
    if (options.length === 0) {
      options.push({
        id: "start-surah",
        title: `Beginning of Surah ${surah?.transliteration || ""}`,
        description: `Recite ${surah?.name || ""} from the start`,
        action: () => startPlayback("surah"),
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        ),
      });

      if (currentPage) {
        options.push({
          id: "page-current",
          title: `From Current Page`,
          description: `Resume from page ${currentPage}`,
          action: () => startPlayback("page"),
          icon: (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          ),
        });
      }
    }

    setPlaybackOptions(options);
    setShowPrompt(true);
  };

  if (!surah) return null;

  return (
    <>
      <header
        className={`${styles.header} ${isVisible ? styles.visible : styles.hidden} ${isScrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.container}>
          {/* Left Section - Surah Info */}
          <div className={styles.surahInfo}>
            <div className={styles.surahBadge}>
              <span className={styles.surahNumber}>{surah.number}</span>
            </div>
          </div>

          {/* Center Section - Navigation Controls */}
          <div className={styles.controls}>
            <button
              className={styles.navBtn}
              onClick={onPrevSurah}
              disabled={currentSurah === 1}
              aria-label="Previous Surah"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className={styles.surahSelector}>
              <span
                className={`${styles.currentSurah} arabic-font`}
                style={{ fontSize: "1.25rem" }}
              >
                {surah.name}
              </span>
            </div>

            <button
              className={styles.navBtn}
              onClick={onNextSurah}
              disabled={currentSurah === 114}
              aria-label="Next Surah"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Right Section - View Options */}
          <div className={styles.options}>
            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              <button
                className={`${styles.viewModeBtn} ${viewMode === "verse" ? styles.active : ""}`}
                onClick={() => onViewModeChange("verse")}
                aria-label="Verse by verse view"
                title="Verse by verse"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-gallery-vertical-icon lucide-gallery-vertical"
                >
                  <path d="M3 2h18" />
                  <rect width="18" height="12" x="3" y="6" rx="2" />
                  <path d="M3 22h18" />
                </svg>
                <span>Verses</span>
              </button>
              <button
                className={`${styles.viewModeBtn} ${viewMode === "page" ? styles.active : ""}`}
                onClick={() => onViewModeChange("page")}
                aria-label="Page view"
                title="Continuous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-notebook-text-icon lucide-notebook-text"
                >
                  <path d="M2 6h4" />
                  <path d="M2 10h4" />
                  <path d="M2 14h4" />
                  <path d="M2 18h4" />
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <path d="M9.5 8h5" />
                  <path d="M9.5 12H16" />
                  <path d="M9.5 16H14" />
                </svg>
                <span>Page</span>
              </button>
              <button
                className={`${styles.viewModeBtn} ${viewMode === "spread" ? styles.active : ""}`}
                onClick={() => onViewModeChange("spread")}
                aria-label="Spread view"
                title="Spread (Book) mode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open-icon lucide-book-open"
                >
                  <path d="M12 7v14" />
                  <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                </svg>
                <span>Spread</span>
              </button>
            </div>

            <div className={styles.divider}></div>
            {/* Reciter Dropdown */}
            <div className={styles.reciterDropdown} ref={dropdownRef}>
              <button
                className={styles.reciterBtn}
                onClick={() => setShowReciters(!showReciters)}
              >
                <span>{currentReciter?.name.split(" ").pop()}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  style={{
                    transform: showReciters ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <AnimatePresence>
                {showReciters && (
                  <motion.div
                    className={styles.reciterMenu}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {reciters.map((reciter) => (
                      <button
                        key={reciter.id}
                        className={`${styles.reciterItem} ${settings.selectedReciterId === reciter.id ? styles.active : ""}`}
                        onClick={() => handleReciterSelect(reciter)}
                      >
                        <div className={styles.reciterItemInfo}>
                          <span className={styles.reciterName}>
                            {reciter.name}
                          </span>
                          <span className={styles.reciterSubtext}>
                            {reciter.subtext}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.divider}></div>

            {/* Audio Play/Pause Button */}
            <button
              className={`${styles.iconBtn} ${audioState.isPlaying ? styles.active : ""}`}
              onClick={handlePlayClick}
              aria-label={audioState.isPlaying ? "Pause audio" : "Play audio"}
              title={audioState.isPlaying ? "Pause" : "Play"}
            >
              {audioState.isPlaying ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>

            <div className={styles.divider}></div>

            {/* Layout Toggle */}
            <button
              className={`${styles.fontToggleBtn} ${settings.mushafLayout === "v4" ? styles.active : ""}`}
              onClick={() =>
                updateSettings({
                  mushafLayout:
                    settings.mushafLayout === "v1" ? "v4" : "v1",
                })
              }
              title="Toggle Mushaf Layout Print"
            >
              {settings.mushafLayout === "v4" ? "V4 Print" : "V1 Print"}
            </button>
          </div>
        </div>
      </header>

      {/* Playback Prompt Modal */}
      <AnimatePresence>
        {showPrompt && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowPrompt(false)}
          >
            <motion.div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3>How do you want to start?</h3>
              <p className={styles.modalSub}>
                {pageContext?.surahs && pageContext.surahs.length > 1
                  ? "Multiple surahs detected on this spread."
                  : `Ready to recite Surah ${surah.transliteration}`}
              </p>
              <div className={styles.modalActions}>
                {playbackOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className={styles.modalBtn}
                    onClick={opt.action}
                  >
                    <div className={styles.modalBtnIcon}>{opt.icon}</div>
                    <div className={styles.modalBtnText}>
                      <span className={styles.modalBtnTitle}>{opt.title}</span>
                      <span className={styles.modalBtnDesc}>
                        {opt.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setShowPrompt(false)}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
