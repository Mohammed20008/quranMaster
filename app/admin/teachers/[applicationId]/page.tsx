'use client';

import { sendEmail, generateAcceptanceEmail, generateRejectionEmail } from '@/app/lib/email-service';
import { useAuth } from '@/app/context/auth-context';
import { useTeachers } from '@/app/context/teacher-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import styles from '../../admin.module.css';

export default function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { getApplication, approveApplication, rejectApplication, getTeacherByEmail } = useTeachers();
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Unwrap params using React.use()
  const { applicationId } = use(params);
  const application = getApplication(applicationId);

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
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin || !application) return null;

  const handleApprove = async () => {
    if (confirm('Approve this teacher application?')) {
      setIsProcessing(true);
      try {
        approveApplication(applicationId, notes || undefined); // Use unwrapped applicationId
        
        const teacher = getTeacherByEmail(application.personalInfo.email);
        const profileUrl = teacher ? `${window.location.origin}${teacher.profileUrl}` : 'Profile URL pending';

        await sendEmail(
            application.personalInfo.email,
            'Application Approved - QuranMaster',
            generateAcceptanceEmail(application.personalInfo.name, profileUrl)
        );

        alert(`Application approved!\n\nEmail sent to ${application.personalInfo.email}`);
        router.push('/admin/teachers');
      } catch (error) {
        console.error(error);
        alert('Error approving application');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    if (confirm('Reject this application?')) {
        setIsProcessing(true);
        try {
            rejectApplication(applicationId, notes); // Use unwrapped applicationId
            
            await sendEmail(
                application.personalInfo.email,
                'Application Status - QuranMaster',
                generateRejectionEmail(application.personalInfo.name, notes)
            );

            alert('Application rejected.');
            router.push('/admin/teachers');
        } catch (error) {
            console.error(error);
            alert('Error rejecting application');
        } finally {
            setIsProcessing(false);
        }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin/teachers" className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1>Review Application</h1>
            <p className="text-sm opacity-80">Submitted on {new Date(application.submittedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </header>

      <main className={styles.main} style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Main Content Column */}
        <div className="space-y-6">
          {/* Personal Info Card */}
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 'bold' }}>
                  {application.personalInfo.name[0]}
               </div>
               <div>
                 <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.25rem' }}>{application.personalInfo.name}</h2>
                 <div style={{ display: 'flex', gap: '1rem', color: 'var(--foreground-secondary)' }}>
                    <span>{application.personalInfo.email}</span>
                    <span>•</span>
                    <span>{application.personalInfo.phone}</span>
                 </div>
               </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Bio</h3>
            <p style={{ lineHeight: '1.7', color: 'var(--foreground-secondary)' }}>{application.bio}</p>
          </section>

          {/* Demo Content Card */}
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
             <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <span style={{ fontSize: '1.5rem' }}>🎥</span> Demo Submissions
             </h3>
             
             <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                   <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2563eb' }}>Surah Maryam Recitation (Page 1)</div>
                   {application.demoRecitation ? (
                      <a href={application.demoRecitation} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}>
                        Open Link <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                   ) : <span style={{color: 'var(--text-secondary)'}}>Not provided</span>}
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                   <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#059669' }}>Iqlab Rule Explanation</div>
                   {application.demoLecture ? (
                      <a href={application.demoLecture} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                        Open Link <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                   ) : <span style={{color: 'var(--text-secondary)'}}>Not provided</span>}
                </div>
             </div>
          </section>

          {/* Qualifications & Teaching */}
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--foreground)' }}>Qualifications</h3>
                <div style={{ marginBottom: '1rem' }}>
                   <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--foreground-secondary)', marginBottom: '0.25rem' }}>Experience</div>
                   <div>{application.qualifications.experience}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                   <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--foreground-secondary)', marginBottom: '0.25rem' }}>Ijazah</div>
                   <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: application.qualifications.ijazah ? '#dcfce7' : '#f3f4f6', color: application.qualifications.ijazah ? '#166534' : '#374151', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>
                     {application.qualifications.ijazah ? '✓ Certified' : 'None'}
                   </div>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--foreground)' }}>Teaching Profile</h3>
                <div style={{ marginBottom: '1rem' }}>
                   <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--foreground-secondary)', marginBottom: '0.25rem' }}>Subjects</div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                     {application.teachingInfo.subjects.map(s => (
                       <span key={s} style={{ background: 'var(--secondary)', padding: '0.25rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.85rem' }}>{s}</span>
                     ))}
                   </div>
                </div>
                 <div style={{ marginBottom: '1rem' }}>
                   <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--foreground-secondary)', marginBottom: '0.25rem' }}>Hourly Rate</div>
                   <div style={{ fontWeight: '600', color: 'var(--primary)' }}>${application.teachingInfo.hourlyRate || 0}/hr</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Action Column */}
        <div className="space-y-6">
           <div style={{ position: 'sticky', top: '2rem' }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '1.5rem', padding: '1.5rem', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Admin Action</h3>
                <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.75rem', background: application.status === 'pending' ? '#fff7ed' : application.status === 'approved' ? '#f0fdf4' : '#fef2f2', color: application.status === 'pending' ? '#c2410c' : application.status === 'approved' ? '#15803d' : '#b91c1c', textAlign: 'center', fontWeight: 'bold', border: `1px solid ${application.status === 'pending' ? '#ffedd5' : application.status === 'approved' ? '#dcfce7' : '#fee2e2'}` }}>
                   Current Status: {application.status.toUpperCase()}
                </div>

                {application.status === 'pending' ? (
                  <>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes for the applicant..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        marginBottom: '1rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <button onClick={handleApprove} disabled={isProcessing} style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}>
                        {isProcessing ? 'Processing...' : 'Approve Application'}
                      </button>
                      <button onClick={handleReject} disabled={isProcessing} style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: 'none',
                        background: 'var(--surface)',
                        color: '#ef4444',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid #ef4444',
                        transition: 'background 0.2s'
                      }}>
                        Reject Application
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => router.push('/admin/teachers')} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--secondary)', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                    Back to List
                  </button>
                )}
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
