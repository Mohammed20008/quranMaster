import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; book: string; chapter: string }> }
) {
  const { category, book, chapter } = await params;
  
  const chapterDir = path.join(
    process.cwd(),
    "data",
    "sunnah",
    "by_chapter",
    category,
    book
  );

  let chapterPath = path.join(chapterDir, `${chapter}.json`);
  
  try {
    // Try specifically named file first
    try {
      await fs.access(chapterPath);
    } catch {
      // Fallback to all.json if specific chapter file doesn't exist
      chapterPath = path.join(chapterDir, "all.json");
    }
    
    const file = await fs.readFile(chapterPath, "utf-8");
    const data = JSON.parse(file);
    
    let hadiths: any[] = [];
    if (Array.isArray(data)) {
      hadiths = data;
    } else if (data && typeof data === 'object') {
      hadiths = data.hadiths || data.Hadiths || [];
      
      // If chapter specified but we are in 'all.json', we might need to filter
      if (chapterPath.endsWith('all.json') && chapter !== 'all') {
          // This depends on the schema of all.json, usually it has chapterId
          hadiths = hadiths.filter((h: any) => 
            String(h.chapterId) === String(chapter) || 
            String(h.bookId) === String(chapter)
          );
      }
    }
    
    return NextResponse.json({ hadiths });
  } catch (error) {
    console.error(`Error loading chapter ${chapter}:`, error);
    return NextResponse.json({ error: 'Failed to load chapter', hadiths: [] }, { status: 500 });
  }
}
