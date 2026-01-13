'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './sunnah.module.css';
import FeaturedHadith from '../components/sunnah/featured-hadith';

interface Collection {
  id: string;
  category: string;
  name: string;
  arabicName: string;
  author: string;
  description: string;
  hadithCount: number;
  chapterCount: number;
}

// Featured Hadiths rotation
const featuredHadiths = [
  {
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english: "Actions are judged by intentions, and every person will get the reward according to what they intended.",
    narrator: 'Umar bin Al-Khattab',
    reference: 'Sahih Al-Bukhari, Book 1, Hadith 1'
  },
  {
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    english: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    narrator: 'Abu Huraira',
    reference: 'Sahih Al-Bukhari, Book 78, Hadith 158'
  },
  {
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    english: "A Muslim is the one from whose tongue and hands the Muslims are safe.",
    narrator: 'Abdullah bin Amr',
    reference: 'Sahih Al-Bukhari, Book 10, Hadith 10'
  }
];

export default function SunnahPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Use date to deterministically select hadith (avoids hydration mismatch)
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const featuredHadith = featuredHadiths[dayOfYear % featuredHadiths.length];

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    filterCollections();
  }, [searchQuery, selectedCategory, collections]);

  const loadCollections = async () => {
    try {
      const res = await fetch('/api/sunnah');
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Failed to load collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = () => {
    let filtered = collections;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.arabicName.includes(searchQuery) ||
        c.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCollections(filtered);
  };

  const categories = [
    { id: 'all', name: 'All Collections' },
    { id: 'the_9_books', name: 'The Nine Books' },
    { id: 'forties', name: 'Forty Hadiths' },
    { id: 'other_books', name: 'Other Collections' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'the_9_books':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        );
      case 'forties':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        );
    }
  };

  return (
    <div className={styles.sunnahContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className={styles.backLink}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div>
              <h1 className={styles.pageTitle}>Sunnah & Hadith</h1>
              <p className={styles.pageSubtitle}>Authentic Collections</p>
            </div>
          </div>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Hadith */}
        <FeaturedHadith hadith={featuredHadith} />

        {/* Stats */}
        <div className={styles.statsGrid}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statCard}
          >
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div className={styles.statValue}>{collections.length}</div>
            <div className={styles.statLabel}>Collections</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.statCard}
          >
            <div className={styles.statIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className={styles.statValue}>
              {collections.reduce((acc, c) => acc + c.hadithCount, 0).toLocaleString()}
            </div>
            <div className={styles.statLabel}>Total Hadiths</div>
          </motion.div>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.categoryTabActive : ''}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading collections...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.collectionsGrid}
          >
            {filteredCollections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/sunnah/${collection.category}/${collection.id}`}
                  className={styles.collectionCard}
                >
                  <div className={styles.cardGlow}></div>
                  
                  <div className={styles.cardHeader}>
                    <div className={styles.collectionIcon}>
                      {getCategoryIcon(collection.category)}
                    </div>
                    <div className={styles.collectionCount}>
                      {collection.hadithCount.toLocaleString()}
                    </div>
                  </div>

                  <h2 className={styles.collectionTitle}>{collection.name}</h2>
                  <h3 className={styles.collectionArabic}>{collection.arabicName}</h3>
                  
                  {collection.author && (
                    <div className={styles.collectionAuthor}>by {collection.author}</div>
                  )}
                  
                  <p className={styles.collectionDescription}>
                    {collection.description || `${collection.chapterCount} chapters available`}
                  </p>

                  <div className={styles.collectionFooter}>
                    <span>Explore Collection</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredCollections.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>No collections found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
