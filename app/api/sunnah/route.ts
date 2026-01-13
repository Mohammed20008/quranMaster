import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const sunnahDataPath = path.join(process.cwd(), 'data', 'sunnah', 'by_book');
    
    // Read all categories
    const categories = await fs.readdir(sunnahDataPath);
    const collections: any[] = [];
    
    for (const category of categories) {
      const categoryPath = path.join(sunnahDataPath, category);
      const stats = await fs.stat(categoryPath);
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(categoryPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            
            const bookId = file.replace('.json', '');
            
            collections.push({
              id: bookId,
              category,
              name: data?.metadata?.english?.title || bookId,
              arabicName: data?.metadata?.arabic?.title || '',
              author: data?.metadata?.english?.author || data?.metadata?.arabic?.author || '',
              description: data?.metadata?.english?.introduction || data?.metadata?.english?.description || '',
              hadithCount: data?.metadata?.length || data?.hadiths?.length || 0,
              chapterCount: data?.chapters?.length || 0,
            });
          }
        }
      }
    }
    
    return NextResponse.json({ collections });
  } catch (error) {
    console.error('Error loading sunnah collections:', error);
    return NextResponse.json(
      { error: 'Failed to load collections' },
      { status: 500 }
    );
  }
}
