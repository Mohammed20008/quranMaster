"use client";

import { Fragment } from "react";
import Image from "next/image";
import styles from "./quran-reader.module.css";
import { VersePopup } from "./quran-reader-ui";
import { SharedViewProps } from "./quran-reader.types";
import quranData from "@/data/quran.json";
import { surahs } from "@/data/surah-data";
import {
  alignPageWordsToLines,
  AlignedLine,
  AlignedWord,
  QPC_BASMALAH_WORDS,
} from "./qpc-layout";

// Pre-compute once at module level (same data as spread-view)
const ALL_VERSES = Object.keys(quranData).flatMap((sNum) =>
  (quranData[sNum as keyof typeof quranData] as any[]).map((v: any) => ({
    ...v,
    chapter: parseInt(sNum),
    verseKey: `${sNum}-${v.verse}`,
  }))
);

interface PageViewProps extends SharedViewProps {
  verses: any[];
}

interface VerseSegment {
  verseId: string;
  verse: any;
  words: AlignedWord[];
}

function groupLineWordsIntoSegments(lineWords: AlignedWord[]): VerseSegment[] {
  const segments: VerseSegment[] = [];
  if (lineWords.length === 0) return segments;

  let currentSegment: VerseSegment = {
    verseId: lineWords[0].verseId,
    verse: lineWords[0].verse,
    words: [lineWords[0]],
  };

  for (let i = 1; i < lineWords.length; i++) {
    const w = lineWords[i];
    if (w.verseId === currentSegment.verseId) {
      currentSegment.words.push(w);
    } else {
      segments.push(currentSegment);
      currentSegment = {
        verseId: w.verseId,
        verse: w.verse,
        words: [w],
      };
    }
  }
  segments.push(currentSegment);
  return segments;
}

