'use client';

import { useAuth } from '@/app/context/auth-context';
import { useMessages } from '@/app/context/messages-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../admin.module.css';

export default function AdminMessagesPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { getSupportRequests } = useMessages();
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded'>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
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

  const supportRequests = getSupportRequests();
  const filteredRequests = supportRequests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div>
              <h1>User Messages</h1>
              <p>Manage support requests and conversations</p>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.articlesSection}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: filter === 'all' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: filter === 'all' ? 'var(--primary)' : 'var(--surface)',
                color: filter === 'all' ? 'white' : 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              All ({supportRequests.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: filter === 'pending' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: filter === 'pending' ? 'var(--primary)' : 'var(--surface)',
                color: filter === 'pending' ? 'white' : 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Pending ({supportRequests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('responded')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: filter === 'responded' ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: filter === 'responded' ? 'var(--primary)' : 'var(--surface)',
                color: filter === 'responded' ? 'white' : 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Responded ({supportRequests.filter(r => r.status === 'responded').length})
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--foreground-secondary)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3 style={{ marginBottom: '0.5rem' }}>No messages yet</h3>
              <p>Support requests will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request, idx) => (
                <motion.div
                  key={request.conversationId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={styles.articleCard}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => router.push(`/admin/messages/${request.conversationId}`)}
                >
                  <div className={styles.articleInfo}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      {request.userName}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--foreground-secondary)', marginBottom: '0.5rem' }}>
                      <span>{request.userEmail}</span>
                      <span>{new Date(request.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: 'var(--foreground-secondary)', marginTop: '0.5rem' }}>
                      {request.message.length > 100 ? request.message.substring(0, 100) + '...' : request.message}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        background: request.status === 'pending' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        color: request.status === 'pending' ? '#ef4444' : '#22c55e',
                      }}
                    >
                      {request.status === 'pending' ? 'Pending' : 'Responded'}
                    </span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
