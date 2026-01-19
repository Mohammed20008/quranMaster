'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// @ts-ignore
import moment from 'moment-hijri';
import { 
  HIJRI_MONTHS, 
  ISLAMIC_EVENTS, 
  IslamicEvent, 
  isSunnahFastingDay, 
  getMoonPhase 
} from '@/app/lib/islamic-dates';
import { UserEvent } from '@/types/calendar';
import EventCountdown from '@/app/components/calendar/event-countdown';
import PrayerTimesCard from '@/app/components/calendar/prayer-times';
import AddEventModal from '@/app/components/calendar/add-event-modal';
import styles from './calendar.module.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(moment()); // Tracks the view (month)
  const [selectedDay, setSelectedDay] = useState<{ day: number; events: UserEvent[] } | null>(null);
  const [customEvents, setCustomEvents] = useState<UserEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hijri Date of the *current view's* month
  const hijriYear = currentDate.iYear();
  const hijriMonthIndex = currentDate.iMonth(); // 0-indexed
  const hijriMonthName = HIJRI_MONTHS[hijriMonthIndex];
  
  // Calculate grid
  const startOfMonth = moment(currentDate).startOf('iMonth');
  const daysInMonth = currentDate.iDaysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

  // Today for highlighting
  const today = moment();
  const isCurrentMonth = today.iMonth() === hijriMonthIndex && today.iYear() === hijriYear;

  // Load custom events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quranmaster_calendar_events');
    if (saved) {
      try {
        setCustomEvents(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved events', e);
      }
    }
  }, []);

  // Save custom events to localStorage
  useEffect(() => {
    if (customEvents.length > 0) {
      localStorage.setItem('quranmaster_calendar_events', JSON.stringify(customEvents));
    }
  }, [customEvents]);

  const prevMonth = () => setCurrentDate(moment(currentDate).subtract(1, 'iMonth'));
  const nextMonth = () => setCurrentDate(moment(currentDate).add(1, 'iMonth'));

  // Get events for this month (Islamic + Custom)
  const getEventsForDay = (day: number) => {
    const islamic = ISLAMIC_EVENTS.filter(e => e.hijriMonth === hijriMonthIndex + 1 && e.hijriDay === day)
      .map(e => ({ ...e, id: `islamic-${e.name}`, isCustom: false }));

    const gregDate = moment(startOfMonth).add(day - 1, 'days');
    const gMonth = gregDate.month() + 1;
    const gDay = gregDate.date();

    const custom = customEvents.filter(e => {
      if (e.type === 'hijri') {
        return e.hijriMonth === hijriMonthIndex + 1 && e.hijriDay === day;
      } else {
        return e.gregorianMonth === gMonth && e.gregorianDay === gDay;
      }
    });

    return [...islamic, ...custom] as UserEvent[];
  };

  const handleAddEvent = (eventData: Omit<UserEvent, 'id'>) => {
    const newEvent: UserEvent = {
        ...eventData,
        id: Date.now().toString(),
    };
    setCustomEvents([...customEvents, newEvent]);
    
    // Update selected day view if it's the day we added to
    if (selectedDay) {
        const updatedEvents = getEventsForDay(selectedDay.day);
        // We need to wait for state update or manually inject
        setSelectedDay({ ...selectedDay, events: [...selectedDay.events, newEvent] });
    }
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomEvents(customEvents.filter(ev => ev.id !== id));
    if (selectedDay) {
        setSelectedDay({
            ...selectedDay,
            events: selectedDay.events.filter(ev => ev.id !== id)
        });
    }
  };

  useEffect(() => {
    // Select today by default if in current month
    if (isCurrentMonth) {
        setSelectedDay({ day: today.iDate(), events: getEventsForDay(today.iDate()) });
    } else {
        setSelectedDay({ day: 1, events: getEventsForDay(1) });
    }
  }, [currentDate, customEvents.length]); // Re-run if customEvents length changes to update view

  return (
    <div className={styles.container}>
      {/* Background Pattern */}
      <div className={styles.patternBg}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern-cal" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M0 40 L40 0 L80 40 L40 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern-cal)" />
        </svg>
        <div className={styles.patternOverlay}></div>
      </div>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backBtn}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div>
            <h1>Global Islamic Calendar</h1>
            <p>Unified Hijri Calendar & Spiritual Guide</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.calendarWrapper}>
            {/* Top Stats/Events */}
            <section className={styles.eventsSection}>
                <EventCountdown />
            </section>

            {/* Main Calendar Grid */}
            <section className={styles.calendarSection}>
                <div className="flex justify-between items-center mb-10">
                    <button onClick={prevMonth} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-white">{hijriMonthName}</h2>
                        <span className="text-sm font-bold text-[#d4af37] tracking-widest uppercase">{hijriYear} AH</span>
                    </div>
                    <button onClick={nextMonth} className="p-3 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/20">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>

                <div className={styles.calendarGrid}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className={styles.dayHeader}>{d}</div>
                    ))}

                    {/* Empty cells for padding */}
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square opacity-0"></div>
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const events = getEventsForDay(day);
                        const gregDate = moment(startOfMonth).add(i, 'days');
                        const isToday = isCurrentMonth && today.iDate() === day;
                        const isSelected = selectedDay?.day === day;
                        const fasting = isSunnahFastingDay(day, gregDate, hijriMonthIndex + 1);

                        return (
                            <motion.div
                                key={day}
                                onClick={() => setSelectedDay({ day, events })}
                                className={`${styles.dayCell} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                                whileHover={{ scale: 1.05, y: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {fasting.isFasting && (
                                    <div className={styles.fastingBadge}>{fasting.reason === 'White Day' ? '⚪' : '🥙'}</div>
                                )}
                                <span className={styles.dayNumber}>{day}</span>
                                <div className={styles.eventDots}>
                                    {events.map((e, idx) => (
                                        <div key={idx} className={styles.eventDot} style={{ backgroundColor: e.color }} title={e.name} />
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>

        {/* Info Sidebar */}
        <aside className={styles.sidebar}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedDay?.day || 'none'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-6"
                >
                    {selectedDay && (
                        <div className={styles.sideCard}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="!m-0 text-white font-black">{selectedDay.day} {hijriMonthName}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {moment(startOfMonth).add(selectedDay.day - 1, 'days').format('dddd, D MMMM YYYY')}
                                    </p>
                                </div>
                                <div className="text-3xl">{getMoonPhase(selectedDay.day).icon}</div>
                            </div>

                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full mb-6 py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-400 text-sm font-bold hover:border-[#d4af37]/50 hover:text-[#d4af37] hover:bg-[#d4af37]/5 transition-all flex items-center justify-center gap-2"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Add My Event
                            </button>

                            {selectedDay.events.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDay.events.map((e, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 border-l-4 group relative" style={{ borderLeftColor: e.color }}>
                                            <h4 className="font-bold text-sm" style={{ color: e.color }}>{e.name}</h4>
                                            {e.description && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{e.description}</p>}
                                            {/* @ts-ignore */}
                                            {e.id && e.id.toString().includes('islamic') === false && (
                                                <button 
                                                    onClick={(me) => handleDeleteEvent(e.id, me)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                    <p className="text-sm text-gray-500 italic">No specific religious events</p>
                                </div>
                            )}

                            {isSunnahFastingDay(selectedDay.day, moment(startOfMonth).add(selectedDay.day - 1, 'days'), hijriMonthIndex + 1).isFasting && (
                                <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                                    <span className="text-xl">🌙</span>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Sunnah Fasting</p>
                                        <p className="text-xs text-emerald-400/80">Great rewards for fasting today.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <AddEventModal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        onAdd={handleAddEvent}
                        initialSelectedDate={{
                            hijriDay: selectedDay?.day || 1,
                            hijriMonth: hijriMonthIndex + 1,
                            hijriYear: hijriYear
                        }}
                    />

                    <PrayerTimesCard />

                    <div className={styles.sideCard}>
                        <div className={styles.moonPhase}>
                            <div className={styles.moonIcon}>{getMoonPhase(selectedDay?.day || 1).icon}</div>
                            <div className={styles.moonName}>{getMoonPhase(selectedDay?.day || 1).name}</div>
                            <p className="text-[10px] text-gray-500 mt-2">Lunar illumination based on Hijri cycle</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </aside>
      </main>
    </div>
  );
}