export default function PageView({
  surahNumber,
  qpcData,
  loadingQPC,
  fontsLoaded,
  isTestMode,
  revealedVerses,
  bookmarkedVerses,
  fontMode,
  mushafLayout,
  displayFontSize,
  displayLineHeight,
  juzData,
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
}: PageViewProps) {
  // Collect all pages for this surah
  const currentSurahPages = new Set<number>();
  verses.forEach((v: any) => {
    const page = qpcData[`${surahNumber}-${v.verse}`]?.page;
    if (page) currentSurahPages.add(page);
  });

  const sortedActivePages = Array.from(currentSurahPages).sort((a, b) => a - b);

  // Bucket verses per page
  const versesByPage: Record<number, any[]> = {};
  ALL_VERSES.forEach((v) => {
    const page = qpcData[v.verseKey]?.page;
    if (page && currentSurahPages.has(page)) {
      if (!versesByPage[page]) versesByPage[page] = [];
      versesByPage[page].push(v);
    }
  });

  const pages: Record<number, any[]> = {};
  sortedActivePages.forEach((p) => {
    pages[p] = versesByPage[p] || [];
  });

  const getPageInfo = (pNum: number) => {
    const pVerses = pages[pNum];
    if (!pVerses || pVerses.length === 0) return { sName: "", jNum: "" };
    const firstV = pVerses[0];
    const sInfo = surahs.find((s) => s.number === firstV.chapter);
    let jNum = "";
    if (juzData) {
      const found = Object.values(juzData).find((j: any) => {
        const mapping = j.verse_mapping[firstV.chapter];
        if (!mapping) return false;
        const parts = mapping.split("-");
        const vIndex = firstV.verse;
        return parts.length === 2
          ? vIndex >= Number(parts[0]) && vIndex <= Number(parts[1])
          : vIndex === Number(parts[0]);
      });
      if (found) jNum = (found as any).juz_number;
    }
    return { sName: sInfo ? `Surat ${sInfo.transliteration}` : "", jNum };
  };

  const isQpcReady =
    fontMode === "qpc" &&
    !loadingQPC &&
    fontsLoaded &&
    Object.keys(qpcData).length > 0;

  const isEndOfSurahLine = (line: AlignedLine) => {
    return line.words.some((w) => {
      const sInfo = surahs.find((s) => s.number === w.surahNum);
      if (!sInfo) return false;
      const isLastVerse = w.verseNum === sInfo.totalVerses;
      if (!isLastVerse) return false;
      const verseQPC = qpcData[`${w.surahNum}-${w.verseNum}`];
      if (!verseQPC) return false;
      return w.word === verseQPC.words.length;
    });
  };

  const renderSurahHeader = (sNum: number) => {
    const s = surahs.find((x) => x.number === sNum);
    if (!s) return null;
    const surahName = s.name.startsWith("سورة") ? s.name : `سورة ${s.name}`;
    return (
      <div className={styles.surahHeaderInPage} key={`header-${sNum}`}>
        <div className={styles.surahFrameContainer}>
          <Image
            src="/chapter_header_full.svg"
            alt="Surah Header"
            className={styles.surahFrameImg}
            width={600}
            height={120}
          />
          <div className={styles.surahFrameContent}>
            <h1 className={styles.surahFrameTitle}>{surahName}</h1>
          </div>
        </div>
      </div>
    );
  };

  const renderBasmalah = () => {
    const basmalahWords =
      QPC_BASMALAH_WORDS[mushafLayout] ?? QPC_BASMALAH_WORDS.v1;

    return (
      <div className={styles.basmalahLine} key="basmalah">
        {fontMode === "qpc" ? (
          <span
            className="qpc-page-1"
            style={{
              fontSize: "1.4em",
              display: "inline-block",
              margin: "-10px",
            }}
          >
            {basmalahWords.map((word, idx) => (
              <span key={idx} className="qpc-word">
                {word}
                {idx < basmalahWords.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        ) : (
          "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
        )}
      </div>
    );
  };

  const renderQpcPageSkeleton = (pageNum: number, info: any) => {
    return (
      <div
        key={pageNum}
        className={styles.mushafPage}
        style={{
          marginBottom: "20px",
          boxShadow: "var(--shadow-md)",
          borderRadius: "16px",
        }}
      >
        <div className={styles.pageHeader}>
          <span>{info.sName}</span>
          <span>Juz&apos; {info.jNum}</span>
        </div>
        <div
          className={`${styles.pageText} ${styles.pageSkeletonContainer}`}
          style={{
            fontSize: `${displayFontSize}px`,
          }}
        >
          {Array.from({ length: 15 }).map((_, idx) => (
            <div key={idx} className={styles.pageSkeletonLine} />
          ))}
        </div>
        <div className={styles.pageFooter}>
          <span>{pageNum}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {sortedActivePages.map((pageNum) => {
        const info = getPageInfo(pageNum);

        if (fontMode === "qpc" && !isQpcReady) {
          return renderQpcPageSkeleton(pageNum, info);
        }

        const alignedLines = alignPageWordsToLines(
          pageNum,
          pages[pageNum],
          qpcData,
          mushafLayout
        );

        return (
          <div
            key={pageNum}
            className={`${styles.mushafPage} ${pageNum <= 2 ? styles.mushafPageFirst : ""}`}
            style={{
              marginBottom: "20px",
              boxShadow: "var(--shadow-md)",
              borderRadius: "16px",
            }}
          >
            {pageNum > 2 && (
              <div className={styles.pageHeader}>
                <span>{info.sName}</span>
                <span>Juz&apos; {info.jNum}</span>
              </div>
            )}
            <div
              className={`${styles.pageText} ${
                fontMode === "qpc"
                  ? styles.qpcTextContainer
                  : styles.normalTextContainer
              }`}
              style={
                {
                  fontSize: `${displayFontSize}px`,
                  lineHeight: displayLineHeight,
                } as React.CSSProperties
              }
            >
              {fontMode === "qpc"
                ? alignedLines.map((line, lIdx) => {
                    const isEndLine = isEndOfSurahLine(line);
                    const segments = line.words
                      ? groupLineWordsIntoSegments(line.words)
                      : [];

                    return (
                      <Fragment key={lIdx}>
                        {line.surahHeader &&
                          renderSurahHeader(line.surahHeader.surahNumber)}
                        {line.hasBasmalah && renderBasmalah()}
                        {line.words && line.words.length > 0 && (
                          <div
                            className={`${styles.mushafLine} ${isEndLine ? styles.lastLineOfSurah : ""}`}
                          >
                            {segments.map((seg, sIdx) => {
                              const verseId = seg.verseId;
                              const isBlurred =
                                isTestMode && !revealedVerses.has(verseId);
                              const isPlaying =
                                audioCurrentSurah === seg.words[0].surahNum &&
                                audioCurrentVerse === seg.words[0].verseNum;
                              const isPaused = isPlaying && !audioIsPlaying;

                              return (
                                <span
                                  key={`${verseId}-${sIdx}`}
                                  id={`verse-${verseId}`}
                                  className={`${styles.pageVerse} ${isBlurred ? styles.blurred : styles.revealed} ${isPlaying ? styles.playing : ""} ${isPaused ? styles.paused : ""}`}
                                  onClick={() =>
                                    isTestMode && toggleVerseReveal(verseId)
                                  }
                                >
                                  <span className={`qpc-page-${pageNum}`}>
                                    {seg.words.map((w, wordIdx) => (
                                      <span
                                        key={`${w.id}-${wordIdx}`}
                                        className="qpc-word"
                                      >
                                        {w.text}
                                        {w.spaceAfter ? " " : ""}
                                      </span>
                                    ))}
                                  </span>
                                  {!isTestMode && (
                                    <VersePopup
                                      verse={seg.verse}
                                      verseId={verseId}
                                      isBookmarked={bookmarkedVerses.has(
                                        verseId
                                      )}
                                      onCopy={copyVerse}
                                      onBookmark={handleBookmark}
                                      onShare={shareVerse}
                                      onTafsir={setActiveTafsirVerse}
                                      onMutashabihat={
                                        setActiveMutashabihatVerse
                                      }
                                      onPlay={(v) =>
                                        playVerseAudio(v.chapter, v.verse)
                                      }
                                    />
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </Fragment>
                    );
                  })
                : pages[pageNum].map((verse: any) => {
                    const verseId = `${verse.chapter}-${verse.verse}`;
                    const isBlurred =
                      isTestMode && !revealedVerses.has(verseId);
                    const isPlaying =
                      audioCurrentSurah === verse.chapter &&
                      audioCurrentVerse === verse.verse;
                    const isPaused = isPlaying && !audioIsPlaying;

                    return (
                      <span
                        key={verseId}
                        id={`verse-${verseId}`}
                        className={`${styles.pageVerse} ${isBlurred ? styles.blurred : styles.revealed} ${isPlaying ? styles.playing : ""} ${isPaused ? styles.paused : ""}`}
                        onClick={() => isTestMode && toggleVerseReveal(verseId)}
                      >
                        <span
                          className="arabic-text"
                          style={{
                            fontSize: `${displayFontSize}px`,
                            lineHeight: "inherit",
                            fontFamily: "'Uthmanic Hafs', var(--font-arabic)",
                          }}
                        >
                          {verse.text}
                          <span className={styles.hafsVerseMarker}>
                            {verse.verse}
                          </span>
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
            {pageNum > 2 && (
              <div className={styles.pageFooter}>
                <span>{pageNum}</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
