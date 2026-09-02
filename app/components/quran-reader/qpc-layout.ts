import { QPCVerseData } from "@/types/qpc";

let mushafLayouts: {
  v1: Record<string, string[]>;
  v4: Record<string, string[]>;
} | null = null;

let layoutDataPromise: Promise<void> | null = null;

export function ensureLayoutDataLoaded(): Promise<void> {
  if (layoutDataPromise) return layoutDataPromise;
  layoutDataPromise = Promise.all([
    import("@/data/qpc_data/mushaf-layout-v1.json").then((m) => m.default),
    import("@/data/qpc_data/mushaf-layout-v4.json").then((m) => m.default),
  ]).then(([v1, v4]) => {
    mushafLayouts = {
      v1: v1 as Record<string, string[]>,
      v4: v4 as Record<string, string[]>,
    };
  });
  return layoutDataPromise;
}

export const QPC_BASMALAH_WORDS = {
  v1: ["ﭑ", "ﭒ", "ﭓ", "ﭔ"],
  v4: ["ﱁ", "ﱂ", "ﱃ", "ﱄ"],
} as const;

export interface AlignedWord {
  id: number;
  word: number;
  text: string;
  layoutText: string;
  spaceAfter: boolean;
  verseId: string;
  verse: any;
  surahNum: number;
  verseNum: number;
}

export interface AlignedLine {
  lineIndex: number;
  words: AlignedWord[];
  surahHeader?: {
    surahNumber: number;
    surahName: string;
  };
  hasBasmalah?: boolean;
}

function getSurahStartingOnPage(p: number, pageMapping: Record<string, number>): number | null {
  if (!pageMapping) return null;
  for (let s = 1; s <= 114; s++) {
    if (pageMapping[`${s}:1`] === p) {
      return s;
    }
  }
  return null;
}

