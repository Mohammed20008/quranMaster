import { BookReader } from "../../../components/sunnah/book-reader";
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
  arabicTitle?: string;
  author?: string;
  length?: number;
  chapters: ChapterInfo[];
  description?: string;
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
  
  console.log(`Loading hadiths from: ${chapterPath}`);
  
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
    
    console.log(`Loaded ${hadiths.length} hadiths for chapter ${chapter}`);
    return hadiths;
  } catch (error) {
    // Suppress ENOENT errors for cleaner logs, only strict errors
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
  // In Next.js 15+, params is a Promise and must be awaited
  const { category, book } = await params;
  const meta = await getBookMetaAndChapters(category, book);
  const chapters = meta.chapters;
  const initialChapter = chapters[0]?.id || 1;
  const hadiths = await getHadithsForChapter(category, book, initialChapter);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--background)', 
      color: 'var(--foreground)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: 'radial-gradient(circle at 50% 0%, rgba(198, 147, 32, 0.15) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(var(--card-border) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.1,
        zIndex: 0,
        pointerEvents: 'none',
        maskImage: 'linear-gradient(to bottom, black, transparent)'
      }} />

      {/* Header with back button */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a 
            href="/sunnah" 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--card-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--foreground)',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>
              {meta.title}
            </h1>
            {meta.arabicTitle && (
              <p style={{ fontSize: '1.125rem', color: 'var(--foreground-secondary)', margin: '0.25rem 0 0 0', fontFamily: 'var(--font-arabic)' }}>
                {meta.arabicTitle}
              </p>
            )}
            {meta.author && (
              <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, margin: '0.25rem 0 0 0' }}>
                by {meta.author}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <BookReader
          hadiths={hadiths}
          totalCount={meta.length || hadiths.length}
          chapterList={chapters}
          currentChapter={initialChapter}
          category={category}
          book={book}
        />
      </main>
    </div>
  );
}
