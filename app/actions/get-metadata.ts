"use server";
import fs from "fs";
import path from "path";

export async function fetchQuranMetadata(
  type: "juz" | "hizb" | "rub",
): Promise<any> {
  const filePath = path.join(
    process.cwd(),
    "scripts",
    `quran-metadata-${type}.json`,
  );
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Metadata file not found: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error(`Failed to load ${type} metadata:`, e);
    return null;
  }
}

export async function fetchPageMapping(): Promise<Record<string, number>> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "qpc_data",
    "quran-page-mapping.json",
  );
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`Page mapping file not found: ${filePath}`);
      return {};
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    console.error(`Failed to load page mapping:`, e);
    return {};
  }
}
