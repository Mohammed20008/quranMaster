'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// @ts-ignore
import moment from 'moment-hijri';
import { getCurrentHijriDate, HIJRI_MONTHS, ISLAMIC_EVENTS, IslamicEvent } from '@/app/lib/islamic-dates';
import EventCountdown from '@/app/components/calendar/event-countdown';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment()); // Tracks the view (month)
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: IslamicEvent[] } | null>(null);

  // Hijri Date of the *current view's* month
  const hijriYear = currentDate.iYear();
  const hijriMonthIndex = currentDate.iMonth(); // 0-indexed
  const hijriMonthName = HIJRI_MONTHS[hijriMonthIndex];
  
  // Calculate grid
  const startOfMonth = moment(currentDate).startOf('iMonth');
  const endOfMonth = moment(currentDate).endOf('iMonth');
  const daysInMonth = currentDate.iDaysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

  // Today for highlighting
  const today = moment();
  const isCurrentMonth = today.iMonth() === hijriMonthIndex && today.iYear() === hijriYear;

  const prevMonth = () => setCurrentDate(moment(currentDate).subtract(1, 'iMonth'));
  const nextMonth = () => setCurrentDate(moment(currentDate).add(1, 'iMonth'));

  // Get events for this month
  const getEventsForDay = (day: number) => {
    return ISLAMIC_EVENTS.filter(e => e.hijriMonth === hijriMonthIndex + 1 && e.hijriDay === day);
  };

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

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1>Islamic Calendar</h1>
            <p>Hijri 1445 - 1446</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.eventsSection}>
            <EventCountdown />
        </section>

        <section className={styles.calendarSection}>
          <div className="flex justify-between items-center mb-6">
             <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
             </button>
             <h2 className="text-2xl font-bold text-center w-full">{hijriMonthName} {hijriYear}</h2>
             <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
             </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2 text-center text-sm font-semibold text-gray-500">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
          </div>

          <div className={styles.calendarGrid} style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells for padding */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
               const day = i + 1;
               const events = getEventsForDay(day);
               const isToday = isCurrentMonth && today.iDate() === day;
               const isSelected = selectedDay?.day === day;

               return (
                <motion.div
                  key={day}
                  onClick={() => setSelectedDay({ day, events })}
                  className={`
                    aspect-square rounded-xl border flex flex-col items-center justify-between p-2 cursor-pointer transition-all
                    ${isToday ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-gray-100 hover:border-[#d4af37]/50'}
                    ${isSelected ? 'ring-2 ring-[#d4af37] bg-white dark:bg-gray-800 shadow-lg z-10' : 'bg-white/50 backdrop-blur-sm'}
                  `}
                  whileHover={{ scale: 1.05 }}
                  layoutId={`day-${day}`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-[#d4af37]' : ''}`}>{day}</span>
                  <div className="flex gap-1">
                     {events.map((e, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} title={e.name} />
                     ))}
                  </div>
                </motion.div>
               );
            })}
          </div>
          
          <AnimatePresence>
            {selectedDay && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 ring-1 ring-[#d4af37]/20"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                             <h3 className="text-xl font-bold">{selectedDay.day} {hijriMonthName} {hijriYear}</h3>
                             <p className="text-gray-500">
                                {moment(`${hijriYear}/${hijriMonthIndex + 1}/${selectedDay.day}`, 'iYYYY/iM/iD').format('dddd, D MMMM YYYY')} (Gregorian)
                             </p>
                        </div>
                        <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    {selectedDay.events.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDay.events.map((e, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-l-4" style={{ borderLeftColor: e.color }}>
                                    <div>
                                        <h4 className="font-bold" style={{ color: e.color }}>{e.name}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{e.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-center py-4">No specific events for this day.</p>
                    )}
                </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
