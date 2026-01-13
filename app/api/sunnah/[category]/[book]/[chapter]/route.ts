import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string; book: string; chapter: string }> }
) {
  // In Next.js 15+, params is a Promise and must be awaited
  const { category, book, chapter } = await params;

  // Build filename e.g. data/sunnah/by_chapter/the_9_books/ibnmajah/3.json
  let filePath = path.join(
    process.cwd(),
    "data",
    "sunnah",
    "by_chapter",
    category,
    book,
    `${chapter}.json`
  );

  // Check if numbered file exists, otherwise fallback to all.json
  try {
    await fs.access(filePath);
  } catch {
    const allPath = path.join(
      process.cwd(),
      "data",
      "sunnah",
      "by_chapter",
      category,
      book,
      "all.json"
    );
    try {
      await fs.access(allPath);
      filePath = allPath;
    } catch {
       // Let the main try/catch handle the final error
    }
  }

  try {
    const file = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(file);
    
    // Handle both array and object structure
    let hadiths: any[] = [];
    if (Array.isArray(data)) {
      hadiths = data;
    } else if (data && typeof data === 'object') {
      // Check for 'hadiths' property or common variations
      if (Array.isArray(data.hadiths)) {
        hadiths = data.hadiths;
      } else if (Array.isArray(data.Hadiths)) {
        hadiths = data.Hadiths;
      }
    }
    
    return NextResponse.json({ hadiths });
  } catch (error) {
    return NextResponse.json({ error: "Chapter not found", hadiths: [] }, { status: 404 });
  }
}
