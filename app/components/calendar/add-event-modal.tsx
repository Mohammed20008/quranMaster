'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserEvent } from '@/types/calendar';
// @ts-ignore
import moment from 'moment-hijri';
import { HIJRI_MONTHS, HIJRI_MONTHS_AR } from '@/app/lib/islamic-dates';
import styles from './add-event-modal.module.css';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (event: Omit<UserEvent, 'id'>) => void;
  initialSelectedDate: {
    hijriDay: number;
    hijriMonth: number;
    hijriYear: number;
  };
}

export default function AddEventModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  initialSelectedDate 
}: AddEventModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#d4af37');
  const [type, setType] = useState<'hijri' | 'gregorian'>('hijri');
  
  // Internal calendar state for the picker
  const [pickerDate, setPickerDate] = useState(moment());
  const [selectedInPicker, setSelectedInPicker] = useState(moment());

  useEffect(() => {
    if (isOpen) {
      const initial = moment().iYear(initialSelectedDate.hijriYear).iMonth(initialSelectedDate.hijriMonth - 1).iDate(initialSelectedDate.hijriDay);
      setPickerDate(moment(initial));
      setSelectedInPicker(moment(initial));
    }
  }, [isOpen, initialSelectedDate]);

  // Keyboard navigation for months
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevMonth();
      } else if (e.key === 'ArrowRight') {
        nextMonth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pickerDate]); // Re-bind on pickerDate change to ensure handlers use latest state

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAdd({
      name,
      description,
      color,
      type,
      hijriDay: type === 'hijri' ? selectedInPicker.iDate() : undefined,
      hijriMonth: type === 'hijri' ? selectedInPicker.iMonth() + 1 : undefined,
      gregorianDay: type === 'gregorian' ? selectedInPicker.date() : undefined,
      gregorianMonth: type === 'gregorian' ? selectedInPicker.month() + 1 : undefined,
    });

    setName('');
    setDescription('');
    onClose();
  };

  const isHijri = type === 'hijri';
  const hijriMonthName = HIJRI_MONTHS[pickerDate.iMonth()];
  const hijriYear = pickerDate.iYear();
  
  // Gregorian info for the header if needed
  const gregMonthName = pickerDate.format('MMMM');
  const gregYear = pickerDate.year();

  const startOfMonth = isHijri ? moment(pickerDate).startOf('iMonth') : moment(pickerDate).startOf('month');
  const startDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)
  
  // Adjust to start from Monday (1)
  // 0 -> 6, 1 -> 0, 2 -> 1, 3 -> 2, 4 -> 3, 5 -> 4, 6 -> 5
  const calendarStartOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonth = () => setPickerDate(moment(pickerDate).subtract(1, isHijri ? 'iMonth' : 'month'));
  const nextMonth = () => setPickerDate(moment(pickerDate).add(1, isHijri ? 'iMonth' : 'month'));

  const now = moment();
  const isToday = (date: any) => now.isSame(date, 'day');
  const isThisMonth = (date: any) => isHijri ? date.iMonth() === pickerDate.iMonth() && date.iYear() === pickerDate.iYear() : date.month() === pickerDate.month() && date.year() === pickerDate.year();

  return (
    <AnimatePresence>
      <div className={styles.modalBackdrop} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={styles.modalContainer}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header matched to Mutashabihat */}
          <div className={styles.modalHeader}>
            <h3>Create Spiritual Event</h3>
            <button onClick={onClose} className={styles.closeButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.modalContent}>
            <div className={styles.splitLayout}>
              {/* Left Side: Calendar Picker Side */}
              <div className={styles.pickerSide}>
                <div className="mb-6">
                    <h4 className={styles.pickerMonth}>
                        {isHijri ? HIJRI_MONTHS_AR[pickerDate.iMonth()] : gregMonthName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                        {isHijri ? `${hijriYear} AH` : gregYear}
                      </span>
                      <div className="h-[1px] w-8 bg-[#d4af37]/40"></div>
                      {isToday(pickerDate) && (
                        <span className="text-[9px] font-black text-[#d4af37] uppercase tracking-tighter">Current Month</span>
                      )}
                    </div>
                </div>

                <div className={styles.calendarWrapper}>
                    <button onClick={prevMonth} className={styles.sideArrow} title="Previous Month (Left Arrow)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>

                    <motion.div 
                        className={styles.calendarGridWrapper}
                        key={`${pickerDate.format('YYYY-MM')}-${type}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(e, info) => {
                            if (info.offset.x > 100) prevMonth();
                            else if (info.offset.x < -100) nextMonth();
                        }}
                    >
                        <div className="grid grid-cols-7 gap-y-1 text-center">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                                <div key={`${d}-${i}`} className={styles.pickerDayHeader}>{d}</div>
                            ))}
                            
                            {(() => {
                                const cells = [];
                                // Start from the first cell of the grid
                                const startDate = moment(startOfMonth).subtract(calendarStartOffset, 'days');
                                
                                // Determine if we need 5 or 6 rows (35 or 42 cells)
                                // If 35 days from startDate covers the end of the month, use 35.
                                const endOfMonth = isHijri ? moment(startOfMonth).endOf('iMonth') : moment(startOfMonth).endOf('month');
                                const totalCellsNeeded = startDate.diff(endOfMonth, 'days') * -1 > 34 ? 42 : 35;

                                for (let i = 0; i < totalCellsNeeded; i++) {
                                    const date = moment(startDate).add(i, 'days');
                                    const inMonth = isThisMonth(date);
                                    const dayDisplay = isHijri ? date.iDate() : date.date();
                                    const isSelected = selectedInPicker.isSame(date, 'day');
                                    const isDayToday = isToday(date);
                                    
                                    cells.push(
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setSelectedInPicker(moment(date))}
                                            className={`
                                                ${styles.dayBtn} 
                                                ${inMonth ? styles.dayCurrent : styles.dayOther} 
                                                ${isSelected ? styles.daySelected : ''}
                                                ${isDayToday ? styles.dayToday : ''}
                                                ${!isSelected ? styles.dayHover : ''}
                                            `}
                                        >
                                            <span className="relative z-10">{dayDisplay}</span>
                                            {isDayToday && !isSelected && (
                                              <div className="absolute bottom-1 w-1 h-1 bg-[#d4af37] rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                }
                                return cells;
                            })()}
                        </div>
                    </motion.div>

                    <button onClick={nextMonth} className={styles.sideArrow} title="Next Month (Right Arrow)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                </div>

                <div className={styles.pickerFooter}>
                    <div className={styles.footerRow}>
                        <span className={styles.footerLabel}>Selected Hijri</span>
                        <span className={styles.footerValue}>{selectedInPicker.format('iD iMMMM iYYYY')}</span>
                    </div>
                    <div className={styles.footerRow}>
                        <span className={styles.footerLabel}>Gregorian</span>
                        <span className={styles.footerValueSub}>{selectedInPicker.format('MMMM D, YYYY')}</span>
                    </div>
                </div>
              </div>

              {/* Right Side: Form Side */}
              <div className={styles.formSide}>
                <div className={styles.formSection}>
                  <label className={styles.label}>Event Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Khatm-ul-Quran"
                    className={styles.inputField}
                    autoFocus
                  />
                </div>

                <div className={styles.formSection}>
                  <label className={styles.label}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes about this event..."
                    className={`${styles.inputField} h-24 resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={styles.formSection}>
                    <label className={styles.label}>System</label>
                    <div className="flex gap-1 p-1 bg-black/5 dark:bg-black/20 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setType('hijri')}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          type === 'hijri' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500 hover:text-gray-400'
                        }`}
                      >
                        Hijri
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('gregorian')}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          type === 'gregorian' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500 hover:text-gray-400'
                        }`}
                      >
                        Greg
                      </button>
                    </div>
                  </div>

                  <div className={styles.formSection}>
                    <label className={styles.label}>Theme</label>
                    <div className="flex items-center justify-between px-1">
                      {['#d4af37', '#ff4d4d', '#4dff88', '#4dadff', '#ff4dff'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-4 h-4 rounded-full transition-all border-2 ${
                            color === c ? 'border-primary-light scale-125' : 'border-transparent opacity-50 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className={styles.submitButton}
                >
                    Register Spiritually
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
