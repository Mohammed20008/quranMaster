"use client";

import styles from "./quran-reader.module.css";
import { CollapsibleSection } from "./quran-reader-ui";
import { SharedViewProps } from "./quran-reader.types";
import translationData from "../../../data/translation/en-maarif-ul-quran-simple.json";
import transliterationData from "../../../data/translitration/syllables-transliteration.json";

interface VerseViewProps extends SharedViewProps {
  verses: any[];
}

export default function VerseView({
  surahNumber,
  qpcData,
  loadingQPC,
  fontsLoaded,
  isTestMode,
  revealedVerses,
  bookmarkedVerses,
  fontMode,
  displayFontSize,
  audioCurrentSurah,
  audioCurrentVerse,
  audioIsPlaying,
  toggleVerseReveal,
  copyVerse,
  handleBookmark,
  shareVerse,
  setActiveTafsirVerse,
  setActiveMutashabihatVerse,
  playVerseAudio,
  verses,
}: VerseViewProps) {
  return (
    <>
      {verses.map((verse) => {
        const verseId = `${surahNumber}-${verse.verse}`;
        const isBookmarked = bookmarkedVerses.has(verseId);
        const isBlurred = isTestMode && !revealedVerses.has(verseId);
        const isPlaying =
          audioCurrentSurah === surahNumber &&
          audioCurrentVerse === verse.verse;
        const isPaused = isPlaying && !audioIsPlaying;

        return (
          <div
            key={verseId}
            id={`verse-${verseId}`}
            className={`${styles.verseCard} ${isBlurred ? styles.blurredVerse : styles.revealedVerse} ${isPlaying ? styles.playing : ""} ${isPaused ? styles.paused : ""}`}
            onClick={() => isTestMode && toggleVerseReveal(verseId)}
          >
            {/* Verse Number Badge */}
            {fontMode !== "qpc" && (
              <div
                className={styles.hafsVerseMarker}
                style={{
                  position: "absolute",
                  top: "24px",
                  left: "24px",
                  margin: 0,
                  fontSize: "1rem",
                  width: "40px",
                  height: "40px",
                }}
              >
                {verse.verse}
              </div>
            )}

            {/* Arabic Text */}
            <div className={styles.arabicText}>
              {fontMode === "qpc" &&
              (loadingQPC || !qpcData[verseId] || !fontsLoaded) ? (
                <div className={styles.skeletonVerse}>
                  <div
                    className={styles.skeletonLine}
                    style={{ width: "95%" }}
                  />
                  <div
                    className={styles.skeletonLine}
                    style={{ width: "80%" }}
                  />
                  <div
                    className={styles.skeletonLine}
                    style={{ width: "70%" }}
                  />
                </div>
              ) : (
                <p
                  className={
                    fontMode === "qpc"
                      ? `qpc-page-${qpcData[verseId]?.page || 0}`
                      : "arabic-text"
                  }
                  style={{
                    fontSize: `${displayFontSize}px`,
                    lineHeight: "2",
                    marginBottom: "0",
                    textAlign: "right",
                    direction: "rtl",
                    fontFamily:
                      fontMode === "qpc"
                        ? "inherit"
                        : "'Uthmanic Hafs', var(--font-arabic)",
                  }}
                >
                  {fontMode === "qpc" && qpcData[verseId]
                    ? qpcData[verseId].words.map((w: any) => (
                        <span key={w.id}>{w.text} </span>
                      ))
                    : verse.text}
                </p>
              )}
            </div>

            {/* Translation and Transliteration */}
            <div className={styles.verseTranslations}>
              {(transliterationData as any)[
                `${surahNumber}:${verse.verse}`
              ] && (
                <CollapsibleSection title="Transliteration">
                  <div className={styles.transliteration}>
                    <p>
                      {
                        (transliterationData as any)[
                          `${surahNumber}:${verse.verse}`
                        ]
                      }
                    </p>
                  </div>
                </CollapsibleSection>
              )}
              {(translationData as any)[`${surahNumber}:${verse.verse}`]?.t && (
                <CollapsibleSection title="Translation">
                  <div className={styles.translation}>
                    <p>
                      {
                        (translationData as any)[
                          `${surahNumber}:${verse.verse}`
                        ]?.t
                      }
                    </p>
                  </div>
                </CollapsibleSection>
              )}
            </div>

            {/* Verse Actions */}
            <div
              className={styles.verseActions}
              style={{
                opacity: isBlurred ? 0 : 1,
                pointerEvents: isBlurred ? "none" : "auto",
              }}
            >
              <button
                className={`${styles.actionBtn} ${isBookmarked ? styles.bookmarked : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmark(verseId);
                }}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                title={isBookmarked ? "Remove bookmark" : "Bookmark this verse"}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={isBookmarked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  copyVerse(verse);
                }}
                aria-label="Copy verse"
                title="Copy verse"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  playVerseAudio(surahNumber, verse.verse);
                }}
                aria-label="Play audio"
                title="Play verse audio"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMutashabihatVerse(verseId);
                }}
                aria-label="Mutashabihat"
                title="Similar Verses (Mutashabihat)"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="9"></line>
                  <line x1="9" y1="13" x2="15" y2="13"></line>
                  <line x1="9" y1="17" x2="13" y2="17"></line>
                </svg>
              </button>
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTafsirVerse(verseId);
                }}
                aria-label="Read Tafsir"
                title="Read Tafsir"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </button>
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  shareVerse(verse);
                }}
                aria-label="Share verse"
                title="Share verse"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
  );
}
