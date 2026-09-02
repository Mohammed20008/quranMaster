"use server";
import fs from "fs";
import path from "path";

export async function fetchQuranMetadata(
  type: "juz" | "hizb" | "rub",
): Promise<any> {
  const fileName = `quran-metadata-${type}.json`;
  const possiblePaths = [
    path.join(process.cwd(), "scripts", fileName),
    path.join(process.cwd(), "data", fileName),
    path.join(process.cwd(), fileName),
  ];

  for (let filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, fileName);
          if (!fs.existsSync(filePath)) continue;
        }
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
      }
    } catch (e) {
      console.error(`Failed reading metadata at ${filePath}:`, e);
    }
  }

  console.error(`Metadata file not found for ${type}`);
  return null;
}

export async function fetchPageMapping(): Promise<Record<string, number>> {
  const fileName = "quran-page-mapping.json";
  const possiblePaths = [
    path.join(process.cwd(), "data", "qpc_data", fileName),
    path.join(process.cwd(), "data", fileName),
  ];

  for (let filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, fileName);
          if (!fs.existsSync(filePath)) continue;
        }
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
      }
    } catch (e) {
      console.error(`Failed reading page mapping at ${filePath}:`, e);
    }
  }

  console.error(`Page mapping file not found`);
  return {};
}
