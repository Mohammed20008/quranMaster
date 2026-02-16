'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/auth-context';
import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  BookOpen, 
  LayoutDashboard, 
  ArrowLeft,
  Settings,
  Bell,
  TrendingUp,
  Plus
} from 'lucide-react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin - in a real app this would be more robust
    if (user?.role === 'admin' || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      setIsAdmin(true);
    }
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.accessDenied}>
        <div style={{ transform: 'scale(2)', marginBottom: '1rem' }}>🔒</div>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <Link href="/" className={styles.backHomeBtn}>
          Back to Home
        </Link>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: '1,284', icon: <Users />, change: '+12%', color: '#3b82f6' },
    { label: 'Active Teachers', value: '42', icon: <UserCheck />, change: '+5%', color: '#10b981' },
    { label: 'Pending Apps', value: '7', icon: <MessageSquare />, change: '-2', color: '#f59e0b' },
    { label: 'Total Articles', value: '156', icon: <BookOpen />, change: '+8%', color: '#8b5cf6' },
  ];

  const recentArticles = [
    { id: 1, title: 'Understanding Tajweed Rules', category: 'Learning', date: '2024-03-15', status: 'published' },
    { id: 2, title: 'Benefits of Memorization', category: 'Spiritual', date: '2024-03-14', status: 'published' },
    { id: 3, title: 'New Teacher Onboarding', category: 'Admin', date: '2024-03-12', status: 'draft' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.backBtn}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1>Admin Control Center</h1>
              <p>Welcome back, {user?.name || 'Administrator'}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.iconBtn} style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <Bell size={20} />
            </button>
            <Link href="/articles/new" className={styles.newArticleBtn}>
              <Plus size={18} />
              <span>New Article</span>
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Quick Stats */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                className={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.statIcon} style={{ background: stat.color }}>
                  {stat.icon}
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                  <div className={styles.statChange}>
                    <TrendingUp size={14} />
                    {stat.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <div className={styles.contentGrid}>
          {/* User Growth Chart Placeholder */}
          <section className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>User Growth</h2>
            <div className={styles.chart}>
              {[60, 45, 80, 55, 90, 70, 85].map((val, i) => (
                <div key={i} className={styles.chartBar}>
                  <div className={styles.bar} style={{ height: `${val}%` }}>
                    <span className={styles.barValue}>{val}%</span>
                  </div>
                  <span className={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Articles */}
          <section className={styles.articlesSection}>
            <div className={styles.articlesSectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Articles</h2>
              <Link href="/admin/articles" className={styles.viewAllLink}>
                View All
              </Link>
            </div>
            <div className={styles.articlesList}>
              {recentArticles.map((article) => (
                <div key={article.id} className={styles.articleCard}>
                  <div className={styles.articleInfo}>
                    <h3>{article.title}</h3>
                    <div className={styles.articleMeta}>
                      <span className={styles.articleCategory}>{article.category}</span>
                      <span className={styles.articleDate}>{article.date}</span>
                    </div>
                  </div>
                  <div className={styles.articleActions}>
                    <span className={`${styles.articleStatus} ${styles[article.status]}`}>
                      {article.status}
                    </span>
                    <button className={styles.editBtn}>
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quick Actions */}
        <section className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Management</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/teachers" className={styles.actionCard}>
              <div className={styles.actionIcon}><UserCheck /></div>
              <span>Teachers</span>
            </Link>
            <Link href="/admin/users" className={styles.actionCard}>
              <div className={styles.actionIcon}><Users /></div>
              <span>Users</span>
            </Link>
            <Link href="/admin/messages" className={styles.actionCard}>
              <div className={styles.actionIcon}><MessageSquare /></div>
              <span>Messages</span>
            </Link>
            <Link href="/admin/settings" className={styles.actionCard}>
              <div className={styles.actionIcon}><Settings /></div>
              <span>System</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
