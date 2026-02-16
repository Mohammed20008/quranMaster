'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminUsersPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin" className={styles.backBtn}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1>User Management</h1>
              <p>View and manage registered users</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.emptyState} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '4rem 2rem',
          background: 'var(--card-bg)',
          borderRadius: '20px',
          border: '1px solid var(--border)'
        }}>
          <Users size={48} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3>No records found</h3>
          <p>User management interface is under maintenance.</p>
        </div>
      </main>
    </div>
  );
}
