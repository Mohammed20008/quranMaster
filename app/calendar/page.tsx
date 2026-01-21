'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// @ts-ignore
import moment from 'moment-hijri';
import { 
  HIJRI_MONTHS, 
  HIJRI_MONTHS_AR,
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
  const [activePopup, setActivePopup] = useState<number | null>(null);

  // Hijri Date of the *current view's* month
  const hijriYear = currentDate.iYear();
  const hijriMonthIndex = currentDate.iMonth(); // 0-indexed
  const hijriMonthName = HIJRI_MONTHS[hijriMonthIndex];
  const isHijri = true; // Main calendar page currently defaults to Hijri view
  
  // Calculate grid
  const startOfMonth = isHijri ? moment(currentDate).startOf('iMonth') : moment(currentDate).startOf('month');
  const daysInMonth = currentDate.iDaysInMonth();
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) - 6 (Sat)
  const calendarStartOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Start from Monday

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
    // Select today by default in the sidebar, but DON'T show the popup
    if (isCurrentMonth) {
        setSelectedDay({ day: today.iDate(), events: getEventsForDay(today.iDate()) });
    } else {
        setSelectedDay({ day: 1, events: getEventsForDay(1) });
    }
  }, [currentDate, customEvents.length]);

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
            <h1 className="arabic-text" style={{ fontSize: '2.5rem', lineHeight: '1.2' }}>التقويم الهجري العالمي</h1>
            <p>Unified Hijri Calendar & Spiritual Guide</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.calendarContainer}>
            {/* Top Stats/Events */}
            <section className={styles.eventsSection}>
                <EventCountdown customEvents={customEvents} />
            </section>

            {/* Main Calendar Grid Picker-Style */}
            <section className={styles.pickerSide}>
                <div className="mb-6">
                    <h2 className={styles.pickerMonth}>
                        {HIJRI_MONTHS_AR[hijriMonthIndex]}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-gray-500 tracking-[0.2em] uppercase">
                            {hijriYear} AH
                        </span>
                        <div className="h-[1px] w-12 bg-[#d4af37]/40"></div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {currentDate.format('MMMM YYYY')}
                        </span>
                    </div>
                </div>

                <div className={styles.calendarWrapper}>
                    <button onClick={prevMonth} className={styles.sideArrow} title="Previous Month">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>

                    <motion.div 
                        className={styles.calendarGridWrapper}
                        key={`${currentDate.format('YYYY-MM')}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                            if (info.offset.x > 100) prevMonth();
                            else if (info.offset.x < -100) nextMonth();
                        }}
                    >
                        <div className="grid grid-cols-7 gap-3">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <div key={d} className={styles.pickerDayHeader}>{d}</div>
                            ))}

                            {(() => {
                                const cells = [];
                                const startDate = moment(startOfMonth).subtract(calendarStartOffset, 'days');
                                
                                // Determine if we need 5 or 6 rows (35 or 42 cells)
                                const endOfMonth = isHijri ? moment(startOfMonth).endOf('iMonth') : moment(startOfMonth).endOf('month');
                                const totalCells = startDate.diff(endOfMonth, 'days') * -1 > 34 ? 42 : 35;
                                
                                for (let i = 0; i < totalCells; i++) {
                                    const date = moment(startDate).add(i, 'days');
                                    const day = date.iDate();
                                    const inMonth = date.iMonth() === hijriMonthIndex && date.iYear() === hijriYear;
                                    const events = getEventsForDay(inMonth ? day : -1);
                                    const isDayToday = today.isSame(date, 'day');
                                    const isSelected = selectedDay?.day === day && inMonth; 
                                    const fasting = isSunnahFastingDay(day, date, date.iMonth() + 1);

                                     cells.push(
                                        <div key={i} className="relative group">
                                            <motion.button
                                                onClick={() => {
                                                    if (inMonth) {
                                                        setSelectedDay({ day, events });
                                                        setActivePopup(day === activePopup ? null : day);
                                                    }
                                                }}
                                                className={`
                                                    ${styles.dayBtn} 
                                                    ${inMonth ? styles.dayCurrent : styles.dayOther} 
                                                    ${isDayToday ? styles.dayToday : ''} 
                                                    ${isSelected ? styles.daySelected : ''}
                                                    ${inMonth && !isSelected ? styles.dayHover : ''}
                                                `}
                                            >
                                                <span className="relative z-10">{inMonth ? day : (isHijri ? date.iDate() : date.date())}</span>
                                                
                                                 {inMonth && events.length > 0 && (
                                                    <div className={styles.eventDots}>
                                                        {events.slice(0, 3).map((e, idx) => (
                                                            <div key={idx} className={styles.eventDot} style={{ backgroundColor: e.color }} title={e.name} />
                                                        ))}
                                                    </div>
                                                )}

                                                {isDayToday && inMonth && !isSelected && (
                                                    <div className="absolute bottom-1 w-1 h-1 bg-[#d4af37] rounded-full"></div>
                                                )}
                                            </motion.button>

                                             {/* Vertical Quick Action Popup */}
                                            <AnimatePresence>
                                                {activePopup === day && inMonth && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 15, scale: 0.8 }}
                                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 z-50 pointer-events-auto"
                                                    >
                                                        <div className="relative group/popup">
                                                            {/* Glow effect behind popup */}
                                                            <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] rounded-2xl blur opacity-20 group-hover/popup:opacity-40 transition-opacity"></div>
                                                            
                                                            <div className="relative bg-[#1a1a1a]/98 backdrop-blur-3xl border border-[#d4af37]/60 rounded-2xl p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col gap-1 min-w-[180px]">
                                                                <button 
                                                                    onClick={(e) => { 
                                                                        e.stopPropagation(); 
                                                                        setIsModalOpen(true);
                                                                        setActivePopup(null);
                                                                    }}
                                                                    className="flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-br from-[#d4af37]/10 to-transparent hover:from-[#d4af37]/25 hover:to-[#d4af37]/5 rounded-xl transition-all group/btn"
                                                                >
                                                                    <div className="flex flex-col items-start">
                                                                        <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-[0.2em] leading-none mb-1">Add Event</span>
                                                                        <span className="text-[12px] font-bold text-white/90">Quick Action</span>
                                                                    </div>
                                                                    <div className="w-8 h-8 rounded-lg bg-[#d4af37] flex items-center justify-center shadow-[0_4px_12px_rgba(212,175,55,0.3)] group-hover/btn:scale-110 group-hover/btn:rotate-90 transition-all duration-300">
                                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><path d="M12 5v14M5 12h14"/></svg>
                                                                    </div>
                                                                </button>
                                                                
                                                                <div className="h-[1px] bg-white/5 mx-2"></div>
                                                                
                                                                <div className="px-4 py-2 flex items-center justify-between">
                                                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{date.format('dddd')}</span>
                                                                    <span className="text-[10px] text-[#d4af37] font-bold">{date.format('MMM D')}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Arrow */}
                                                            <div className="w-4 h-4 bg-[#1a1a1a] border-r border-b border-[#d4af37]/60 rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-lg"></div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }
                                return cells;
                            })()}
                        </div>
                    </motion.div>

                    <button onClick={nextMonth} className={styles.sideArrow} title="Next Month">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
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
                                    <h3 className="!m-0 text-white font-black">{selectedDay.day} {HIJRI_MONTHS_AR[hijriMonthIndex]}</h3>
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
