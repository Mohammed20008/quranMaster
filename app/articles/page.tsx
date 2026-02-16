'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Clock } from 'lucide-react';
import styles from '../learn/learn.module.css'; // Reusing learn styles or could use admin styles

export default function ArticlesPage() {
  const articles = [
    {
      id: 1,
      title: 'The Importance of Tajweed',
      excerpt: 'Learn why proper pronunciation is essential for every Muslim reciting the Holy Quran.',
      date: 'Mar 15, 2024',
      readTime: '5 min',
      category: 'Learning'
    },
    {
      id: 2,
      title: 'Tips for Quran Memorization',
      excerpt: 'Practical techniques and spiritual advice to help you on your journey of Hifz.',
      date: 'Mar 12, 2024',
      readTime: '8 min',
      category: 'Hifz'
    },
    {
      id: 3,
      title: 'History of Quranic Scripts',
      excerpt: 'Explore how the written form of the Quran evolved from the time of the Sahaba to today.',
      date: 'Mar 10, 2024',
      readTime: '12 min',
      category: 'History'
    }
  ];

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink} style={{ margin: '2rem' }}>
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      <section className={styles.hero} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h1 className={styles.title}>Spiritual Insights & Learning</h1>
        <p className={styles.subtitle}>Explore articles on Quran, Tajweed, and Islamic knowledge.</p>
      </section>

      <main className={styles.main} style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div className={styles.searchBar} style={{ marginBottom: '3rem' }}>
          <Search size={20} />
          <input type="text" placeholder="Search articles..." className={styles.searchInput} />
        </div>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {articles.map((article, i) => (
            <motion.div 
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'var(--card-bg)',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary-dark)', 
                  padding: '4px 12px', 
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}>
                  {article.category}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--foreground-secondary)' }}>
                  <Clock size={12} /> {article.readTime}
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>{article.title}</h2>
              <p style={{ color: 'var(--foreground-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>{article.excerpt}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--foreground-secondary)' }}>{article.date}</span>
                <button style={{ color: 'var(--primary)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Read More →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
