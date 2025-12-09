'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './articles.module.css';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  category: string;
  readTime: number;
  imageUrl?: string;
}

// Mock articles data for demonstration
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'The Importance of Dhikr in Daily Life',
    excerpt: 'Exploring the spiritual benefits of remembrance of Allah and how it transforms our daily routines into acts of worship.',
    content: '',
    author: 'Imam Ahmad',
    publishedAt: '2025-12-08',
    category: 'Spirituality',
    readTime: 5
  },
  {
    id: '2',
    title: 'Etiquettes of Reading the Holy Quran',
    excerpt: 'A comprehensive guide on the manners and proper conduct to observe when reciting the words of Allah.',
    content: '',
    author: 'Sheikh Abdullah',
    publishedAt: '2025-12-07',
    category: 'Quran',
    readTime: 8
  },
  {
    id: '3',
    title: 'Understanding Tafsir: A Beginner\'s Guide',
    excerpt: 'Introduction to the science of Quranic exegesis and how to benefit from scholarly interpretations.',
    content: '',
    author: 'Dr. Fatima',
    publishedAt: '2025-12-06',
    category: 'Education',
    readTime: 12
  },
  {
    id: '4',
    title: 'The Virtues of Surah Al-Kahf',
    excerpt: 'Discover the profound wisdom and blessings contained in this special chapter recommended for Friday reading.',
    content: '',
    author: 'Imam Ahmad',
    publishedAt: '2025-12-05',
    category: 'Quran',
    readTime: 6
  },
  {
    id: '5',
    title: 'Patience (Sabr) in Islam',
    excerpt: 'How the Quran teaches us to develop patience and perseverance through life\'s trials and tribulations.',
    content: '',
    author: 'Sheikh Abdullah',
    publishedAt: '2025-12-04',
    category: 'Character',
    readTime: 7
  },
  {
    id: '6',
    title: 'The Night Prayer: Qiyam al-Layl',
    excerpt: 'Understanding the significance and rewards of standing in prayer during the night hours.',
    content: '',
    author: 'Dr. Fatima',
    publishedAt: '2025-12-03',
    category: 'Worship',
    readTime: 9
  }
];

const categories = ['All', 'Quran', 'Spirituality', 'Education', 'Character', 'Worship'];

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div>
              <h1>Islamic Manners & Wisdom</h1>
              <p>Articles on Islamic etiquette, spirituality, and Quranic guidance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Deepen Your Understanding
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Explore articles on Islamic manners, Quranic sciences, and spiritual development
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className={styles.searchContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Category Filter */}
        <div className={styles.categories}>
          {categories.map((category, index) => (
            <motion.button
              key={category}
              className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              {category}
            </motion.button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className={styles.articlesGrid}>
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.id}
              className={styles.articleCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <div className={styles.articleTop}>
                <span className={styles.articleCategory}>{article.category}</span>
                <span className={styles.articleReadTime}>{article.readTime} min read</span>
              </div>
              
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleExcerpt}>{article.excerpt}</p>
              
              <div className={styles.articleBottom}>
                <div className={styles.articleAuthor}>
                  <div className={styles.authorAvatar}>
                    {article.author[0]}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{article.author}</span>
                    <span className={styles.articleDate}>{article.publishedAt}</span>
                  </div>
                </div>
                
                <Link href={`/articles/${article.id}`} className={styles.readMoreBtn}>
                  Read More
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className={styles.noResults}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No articles found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
