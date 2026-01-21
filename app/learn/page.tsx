'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import styles from './learn.module.css';
import { useTeachers } from '@/app/context/teacher-context';
import { Teacher } from '@/types/teacher';
import { renderAvatar, getAvatarPreset } from '@/app/components/avatar/avatar-utils';

const BookingModal = dynamic(() => import('./booking-modal'), { 
  ssr: false,
  loading: () => null 
});

export default function LearnPage() {
  const { teachers: allTeachers } = useTeachers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'students' | 'newest'>('rating');

  // Get unique subjects from all teachers
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();
    allTeachers.forEach(teacher => {
      teacher.subjects.forEach(subject => subjectSet.add(subject));
    });
    return Array.from(subjectSet);
  }, [allTeachers]);

  // Filter and sort teachers
  const filteredTeachers = useMemo(() => {
    let filtered = allTeachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           teacher.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || teacher.subjects.includes(selectedSubject);
      return matchesSearch && matchesSubject;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      if (sortBy === 'newest') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      return 0;
    });

    return filtered;
  }, [allTeachers, searchQuery, selectedSubject, sortBy]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Home
      </Link>

      {/* Hero Section */}
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>Find Your Perfect Quran Teacher</h1>
        <p className={styles.subtitle}>
          Connect with certified teachers who will guide you through Tajweed, memorization, and understanding the divine message.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <div className={styles.heroStatValue}>{allTeachers.length}</div>
            <div className={styles.heroStatLabel}>Certified Teachers</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatValue}>{allTeachers.reduce((sum, t) => sum + (t.students || 0), 0)}</div>
            <div className={styles.heroStatLabel}>Active Students</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatValue}>
              {allTeachers.length > 0 ? (allTeachers.reduce((sum, t) => sum + t.rating, 0) / allTeachers.length).toFixed(1) : '0'}★
            </div>
            <div className={styles.heroStatLabel}>Average Rating</div>
          </div>
        </div>
      </motion.div>

      {/* Apply as Teacher CTA */}
      <motion.div 
        className={styles.teacherCta}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.teacherCtaContent}>
          <div className={styles.teacherCtaIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
              <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
            </svg>
          </div>
          <div>
            <h3>Interested in Teaching?</h3>
            <p>Share your knowledge and inspire students worldwide</p>
          </div>
        </div>
        <Link href="/learn/join-teacher" className={styles.teacherCtaBtn}>
          Apply as Teacher
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </Link>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className={styles.filters}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.searchBar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text"
            placeholder="Search teachers by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Subject:</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="rating">Highest Rated</option>
            <option value="students">Most Popular</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <div className={styles.resultsCount}>
        {filteredTeachers.length === 0 ? (
          <p>No teachers found matching your criteria</p>
        ) : (
          <p>Showing {filteredTeachers.length} {filteredTeachers.length === 1 ? 'teacher' : 'teachers'}</p>
        )}
      </div>

      {/* Teachers Grid */}
      {filteredTeachers.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>No Teachers Found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {/* Featured Teachers Section */}
          {searchQuery === '' && selectedSubject === 'all' && sortBy === 'rating' && (
            <motion.div 
              className={styles.featuredSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={styles.featuredHeader}>
                <div className={styles.featuredBadge}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Featured Teachers
                </div>
                <h2>Top Rated Educators</h2>
                <p>Our highest-rated teachers with exceptional student feedback</p>
              </div>
              
              <div className={styles.featuredGrid}>
                {filteredTeachers.slice(0, 3).map((teacher, idx) => (
                  <Link key={teacher.id} href={teacher.profileUrl} className={styles.featuredCard}>
                    <div className={styles.featuredRank}>#{idx + 1}</div>
                    <div className={styles.featuredAvatar}>
                      {teacher.photo ? (
                        <img src={teacher.photo} alt={teacher.name} className={styles.featuredAvatarImg} />
                      ) : (
                        renderAvatar(getAvatarPreset(teacher.avatarId), teacher.name, 80)
                      )}
                      {teacher.verified && (
                        <div className={styles.featuredVerified}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3>{teacher.name}</h3>
                    <div className={styles.featuredRating}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {teacher.rating.toFixed(1)} • {teacher.students || 0} students
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* All Teachers Grid */}
          <div className={styles.teachersGrid}>
            {filteredTeachers.map((teacher, idx) => (
              <motion.div 
                key={teacher.id}
                className={styles.teacherCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={teacher.profileUrl} className={styles.teacherCardLink}>
                  {/* Avatar */}
                  <div className={styles.teacherAvatar}>
                    {teacher.photo ? (
                      <img src={teacher.photo} alt={teacher.name} className={styles.avatarImage} />
                    ) : (
                      <div className={styles.avatarWrapper}>
                        {renderAvatar(getAvatarPreset(teacher.avatarId), teacher.name, 100)}
                      </div>
                    )}
                    {teacher.verified && (
                      <div className={styles.verifiedBadge} title="Verified Teacher">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={styles.teacherCardContent}>
                    <h3 className={styles.teacherName}>{teacher.name}</h3>
                    
                    <div className={styles.teacherMeta}>
                      <div className={styles.teacherRating}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{teacher.rating.toFixed(1)}</span>
                      </div>
                      <div className={styles.teacherStudents}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>{teacher.students || 0} students</span>
                      </div>
                    </div>

                    <p className={styles.teacherBio} title={teacher.bio}>
                      {teacher.bio.length > 100 ? teacher.bio.substring(0, 100) + '...' : teacher.bio}
                    </p>

                    <div className={styles.teacherSubjects}>
                      {teacher.subjects.slice(0, 3).map((subject, i) => (
                        <span key={i} className={styles.subjectTag}>{subject}</span>
                      ))}
                      {teacher.subjects.length > 3 && (
                        <span className={styles.subjectTag}>+{teacher.subjects.length - 3}</span>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.viewProfile}>
                        View Profile 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
