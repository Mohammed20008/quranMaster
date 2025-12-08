'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './learn.module.css';

const BookingModal = dynamic(() => import('./booking-modal'), { 
  ssr: false,
  loading: () => null 
});

const tajweedRules = [
  {
    title: 'Noon Sakinah',
    description: 'Rules regarding the pronunciation of Noon without a vowel.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v8"></path>
      </svg>
    )
  },
  {
    title: 'Meem Sakinah',
    description: 'Rules applying to the letter Meem when it has no vowel.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        <path d="M12 8v8"></path>
      </svg>
    )
  },
  {
    title: 'Madd (Elongation)',
    description: 'The act of prolonging the sound of a vowel letter.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h16"></path>
        <path d="M12 4v16"></path>
      </svg>
    )
  },
  {
    title: 'Qalb (Iqlab)',
    description: 'Changing the sound of Noon Sakinah into a Meem.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  }
];

const teachers = [
  {
    name: 'Sheikh Abdullah',
    specialty: 'Tajweed & Recitation',
    rating: 4.9,
    students: 120,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Abdullah'
  },
  {
    name: 'Ustadha Fatima',
    specialty: 'Memorization',
    rating: 5.0,
    students: 95,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Fatima'
  },
  {
    name: 'Qari Ahmed',
    specialty: 'Maqamat',
    rating: 4.8,
    students: 200,
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=Ahmed'
  }
];

export default function LearnPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Back to Quran
      </Link>

      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.title}>Master the Quran</h1>
        <p className={styles.subtitle}>
          Learn Tajweed rules, perfect your recitation, and connect with qualified teachers to guide your journey.
        </p>
      </div>

      {/* Recitation Session */}
      <div className={styles.practiceSection}>
        <div className={styles.practiceContent}>
          <h2 className={styles.practiceTitle}>Practice Lounge</h2>
          <p className={styles.practiceDesc}>
            Join a live session to practice your recitation with our real teachers. Customize your session and book now.
          </p>
          <button 
            className={styles.startSessionBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Book Session
          </button>
        </div>
        <div className={styles.practiceVisual}>
          <svg className={styles.micIcon} width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
            <line x1="8" y1="22" x2="16" y2="22"></line>
          </svg>
        </div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Tajweed Rules Section */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <svg className={styles.sectionIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <h2>Tajweed Essentials</h2>
        </div>
        <div className={styles.grid}>
          {tajweedRules.map((rule, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.cardIcon}>
                {rule.icon}
              </div>
              <h3 className={styles.cardTitle}>{rule.title}</h3>
              <p className={styles.cardDesc}>{rule.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Find Teachers Section */}
      <section className={styles.section}>
        <div className={styles.sectionTitle}>
          <svg className={styles.sectionIcon} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h2>Expert Teachers</h2>
        </div>
        <div className={styles.grid}>
          {teachers.map((teacher, idx) => (
            <div key={idx} className={styles.teacherCard}>
              <img src={teacher.avatar} alt={teacher.name} className={styles.avatar} />
              <div className={styles.teacherInfo}>
                <h3 className={styles.teacherName}>{teacher.name}</h3>
                <div className={styles.teacherMeta}>
                  <span>{teacher.specialty}</span>
                  <div className={styles.rating}>
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>{teacher.rating}</span>
                  </div>
                </div>
                <button className={styles.connectBtn}>Connect</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
