'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getCurrentHijriDate, HIJRI_MONTHS } from '@/app/lib/islamic-dates';
import EventCountdown from '@/app/components/calendar/event-countdown';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const [hijriDate, setHijriDate] = useState({ year: 1445, month: 1, day: 1, monthName: 'Muharram' });
  const [gregorianDate, setGregorianDate] = useState(new Date());

  useEffect(() => {
    setHijriDate(getCurrentHijriDate());
    setGregorianDate(new Date());
  }, []);

  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className={styles.container}>
      {/* Background Pattern */}
      <div className={styles.patternBg}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern-cal" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 L40 0 L80 40 L40 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.5"/>
              <rect x="38" y="38" width="4" height="4" transform="rotate(45 40 40)" fill="currentColor"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern-cal)" />
        </svg>
        <div className={styles.patternOverlay}></div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1>Islamic Calendar</h1>
            <p>Hijri & Gregorian Dates</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Current Date Display */}
        <section className={styles.dateSection}>
          <motion.div
            className={styles.hijriCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.dateLabel}>Hijri Date</div>
            <div className={styles.dateValue}>
              <span className={styles.day}>{hijriDate.day}</span>
              <span className={styles.month}>{hijriDate.monthName}</span>
              <span className={styles.year}>{hijriDate.year} AH</span>
            </div>
            <div className={styles.crescent}>🌙</div>
          </motion.div>

          <motion.div
            className={styles.gregorianCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.dateLabel}>Gregorian Date</div>
            <div className={styles.dateValue}>
              <span className={styles.day}>{gregorianDate.getDate()}</span>
              <span className={styles.month}>
                {gregorianDate.toLocaleDateString('en-US', { month: 'long' })}
              </span>
              <span className={styles.year}>{gregorianDate.getFullYear()} AD</span>
            </div>
          </motion.div>
        </section>

        {/* Event Countdown */}
        <section className={styles.eventsSection}>
          <EventCountdown />
        </section>

        {/* Month Calendar */}
        <section className={styles.calendarSection}>
          <h2 className={styles.sectionTitle}>{hijriDate.monthName} {hijriDate.year}</h2>
          <div className={styles.calendarGrid}>
            {monthDays.map((day, idx) => (
              <motion.div
                key={day}
                className={`${styles.dayCell} ${day === hijriDate.day ? styles.today : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
              >
                {day}
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
