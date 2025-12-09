'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './admin.module.css';
import { useAuth } from '@/app/context/auth-context';

// Types
interface VisitorStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  status: 'draft' | 'published';
  category: string;
}

interface DashboardStats {
  visitors: VisitorStats;
  articles: number;
  users: number;
  bookmarks: number;
}

// Mock data for demonstration
const mockStats: DashboardStats = {
  visitors: {
    total: 15842,
    today: 234,
    thisWeek: 1567,
    thisMonth: 5432
  },
  articles: 12,
  users: 456,
  bookmarks: 2341
};

const mockRecentArticles: Article[] = [
  {
    id: '1',
    title: 'The Importance of Dhikr in Daily Life',
    excerpt: 'Exploring the spiritual benefits of remembrance of Allah...',
    author: 'Admin',
    publishedAt: '2025-12-08',
    status: 'published',
    category: 'Spirituality'
  },
  {
    id: '2',
    title: 'Etiquettes of Reading Quran',
    excerpt: 'A comprehensive guide on the manners to observe when reciting...',
    author: 'Admin',
    publishedAt: '2025-12-07',
    status: 'published',
    category: 'Quran'
  },
  {
    id: '3',
    title: 'Understanding Tafsir: A Beginner Guide',
    excerpt: 'Introduction to the science of Quranic exegesis...',
    author: 'Admin',
    publishedAt: '2025-12-06',
    status: 'draft',
    category: 'Education'
  }
];

const mockVisitorData = [
  { day: 'Mon', visitors: 180 },
  { day: 'Tue', visitors: 220 },
  { day: 'Wed', visitors: 195 },
  { day: 'Thu', visitors: 280 },
  { day: 'Fri', visitors: 350 },
  { day: 'Sat', visitors: 290 },
  { day: 'Sun', visitors: 234 }
];

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentArticles, setRecentArticles] = useState<Article[]>(mockRecentArticles);
  const [visitorData] = useState(mockVisitorData);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and admin role
  useEffect(() => {
    // Wait a bit for auth to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (!isAdmin) {
        // Redirect non-admin users to dashboard
        router.push('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className={styles.loading}>
        <div className={styles.accessDenied}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
          <Link href="/" className={styles.backHomeBtn}>Go Back Home</Link>
        </div>
      </div>
    );
  }

  const maxVisitors = Math.max(...visitorData.map(d => d.visitors));

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
              <h1>Admin Dashboard</h1>
              <p>Manage your Quran app</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <Link href="/admin/articles/new" className={styles.newArticleBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Article
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Stats Grid */}
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Overview</h2>
          <div className={styles.statsGrid}>
            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.visitors.total.toLocaleString()}</span>
                <span className={styles.statLabel}>Total Visitors</span>
                <span className={styles.statChange}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  +{stats.visitors.today} today
                </span>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.articles}</span>
                <span className={styles.statLabel}>Published Articles</span>
                <span className={styles.statChange}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  +3 this week
                </span>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.users}</span>
                <span className={styles.statLabel}>Registered Users</span>
                <span className={styles.statChange}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  +12 this month
                </span>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.bookmarks.toLocaleString()}</span>
                <span className={styles.statLabel}>Total Bookmarks</span>
                <span className={styles.statChange}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                  +89 today
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Charts and Recent Articles */}
        <div className={styles.contentGrid}>
          {/* Visitor Chart */}
          <motion.section 
            className={styles.chartSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className={styles.sectionTitle}>Weekly Visitors</h2>
            <div className={styles.chart}>
              {visitorData.map((data, index) => (
                <div key={data.day} className={styles.chartBar}>
                  <div 
                    className={styles.bar}
                    style={{ 
                      height: `${(data.visitors / maxVisitors) * 100}%`,
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span className={styles.barValue}>{data.visitors}</span>
                  </div>
                  <span className={styles.barLabel}>{data.day}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Recent Articles */}
          <motion.section 
            className={styles.articlesSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className={styles.articlesSectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Articles</h2>
              <Link href="/admin/articles" className={styles.viewAllLink}>
                View All
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className={styles.articlesList}>
              {recentArticles.map((article) => (
                <div key={article.id} className={styles.articleCard}>
                  <div className={styles.articleInfo}>
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleCategory}>{article.category}</span>
                      <span className={styles.articleDate}>{article.publishedAt}</span>
                    </div>
                  </div>
                  <div className={styles.articleActions}>
                    <span className={`${styles.articleStatus} ${article.status === 'published' ? styles.published : styles.draft}`}>
                      {article.status}
                    </span>
                    <button className={styles.editBtn}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Quick Actions */}
        <motion.section 
          className={styles.quickActions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/articles/new" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <span>Create Article</span>
            </Link>
            <Link href="/admin/articles" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <span>Manage Articles</span>
            </Link>
            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span>Manage Users</span>
            </button>
            <button className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </div>
              <span>Settings</span>
            </button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
