"use server";
import { fetchQuranMetadata, fetchPageMapping } from "./get-metadata";

export async function fetchAllQuranSettings() {
  const [juz, hizb, rub, mapping] = await Promise.all([
    fetchQuranMetadata("juz"),
    fetchQuranMetadata("hizb"),
    fetchQuranMetadata("rub"),
    fetchPageMapping(),
  ]);

  return { juz, hizb, rub, mapping };
}
