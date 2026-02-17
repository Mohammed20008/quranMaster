import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
  const byBookDir = path.join(process.cwd(), 'data', 'sunnah', 'by_book');
  const collections: any[] = [];

  try {
    const categories = await fs.readdir(byBookDir);
    
    for (const category of categories) {
      const categoryPath = path.join(byBookDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const books = await fs.readdir(categoryPath);
        
        for (const bookFile of books) {
          if (bookFile.endsWith('.json')) {
            const bookId = bookFile.replace('.json', '');
            const bookPath = path.join(categoryPath, bookFile);
            
            try {
              const fileContent = await fs.readFile(bookPath, 'utf-8');
              const data = JSON.parse(fileContent);
              const metadata = data.metadata || {};
              
              collections.push({
                id: bookId,
                category: category,
                name: metadata.english?.title || metadata.title || bookId,
                arabicName: metadata.arabic?.title || metadata.arabicTitle || '',
                author: metadata.english?.author || metadata.author || '',
                description: metadata.english?.introduction || metadata.description || '',
                hadithCount: metadata.length || metadata.hadithCount || (data.hadiths ? data.hadiths.length : 0),
                chapterCount: data.chapters ? data.chapters.length : 0
              });
            } catch (err) {
              console.error(`Error reading book ${bookFile}:`, err);
            }
          }
        }
      }
    }

    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error loading collections:', error);
    return NextResponse.json({ error: 'Failed to load collections', collections: [] }, { status: 500 });
  }
}
