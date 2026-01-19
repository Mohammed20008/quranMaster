'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserEvent } from '@/types/calendar';
// @ts-ignore
import moment from 'moment-hijri';
import { HIJRI_MONTHS } from '@/app/lib/islamic-dates';

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
  }, [isOpen]);

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

  const hijriMonthName = HIJRI_MONTHS[pickerDate.iMonth()];
  const hijriYear = pickerDate.iYear();
  const daysInMonth = pickerDate.iDaysInMonth();
  const startOfMonth = moment(pickerDate).startOf('iMonth');
  const startDayOfWeek = startOfMonth.day();

  const prevMonth = () => setPickerDate(moment(pickerDate).subtract(1, 'iMonth'));
  const nextMonth = () => setPickerDate(moment(pickerDate).add(1, 'iMonth'));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col lg:flex-row min-h-[650px]"
        >
          {/* Left Side: Calendar Picker */}
          <div className="flex-[1.1] p-12 bg-white/[0.01] border-r border-white/5 flex flex-col justify-between">
            <div>
                <div className="mb-12 flex justify-between items-end">
                    <div>
                    <h2 className="text-6xl font-black text-white tracking-tighter leading-none">{hijriMonthName.substring(0, 3)}</h2>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs font-bold text-gray-500 tracking-[0.3em] uppercase">{hijriYear} AH</span>
                        <div className="h-[1px] w-10 bg-[#d4af37]"></div>
                    </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <button onClick={prevMonth} className="p-3 hover:bg-white/5 rounded-full transition-colors border border-white/5 group">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:scale-110 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
                        </button>
                        <button onClick={nextMonth} className="p-3 hover:bg-white/5 rounded-full transition-colors border border-white/5 group">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:scale-110 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-y-6 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                        <div key={`${d}-${i}`} className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">{d}</div>
                    ))}
                    
                    {(() => {
                        const cells = [];
                        const firstDayPrevMonth = moment(startOfMonth).subtract(startDayOfWeek === 0 ? 6 : startDayOfWeek - 1, 'days');
                        
                        for (let i = 0; i < 42; i++) {
                            const date = moment(firstDayPrevMonth).add(i, 'days');
                            const isCurrentMonth = date.iMonth() === pickerDate.iMonth();
                            const day = date.iDate();
                            const isSelected = selectedInPicker.iDate() === day && selectedInPicker.iMonth() === date.iMonth() && selectedInPicker.iYear() === date.iYear();
                            
                            cells.push(
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setSelectedInPicker(moment(date))}
                                    className={`relative aspect-square text-lg font-bold transition-all flex items-center justify-center ${
                                        isCurrentMonth ? 'text-white' : 'text-gray-800'
                                    } ${isSelected ? 'z-10' : 'hover:text-[#d4af37]'}`}
                                >
                                    {isSelected && (
                                        <motion.div 
                                            layoutId="picker-select" 
                                            className="absolute inset-1 border border-[#d4af37]/40 bg-[#d4af37]/5 rounded-xl"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        />
                                    )}
                                    <span className="relative z-10">{day < 10 ? `0${day}` : day}</span>
                                </button>
                            );
                        }
                        return cells;
                    })()}
                </div>
            </div>

            <div className="mt-12 flex items-center gap-8 p-8 bg-white/[0.02] rounded-[2rem] border border-white/5">
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Selected Date</div>
                    <div className="text-xl font-black text-white leading-none">{selectedInPicker.format('iD iMMMM iYYYY')}</div>
                </div>
                <div className="h-10 w-[1px] bg-white/10"></div>
                <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Gregorian</div>
                    <div className="text-sm font-bold text-gray-400 leading-none">{selectedInPicker.format('MMMM D, YYYY')}</div>
                </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-16 flex flex-col justify-between bg-black/40">
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">Create Event</h2>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-xl">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Event Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. My Special Anniversary"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-medium focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/50 transition-all placeholder:text-gray-700"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Journal Note</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Capture your thoughts..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[#d4af37] transition-all h-32 resize-none placeholder:text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Lock to</label>
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setType('hijri')}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                          type === 'hijri' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Hijri
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('gregorian')}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${
                          type === 'gregorian' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        Gregorian
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Theme</label>
                    <div className="flex items-center justify-between h-[54px] px-2 bg-white/5 rounded-2xl border border-white/5">
                      {['#d4af37', '#ff4d4d', '#4dff88', '#4dadff', '#ff4dff'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-full transition-all border-2 ${
                            color === c ? 'border-white scale-125' : 'border-transparent opacity-50'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="pt-8">
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] text-black font-black py-5 rounded-[1.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(212,175,55,0.3)] text-lg"
              >
                Register Event
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
