'use server';
import fs from 'fs';
import path from 'path';

export async function fetchQuranMetadata(type: 'juz' | 'hizb' | 'rub'): Promise<any> {
    const filePath = path.join(process.cwd(), 'scripts', `quran-metadata-${type}.json`, `quran-metadata-${type}.json`);
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`Metadata file not found: ${filePath}`);
            return null;
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Failed to load ${type} metadata:`, e);
        return null;
    }
}
