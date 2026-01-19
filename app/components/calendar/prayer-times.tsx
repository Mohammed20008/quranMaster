'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '@/app/calendar/calendar.module.css';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimesCard() {
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('London'); // Default

  useEffect(() => {
    async function fetchPrayerTimes() {
      try {
        // In a real app, we'd use geolocation
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=UK&method=2`);
        const data = await res.json();
        setTimings(data.data.timings);
      } catch (error) {
        console.error('Failed to fetch prayer times', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrayerTimes();
  }, [city]);

  if (loading) return <div className={styles.sideCard}>Loading prayer times...</div>;
  if (!timings) return null;

  const prayerNames = [
    { key: 'Fajr', icon: '🌅' },
    { key: 'Sunrise', icon: '☀️' },
    { key: 'Dhuhr', icon: '🌤️' },
    { key: 'Asr', icon: '⛅' },
    { key: 'Maghrib', icon: '🌆' },
    { key: 'Isha', icon: '🌙' },
  ];

  return (
    <div className={styles.sideCard}>
      <h3>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20" />
        </svg>
        Prayer Times
      </h3>
      <div className="space-y-1">
        {prayerNames.map(({ key, icon }) => (
          <div key={key} className={styles.prayerRow}>
            <span className={styles.prayerName}>{icon} {key}</span>
            <span className={styles.prayerTime}>{timings[key as keyof PrayerTimes]}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-500 mt-4 text-center">Location: {city}, UK</p>
    </div>
  );
}
