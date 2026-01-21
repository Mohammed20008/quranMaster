'use client';

import { motion } from 'framer-motion';
import { 
  daysUntilRamadan, 
  daysUntilEidAlFitr, 
  daysUntilEidAlAdha, 
  getUpcomingEvents,
  daysUntilHijriDate,
  daysUntilGregorianDate 
} from '@/app/lib/islamic-dates';
import styles from './event-countdown.module.css';
import { useEffect, useState } from 'react';
import { UserEvent } from '@/types/calendar';
// @ts-ignore
import moment from 'moment-hijri';

interface EventCountdownProps {
  customEvents?: UserEvent[];
}

export default function EventCountdown({ customEvents = [] }: EventCountdownProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [ramadanDays, setRamadanDays] = useState(0);
  const [eidFitrDays, setEidFitrDays] = useState(0);
  const [eidAdhaDays, setEidAdhaDays] = useState(0);

  useEffect(() => {
    // Built-in events
    const islamicEvents = getUpcomingEvents();
    
    // Process custom events
    const processedCustom = customEvents.map(e => {
        let daysUntil = 0;
        let eventDate = '';
        
        if (e.type === 'hijri' && e.hijriMonth && e.hijriDay) {
            daysUntil = daysUntilHijriDate(e.hijriMonth, e.hijriDay);
            const now = moment();
            let date = moment(`${now.iYear()}/${e.hijriMonth}/${e.hijriDay}`, 'iYYYY/iM/iD');
            if (date.isBefore(now, 'day')) {
                date = moment(`${now.iYear() + 1}/${e.hijriMonth}/${e.hijriDay}`, 'iYYYY/iM/iD');
            }
            eventDate = date.format('MMMM D, YYYY');
        } else if (e.type === 'gregorian' && e.gregorianMonth && e.gregorianDay) {
            daysUntil = daysUntilGregorianDate(e.gregorianMonth, e.gregorianDay);
            let date = moment().month(e.gregorianMonth - 1).date(e.gregorianDay);
            if (date.isBefore(moment(), 'day')) {
                date.add(1, 'year');
            }
            eventDate = date.format('MMMM D, YYYY');
        }
        
        return {
            name: e.name,
            description: e.description,
            color: e.color,
            daysUntil,
            date: eventDate,
            isCustom: true
        };
    });

    // Merge and sort
    const allEvents = [...islamicEvents, ...processedCustom]
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 8); // Show more since we have custom ones
        
    setEvents(allEvents);
    setRamadanDays(daysUntilRamadan());
    setEidFitrDays(daysUntilEidAlFitr());
    setEidAdhaDays(daysUntilEidAlAdha());
  }, [customEvents]);

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
              <div className="flex items-center gap-2">
                <h3>{event.name}</h3>
                {event.isCustom && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">User Event</span>}
              </div>
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
