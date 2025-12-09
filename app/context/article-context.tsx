'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  status: 'draft' | 'published';
  category: string;
  imageUrl?: string;
}

interface ArticleContextType {
  articles: Article[];
  addArticle: (article: Omit<Article, 'id' | 'publishedAt'>) => void;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  getArticle: (id: string) => Article | undefined;
  isLoading: boolean;
}

const defaultArticles: Article[] = [
  {
    id: '1',
    title: 'The Virtues of Reciting Surah Al-Kahf on Friday',
    excerpt: 'Discover the spiritual benefits and hadiths regarding the recitation of Surah Al-Kahf every Friday.',
    content: 'Full content regarding Surah Al-Kahf...',
    author: 'Sheikh Ahmed',
    publishedAt: '2024-12-08',
    status: 'published',
    category: 'Sunnah',
  },
  {
    id: '2',
    title: 'Understanding Tajweed Rules: A Beginner Guide',
    excerpt: 'An introduction to the essential rules of Tajweed to improve your Quranic recitation.',
    content: 'Full content about Tajweed...',
    author: 'Ustadh Ali',
    publishedAt: '2024-12-05',
    status: 'published',
    category: 'Education',
  },
  {
    id: '3',
    title: 'Reflecting on the Meaning of Surah Al-Fatiha',
    excerpt: 'A deep dive into the "Opening" chapter of the Quran and its profound meanings.',
    content: 'Tafsir of Al-Fatiha...',
    author: 'Dr. Sarah',
    publishedAt: '2024-12-01',
    status: 'published',
    category: 'Tafsir',
  }
];

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('quran_app_articles');
    if (stored) {
      setArticles(JSON.parse(stored));
    } else {
      setArticles(defaultArticles);
      localStorage.setItem('quran_app_articles', JSON.stringify(defaultArticles));
    }
    setIsLoading(false);
  }, []);

  // Save to local storage whenever articles change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('quran_app_articles', JSON.stringify(articles));
    }
  }, [articles, isLoading]);

  const addArticle = (articleData: Omit<Article, 'id' | 'publishedAt'>) => {
    const newArticle: Article = {
      ...articleData,
      id: Date.now().toString(),
      publishedAt: new Date().toISOString().split('T')[0],
    };
    setArticles(prev => [newArticle, ...prev]);
  };

  const updateArticle = (id: string, updates: Partial<Article>) => {
    setArticles(prev => prev.map(art => 
      art.id === id ? { ...art, ...updates } : art
    ));
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(art => art.id !== id));
  };

  const getArticle = (id: string) => {
    return articles.find(art => art.id === id);
  };

  return (
    <ArticleContext.Provider value={{ articles, addArticle, updateArticle, deleteArticle, getArticle, isLoading }}>
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
}
