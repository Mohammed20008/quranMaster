import SunnahBookInterface from "@/app/components/sunnah/sunnah-book-interface";
import path from "path";
import fs from "fs/promises";

interface Hadith {
  id: number | string;
  arabic: string;
  english: { text: string; narrator?: string };
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
  length: number;
  chapters: ChapterInfo[];
  description: string;
}

// Get metadata and chapters list from by_book
async function getBookMetaAndChapters(
  category: string,
  book: string
): Promise<BookMeta> {
  const bookPath = path.join(
    process.cwd(),
    "data",
    "sunnah",
    "by_book",
    category,
    `${book}.json`
  );
  
  try {
    const file = await fs.readFile(bookPath, "utf-8");
    const json = JSON.parse(file);
    
    // Handle different JSON structures
    const metadata = json.metadata || json;
    const chapters = json.chapters || json.book || [];
    
    return {
      title: metadata?.english?.title || metadata?.title || metadata?.name || book,
      arabicTitle: metadata?.arabic?.title || metadata?.arabicTitle || '',
      author: metadata?.english?.author || metadata?.author || '',
      chapters: Array.isArray(chapters) ? chapters : [],
      length: metadata?.length || metadata?.hadithCount || 0,
      description: metadata?.english?.introduction || metadata?.description || '',
    };
  } catch (error) {
    console.error(`Error loading book metadata for ${book}:`, error);
    // Return minimal structure if file not found
    return {
      title: book,
      arabicTitle: '',
      author: '',
      chapters: [],
      length: 0,
      description: '',
    };
  }
}

// Get first chapter's hadiths for SSR hydration
async function getHadithsForChapter(
  category: string,
  book: string,
  chapter: number | string
) {
  const chapterDir = path.join(
    process.cwd(),
    "data",
    "sunnah",
    "by_chapter",
    category,
    book
  );

  let chapterPath = path.join(chapterDir, `${chapter}.json`);
  
  // Try numbered file first, then fallback to all.json
  try {
    await fs.access(chapterPath);
  } catch {
    chapterPath = path.join(chapterDir, "all.json");
  }
  
  try {
    const file = await fs.readFile(chapterPath, "utf-8");
    const data = JSON.parse(file);
    
    // Handle both array and object structure
    let hadiths: any[] = [];
    if (Array.isArray(data)) {
      hadiths = data;
    } else if (data && typeof data === 'object') {
      // Check for 'hadiths' property or common variations
      hadiths = data.hadiths || data.Hadiths || [];
      if (!Array.isArray(hadiths)) hadiths = [];
    }
    
    return hadiths;
  } catch (error) {
    if ((error as any).code !== 'ENOENT') {
      console.error(`Error loading chapter ${chapter}:`, error);
    }
    return [];
  }
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ category: string; book: string }>;
}) {
  const { category, book } = await params;
  const meta = await getBookMetaAndChapters(category, book);
  const chapters = meta.chapters;
  const initialChapter = chapters[0]?.id || 1;
  const hadiths = await getHadithsForChapter(category, book, initialChapter);

  return (
    <SunnahBookInterface
      initialHadiths={hadiths}
      totalCount={meta.length || hadiths.length}
      chapterList={chapters}
      currentChapter={initialChapter}
      category={category}
      book={book}
      meta={{
        title: meta.title,
        arabicTitle: meta.arabicTitle,
        author: meta.author,
      }}
    />
  );
}
