'use client';

import { motion } from 'framer-motion';
import { daysUntilRamadan, daysUntilEidAlFitr, daysUntilEidAlAdha, getUpcomingEvents } from '@/app/lib/islamic-dates';
import styles from './event-countdown.module.css';
import { useEffect, useState } from 'react';

export default function EventCountdown() {
  const [events, setEvents] = useState<any[]>([]);
  const [ramadanDays, setRamadanDays] = useState(0);
  const [eidFitrDays, setEidFitrDays] = useState(0);
  const [eidAdhaDays, setEidAdhaDays] = useState(0);

  useEffect(() => {
    setEvents(getUpcomingEvents().slice(0, 6));
    setRamadanDays(daysUntilRamadan());
    setEidFitrDays(daysUntilEidAlFitr());
    setEidAdhaDays(daysUntilEidAlAdha());
  }, []);

  const majorEvents = [
    { name: 'Ramadan', days: ramadanDays, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🌙' },
    { name: 'Eid al-Fitr', days: eidFitrDays, gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '🕌' },
    { name: 'Eid al-Adha', days: eidAdhaDays, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', icon: '🐑' },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Upcoming Events</h2>
      
      {/* Major Events */}
      <div className={styles.majorEventsGrid}>
        {majorEvents.map((event, idx) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={styles.majorEventCard}
            style={{ background: event.gradient }}
          >
            <div className={styles.eventIcon}>{event.icon}</div>
            <div className={styles.eventName}>{event.name}</div>
            <div className={styles.countdown}>
              <span className={styles.days}>{event.days}</span>
              <span className={styles.label}>days</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* All Upcoming Events */}
      <div className={styles.eventsGrid}>
        {events.map((event, idx) => (
          <motion.div
            key={event.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            className={styles.eventCard}
          >
            <div className={styles.eventDot} style={{ background: event.color }} />
            <div className={styles.eventInfo}>
              <h3>{event.name}</h3>
              <p className={styles.eventDesc}>{event.description}</p>
              <div className={styles.eventMeta}>
                <span>{event.date}</span>
                <span className={styles.daysAway}>
                  {event.daysUntil === 0 ? 'Today' : event.daysUntil === 1 ? 'Tomorrow' : `${event.daysUntil} days`}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
