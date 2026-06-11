import React from 'react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonSlide {
  title: string;
  content: string;
  arabic?: string;
  transliteration?: string;
}

export interface LetterShapeData {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  exampleWord: string;
  exampleTranslation: string;
  exampleArabic: string;
  illustrationEmoji: string;
  letterExplanation: string;

  // Optional shape-specific examples
  isNonConnecting?: boolean;
  isolatedWord?: string;
  isolatedTranslation?: string;
  isolatedArabic?: string;
  isolatedEmoji?: string;

  initialWord?: string;
  initialTranslation?: string;
  initialArabic?: string;
  initialEmoji?: string;

  medialWord?: string;
  medialTranslation?: string;
  medialArabic?: string;
  medialEmoji?: string;

  finalWord?: string;
  finalTranslation?: string;
  finalArabic?: string;
  finalEmoji?: string;
}

export interface VowelAppliedData {
  vowelName: string;
  vowelMark: string;
  sound: string;
  letterApplied: string;
  exampleWord: string;
  exampleTranslation: string;
  exampleArabic: string;
  illustrationEmoji: string;
}

export interface AlphabetLessonData {
  letters: string[];
  letterDetails: {
    [letter: string]: {
      name: string;
      shapes: LetterShapeData;
      vowels: VowelAppliedData[];
    };
  };
}

export interface LessonData {
  id: string;
  title: string;
  description: string;
  points: number;
  isAlphabet?: boolean;
  alphabetData?: AlphabetLessonData;
  slides?: LessonSlide[]; // For standard lessons
  quiz: QuizQuestion[];
}

export interface LevelData {
  id: 'explorer' | 'adventure' | 'master';
  title: string;
  description: string;
  lessons: LessonData[];
}

export interface SectionData {
  id: 'arabic' | 'fiqh' | 'aqidah' | 'qasas' | 'sirah';
  title: string;
  arabicTitle: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string;
  borderColor: string;
  levels: {
    explorer: LevelData;
    adventure: LevelData;
    master: LevelData;
  };
}

export interface UserProgress {
  xp: number;
  completedLessons: string[];
  unlockedLevels: {
    [sectionId: string]: ('explorer' | 'adventure' | 'master')[];
  };
}

export interface RawAlphabetLetter {
  char: string;
  name: string;
  isNonConnecting?: boolean;
  isolated: string;
  initial: string;
  medial: string;
  final: string;
  exampleWord: string;
  exampleTranslation: string;
  exampleArabic: string;
  illustrationEmoji: string;
  explanation: string;
  fathahWord: string;
  fathahTranslation: string;
  fathahArabic: string;
  fathahEmoji: string;
  fathahSound: string;
  kasrahWord: string;
  kasrahTranslation: string;
  kasrahArabic: string;
  kasrahEmoji: string;
  kasrahSound: string;
  dammahWord: string;
  dammahTranslation: string;
  dammahArabic: string;
  dammahEmoji: string;
  dammahSound: string;
}
