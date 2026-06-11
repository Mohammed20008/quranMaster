import mushafLayoutV1 from "@/data/qpc_data/mushaf-layout-v1.json";
import mushafLayoutV4 from "@/data/qpc_data/mushaf-layout-v4.json";
import pageMapping from "@/data/qpc_data/quran-page-mapping.json";
import { QPCVerseData } from "@/types/qpc";

const mushafLayouts = {
  v1: mushafLayoutV1 as Record<string, string[]>,
  v4: mushafLayoutV4 as Record<string, string[]>,
};

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

function getSurahStartingOnPage(p: number): number | null {
  for (let s = 1; s <= 114; s++) {
    if ((pageMapping as any)[`${s}:1`] === p) {
      return s;
    }
  }
  return null;
}

export function alignPageWordsToLines(
  pageNum: number,
  pageVerses: any[],
  qpcData: Record<string, QPCVerseData>,
  layout: "v1" | "v4" = "v1"
): AlignedLine[] {
  const mushafLayout = mushafLayouts[layout] || mushafLayouts.v1;
  const layoutLines = mushafLayout[String(pageNum)];
  if (!layoutLines || !pageVerses || pageVerses.length === 0) {
    return [];
  }

  // 1. Gather all words for the verses on this page sequentially
  const pageWords: AlignedWord[] = [];
  pageVerses.forEach((verse) => {
    const verseId = `${verse.chapter}-${verse.verse}`;
    const verseQPC = qpcData[verseId];
    if (verseQPC && verseQPC.words) {
      verseQPC.words.forEach((w) => {
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

  if (pageWords.length === 0) {
    return [];
  }

  // 2. Align by the v1 layout's glyph stream.
  // This makes newer fonts, including v4, inherit v1's exact printed line breaks
  // and spacing, even when a QPC word contains an internal space or spans lines.
  const qpcGlyphs: { char: string; word: AlignedWord }[] = [];
  pageWords.forEach((word) => {
    for (const char of word.text.replace(/\s+/g, "")) {
      qpcGlyphs.push({ char, word });
    }
  });

  let glyphPtr = 0;
  const lineWordsMap = layoutLines.map(() => [] as AlignedWord[]);

  for (let lineIdx = 0; lineIdx < layoutLines.length; lineIdx++) {
    let currentChunk: AlignedWord | null = null;

    for (const layoutChar of layoutLines[lineIdx]) {
      if (/\s/.test(layoutChar)) {
        if (currentChunk) {
          currentChunk.spaceAfter = true;
          currentChunk = null;
        }
        continue;
      }

      const glyph = qpcGlyphs[glyphPtr];
      if (!glyph) break;
      glyphPtr++;

      if (
        currentChunk &&
        currentChunk.id === glyph.word.id &&
        currentChunk.verseId === glyph.word.verseId &&
        !currentChunk.spaceAfter
      ) {
        currentChunk.text += glyph.char;
        currentChunk.layoutText += layoutChar;
        continue;
      }

      currentChunk = {
        ...glyph.word,
        text: glyph.char,
        layoutText: layoutChar,
        spaceAfter: false,
      };
      lineWordsMap[lineIdx].push(currentChunk);
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
  const nextSurah = getSurahStartingOnPage(pageNum + 1);
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