export function alignPageWordsToLines(
  pageNum: number,
  pageVerses: any[],
  qpcData: Record<string, QPCVerseData>,
  layout: "v1" | "v4" = "v1",
  pageMapping: Record<string, number>
): AlignedLine[] {
  if (!mushafLayouts) {
    console.warn("Layout data not loaded yet.");
    return [];
  }
  const mushafLayout = mushafLayouts[layout] || mushafLayouts.v1;
  const layoutLines = mushafLayout[String(pageNum)];
  if (!layoutLines || !pageVerses || pageVerses.length === 0) {
    return [];
  }

  // 1. Gather all words for the verses on this page sequentially
  let pageWords: AlignedWord[] = [];
  pageVerses.forEach((verse) => {
    const verseId = `${verse.chapter}-${verse.verse}`;
    const verseQPC = qpcData[verseId];
    if (verseQPC && verseQPC.words) {
      verseQPC.words.forEach((w: any) => {
        if (w.page && w.page !== pageNum) {
          return;
        }
        pageWords.push({
          id: w.id,
          word: w.word,
          text: w.text,
          layoutText: w.layoutText ?? w.text,
          spaceAfter: true,
          verseId,
          verse,
          surahNum: verse.chapter,
          verseNum: verse.verse,
        });
      });
    }
  });

  // Fallback: if page-specific filtering yielded 0 words, gather all words from the page verses
  if (pageWords.length === 0) {
    pageVerses.forEach((verse) => {
      const verseId = `${verse.chapter}-${verse.verse}`;
      const verseQPC = qpcData[verseId];
      if (verseQPC && verseQPC.words) {
        verseQPC.words.forEach((w: any) => {
          pageWords.push({
            id: w.id,
            word: w.word,
            text: w.text,
            layoutText: w.layoutText ?? w.text,
            spaceAfter: true,
            verseId,
            verse,
            surahNum: verse.chapter,
            verseNum: verse.verse,
          });
        });
      }
    });
  }

  if (pageWords.length === 0) {
    return [];
  }

  // 2. Map words directly by line tokens from the layout definition.
  // Each line in the layout JSON contains space-separated word tokens corresponding
  // to the exact printed words on that specific line of the Mushaf.
  let wordPtr = 0;
  const lineWordsMap = layoutLines.map(() => [] as AlignedWord[]);

  for (let lineIdx = 0; lineIdx < layoutLines.length; lineIdx++) {
    const rawTokens = layoutLines[lineIdx].trim().split(/\s+/).filter(Boolean);

    for (let tIdx = 0; tIdx < rawTokens.length; tIdx++) {
      const layoutToken = rawTokens[tIdx];
      const word = pageWords[wordPtr];
      if (!word) break;
      wordPtr++;

      lineWordsMap[lineIdx].push({
        ...word,
        layoutText: layoutToken,
        spaceAfter: tIdx < rawTokens.length - 1,
      });
    }
  }

  // If there are any remaining words on the page, append them to the last line
  if (wordPtr < pageWords.length && lineWordsMap.length > 0) {
    const lastLineIdx = lineWordsMap.length - 1;
    while (wordPtr < pageWords.length) {
      const word = pageWords[wordPtr++];
      lineWordsMap[lastLineIdx].push({
        ...word,
        spaceAfter: true,
      });
    }
  }

  // 3. Build the aligned lines
  let previousSurahNum: number | null = null;
  const alignedLines: AlignedLine[] = [];

  for (let lineIdx = 0; lineIdx < layoutLines.length; lineIdx++) {
    const lineAlignedWords = lineWordsMap[lineIdx];

    if (lineAlignedWords.length === 0) {
      continue;
    }

    const alignedLine: AlignedLine = {
      lineIndex: lineIdx,
      words: lineAlignedWords,
    };

    // Detect Surah Header or Basmalah (Only for middle-of-the-page transitions)
    const firstWord = lineAlignedWords[0];

    if (firstWord.surahNum !== previousSurahNum) {
      if (previousSurahNum !== null) {
        alignedLine.surahHeader = {
          surahNumber: firstWord.surahNum,
          surahName: `سورة ${firstWord.verse.chapter_name || ""}`,
        };
        // Surah 9 (At-Tawbah) has no Basmalah.
        // Surah 1 (Al-Fatihah) has Basmalah as Verse 1.
        if (firstWord.surahNum !== 9 && firstWord.surahNum !== 1) {
          alignedLine.hasBasmalah = true;
        }
      }
    }

    previousSurahNum = firstWord.surahNum;
    alignedLines.push(alignedLine);
  }

  // 5. Apply Page-Boundary Surah Header / Basmalah split logic
  const firstLine = alignedLines.find((l) => l.words.length > 0);
  if (firstLine) {
    const firstWord = firstLine.words[0];
    if (firstWord.verseNum === 1 && firstWord.word === 1) {
      const S = firstWord.surahNum;
      const prevPageLines = pageNum > 1 ? mushafLayout[String(pageNum - 1)] : null;
      const prevPageLineCount = prevPageLines ? prevPageLines.length : 15;

      if (prevPageLineCount === 14) {
        // Surah Header was rendered at the bottom of the previous page
        if (S !== 9 && S !== 1) {
          alignedLines.unshift({
            lineIndex: -2,
            words: [],
            hasBasmalah: true,
          });
        }
      } else if (prevPageLineCount === 13) {
        // Both Header and Basmalah were rendered at the bottom of the previous page
      } else {
        // Both Header and Basmalah must be rendered at the top of this page
        if (S !== 9 && S !== 1) {
          alignedLines.unshift({
            lineIndex: -2,
            words: [],
            hasBasmalah: true,
          });
        }
        alignedLines.unshift({
          lineIndex: -1,
          words: [],
          surahHeader: {
            surahNumber: S,
            surahName: `سورة ${firstWord.verse.chapter_name || ""}`,
          },
        });
      }
    }
  }

  // Check if the next page starts with a new Surah
  const nextSurah = getSurahStartingOnPage(pageNum + 1, pageMapping);
  if (nextSurah) {
    const currentLinesCount = layoutLines.length;
    if (currentLinesCount === 14) {
      // Append Surah Header at the bottom of the current page
      alignedLines.push({
        lineIndex: -1,
        words: [],
        surahHeader: {
          surahNumber: nextSurah,
          surahName: "",
        },
      });
    } else if (currentLinesCount === 13) {
      // Append both Surah Header and Basmalah at the bottom of the current page
      alignedLines.push({
        lineIndex: -1,
        words: [],
        surahHeader: {
          surahNumber: nextSurah,
          surahName: "",
        },
      });
      if (nextSurah !== 9 && nextSurah !== 1) {
        alignedLines.push({
          lineIndex: -2,
          words: [],
          hasBasmalah: true,
        });
      }
    }
  }

  return alignedLines;
}
