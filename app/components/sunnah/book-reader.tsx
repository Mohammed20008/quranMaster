'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./book-reader.module.css";

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

interface BookReaderProps {
  hadiths: Hadith[];
  totalCount: number;
  chapterList: ChapterInfo[];
  currentChapter: number | string;
  onChapterChange?: (chapter: number | string) => void;
  loading?: boolean;
  error?: string;
  category?: string;
  book?: string;
}

export const BookReader: React.FC<BookReaderProps> = ({
  hadiths: initialHadiths,
  totalCount,
  chapterList,
  currentChapter,
  onChapterChange,
  loading: initialLoading,
  error: initialError,
  category,
  book,
}) => {
  // Ensure hadiths is always an array
  const [hadiths, setHadiths] = useState<Hadith[]>(
    Array.isArray(initialHadiths) ? initialHadiths : []
  );
  const [selectedChapter, setSelectedChapter] = useState<number | string>(
    currentChapter
  );
  const [loading, setLoading] = useState(initialLoading || false);
  const [error, setError] = useState<string | undefined>(initialError);

  const handleChapterChange = async (chapterId: number | string) => {
    setSelectedChapter(chapterId);
    setLoading(true);
    setError(undefined);
    if (category && book) {
      try {
        const res = await fetch(`/api/sunnah/${category}/${book}/${chapterId}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.hadiths)) {
          setHadiths(data.hadiths);
        } else {
          setError(data.error || "Could not load hadiths.");
          setHadiths([]);
        }
      } catch (e) {
        setHadiths([]);
        setError("Failed to fetch hadiths.");
      } finally {
        setLoading(false);
      }
    } else if (onChapterChange) {
      onChapterChange(chapterId);
    }
  };

  const handleCopyHadith = (hadith: Hadith) => {
    const text = `${hadith.arabic}\n\n${hadith.english.text}${
      hadith.english.narrator ? `\n\nNarrated by: ${hadith.english.narrator}` : ""
    }`;
    navigator.clipboard.writeText(text);
  };

  const handleShareHadith = (hadith: Hadith) => {
    if (navigator.share) {
      navigator.share({
        title: "Hadith",
        text: hadith.english.text,
      });
    }
  };

  return (
    <div className={styles.bookReaderContainer}>
      {/* Chapter Selector */}
      <div className={styles.chapterSelector}>
        <div className={styles.chapterGrid}>
          {chapterList.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => handleChapterChange(chapter.id)}
              className={`${styles.chapterBtn} ${
                selectedChapter === chapter.id ? styles.chapterBtnActive : ""
              }`}
              aria-current={selectedChapter === chapter.id}
            >
              <span>{chapter.english}</span>
              <span className={styles.chapterArabic}>{chapter.arabic}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hadiths List */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.loadingState}
          >
            <div className={styles.loadingSpinner}></div>
            <p>Loading hadiths…</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.errorState}
          >
            <p>{error}</p>
          </motion.div>
        ) : hadiths?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.emptyState}
          >
            <p>No hadiths found in this chapter.</p>
          </motion.div>
        ) : (
          <motion.div
            key="hadiths"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.hadithsList}
          >
            {hadiths.map((hadith, index) => (
              <motion.div
                key={hadith.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={styles.hadithCard}
              >
                <div className={styles.hadithHeader}>
                  <div className={styles.hadithMeta}>
                    <span className={styles.hadithNumber}>
                      Hadith #{hadith.id}
                    </span>
                    {hadith.english.narrator && (
                      <span className={styles.hadithNarrator}>
                        Narrated by: {hadith.english.narrator}
                      </span>
                    )}
                  </div>
                  <div className={styles.hadithActions}>
                    <button
                      onClick={() => handleCopyHadith(hadith)}
                      className={styles.actionIcon}
                      aria-label="Copy"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleShareHadith(hadith)}
                      className={styles.actionIcon}
                      aria-label="Share"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"/>
                        <circle cx="6" cy="12" r="3"/>
                        <circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.hadithArabic} dir="rtl">
                  {hadith.arabic}
                </div>

                <p className={styles.hadithEnglish}>{hadith.english.text}</p>

                {hadith.grade && (
                  <span className={styles.hadithGrade}>{hadith.grade}</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.totalCount}>
        Total hadiths in this collection: {totalCount.toLocaleString()}
      </div>
    </div>
  );
};
