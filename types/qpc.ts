export type QPCVerseData = {
  id: string; // surah:verse
  page: number;
  words: {
    word: number;
    text: string;
    id: number;
  }[];
};
