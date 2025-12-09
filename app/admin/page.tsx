'use client';

import { useAuth } from '@/app/context/auth-context';
import { useArticles } from '@/app/context/article-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './admin.module.css';

// Types and Mocks
interface VisitorStats {
  total: number;
  today: number;
}

const mockStatsData = {
  visitors: {
    total: 15842,
    today: 234,
  },
  users: 456,
  bookmarks: 2341
};

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { articles, deleteArticle } = useArticles();
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Check authentication and admin role
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) {
        router.push('/');
      } else if (!isAdmin) {
        router.push('/dashboard');
      }
    }
  }, [isLoadingAuth, isAuthenticated, isAdmin, router]);

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

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
                <span className={styles.statValue}>{mockStatsData.visitors.total.toLocaleString()}</span>
                <span className={styles.statLabel}>Total Visitors</span>
                <span className={styles.statChange}>+{mockStatsData.visitors.today} today</span>
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
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{articles.length}</span>
                <span className={styles.statLabel}>Published Articles</span>
                <span className={styles.statChange}>From Database</span>
              </div>
            </motion.div>

            <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{mockStatsData.users}</span>
                <span className={styles.statLabel}>Users</span>
                <span className={styles.statChange}>Active Now</span>
              </div>
            </motion.div>

             <motion.div 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{mockStatsData.bookmarks.toLocaleString()}</span>
                <span className={styles.statLabel}>Bookmarks</span>
                <span className={styles.statChange}>Global</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recent Articles */}
        <section className={styles.articlesSection}>
          <div className={styles.articlesSectionHeader}>
            <h2 className={styles.sectionTitle}>Manage Articles</h2>
          </div>
          
          <div className="grid gap-4">
             {articles.map((article) => (
                <div key={article.id} className={styles.articleCard} style={{flexDirection: 'row', alignItems:'center', justifyContent:'space-between', padding:'1.5rem'}}>
                  <div className={styles.articleInfo}>
                    <h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>{article.title}</h3>
                    <div className={styles.articleMeta} style={{display:'flex', gap:'1rem', fontSize:'0.9rem', color:'var(--foreground-secondary)'}}>
                       <span style={{background:'var(--secondary)', padding:'0.2rem 0.6rem', borderRadius:'0.5rem'}}>{article.category}</span>
                       <span>{article.author}</span>
                       <span>{article.publishedAt}</span>
                       <span style={{color: article.status === 'published' ? '#10b981' : '#f59e0b', fontWeight:'bold'}}>{article.status}</span>
                    </div>
                  </div>
                  <div className={styles.articleActions} style={{display:'flex', gap:'0.5rem'}}>
                     <Link href={`/admin/articles/${article.id}`} className={styles.editBtn} style={{textDecoration:'none', color:'inherit', padding:'0.5rem', borderRadius:'0.5rem', border:'1px solid var(--border)'}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                     </Link>
                     <button 
                       onClick={() => {
                         if(confirm('Are you sure you want to delete this article?')) {
                           deleteArticle(article.id);
                         }
                       }}
                       className={styles.editBtn} 
                       style={{color:'#ef4444', padding:'0.5rem', borderRadius:'0.5rem', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.1)', cursor:'pointer'}}
                     >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                           <polyline points="3 6 5 6 21 6"/>
                           <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                     </button>
                  </div>
                </div>
             ))}
          </div>
        </section>
      </main>
    </div>
  );
}
