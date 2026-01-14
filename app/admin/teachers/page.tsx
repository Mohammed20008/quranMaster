'use client';

import { sendEmail, generateRejectionEmail } from '@/app/lib/email-service';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../admin.module.css';

export default function TeacherApplicationsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { applications, rejectApplication } = useTeachers();
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc'>('date-desc');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingAuth(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadingAuth && (!isAuthenticated || !isAdmin)) {
      router.push('/');
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

  // Stats for the header
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const filteredApplications = applications
    .filter(app => filter === 'all' || app.status === filter)
    .filter(app => 
      app.personalInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.personalInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.teachingInfo.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sortBy === 'date-asc') return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      if (sortBy === 'name-asc') return a.personalInfo.name.localeCompare(b.personalInfo.name);
      return 0;
    });

  const handleQuickReject = async (appId: string, personalInfo: any, reason: string) => {
    try {
      rejectApplication(appId, reason);
      const emailHtml = await generateRejectionEmail(personalInfo.name, reason);
      await sendEmail(
          personalInfo.email,
          'Update Regarding Your Application - QuranMaster',
          emailHtml
      );
      alert('Teacher application rejected and email sent.');
    } catch (error) {
       console.error(error);
       alert('Failed to process rejection');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1>Teacher Applications</h1>
            <p>Review and manage teacher requests</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--foreground-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Applications</div>
            <div style={{ fontSize: '2rem', fontWeight: '800' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#ec489915', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #ec489930' }}>
            <div style={{ color: '#db2777', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending Review</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#db2777' }}>{stats.pending}</div>
          </div>
          <div style={{ background: '#10b98115', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #10b98130' }}>
            <div style={{ color: '#059669', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Approved</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669' }}>{stats.approved}</div>
          </div>
          <div style={{ background: '#ef444415', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #ef444430' }}>
            <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Rejected</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626' }}>{stats.rejected}</div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem', 
          marginBottom: '1.5rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: filter === status ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: filter === status ? 'var(--primary)' : 'var(--surface)',
                  color: filter === status ? 'white' : 'var(--foreground)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', justifyContent: 'flex-end' }}>
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                color: 'var(--foreground)',
                flex: 1,
                maxWidth: '300px'
              }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                color: 'var(--foreground)',
                cursor: 'pointer'
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filteredApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--foreground-secondary)', background: 'var(--surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
            <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>No applications found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={styles.articleCard}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr auto',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/admin/teachers/${app.id}`)}
              >
                <div className={styles.articleInfo}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 700 }}>
                    {app.personalInfo.name}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--foreground-secondary)' }}>
                    {app.personalInfo.email}
                  </div>
                </div>
                
                <div style={{ fontSize: '0.9rem' }}>
                   <div style={{ color: 'var(--foreground-secondary)', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Submitted</div>
                   {new Date(app.submittedAt).toLocaleDateString()}
                </div>

                <div style={{ fontSize: '0.9rem' }}>
                   <div style={{ color: 'var(--foreground-secondary)', marginBottom: '0.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teaches</div>
                   <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                    {app.teachingInfo.subjects.slice(0, 2).join(', ')}{app.teachingInfo.subjects.length > 2 && '...'}
                   </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      background: app.status === 'pending' ? 'rgba(236, 72, 153, 0.1)' : 
                                 app.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                 'rgba(156, 163, 175, 0.1)',
                      color: app.status === 'pending' ? '#ec4899' : 
                            app.status === 'approved' ? '#10b981' : 
                            '#9ca3af',
                      textTransform: 'capitalize',
                      minWidth: '100px',
                      textAlign: 'center'
                    }}
                  >
                    {app.status}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // If already rejected, do nothing or show different logic
                        if (app.status === 'rejected') return;

                        if(confirm('Are you sure you want to remove/reject this teacher?')) {
                          const reason = prompt("Enter reason for rejection/removal:");
                          if (reason) {
                             // We need to use rejectApplication from context
                             // Since we are inside the map, we need to call the function
                             // But we need to make sure we have access to it.
                             // We will implement a handleQuickReject function in the component.
                             handleQuickReject(app.id, app.personalInfo, reason);
                          }
                        }
                      }}
                      title="Reject / Remove"
                      style={{
                        padding: '0.4rem',
                        borderRadius: '0.5rem',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: 'none',
                        cursor: 'pointer',
                        display: app.status === 'rejected' ? 'none' : 'block'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--foreground-secondary)'}}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
