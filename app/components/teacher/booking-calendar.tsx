'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingCalendarProps {
  teacherId: string;
  teacherName: string;
  hourlyRate?: number;
  availability: string;
}

// Mock available time slots
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingCalendar({ teacherId, teacherName, hourlyRate = 15, availability }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Generate next 14 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      setShowConfirmation(true);
      // Here you would integrate with your booking system
      console.log('Booking:', { teacherId, date: selectedDate, time: selectedTime });
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '1.5rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #d4af37, #b4941f)',
        padding: '1.5rem',
        color: 'white'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          📅 Book a Session
        </h3>
        <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>
          Choose your preferred date and time
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Date Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            Select Date
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
            gap: '0.5rem'
          }}>
            {dates.map((date, idx) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isToday = idx === 0;

              return (
                <motion.button
                  key={date.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '0.75rem',
                    border: isSelected ? '2px solid #d4af37' : '1px solid #e5e7eb',
                    background: isSelected ? '#fff9db' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ 
                    fontSize: '0.7rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    {DAYS_OF_WEEK[date.getDay()]}
                  </div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: isSelected ? '#d4af37' : '#111827'
                  }}>
                    {date.getDate()}
                  </div>
                  {isToday && (
                    <div style={{
                      fontSize: '0.65rem',
                      color: '#10b981',
                      fontWeight: '600',
                      marginTop: '0.25rem'
                    }}>
                      TODAY
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '2rem' }}
          >
            <label style={{
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem'
            }}>
              Select Time
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '0.5rem'
            }}>
              {TIME_SLOTS.map((time) => {
                const isSelected = selectedTime === time;
                const isPastTime = selectedDate.toDateString() === new Date().toDateString() && 
                  parseInt(time.split(':')[0]) < new Date().getHours();

                return (
                  <motion.button
                    key={time}
                    whileHover={!isPastTime ? { scale: 1.05 } : {}}
                    whileTap={!isPastTime ? { scale: 0.95 } : {}}
                    onClick={() => !isPastTime && setSelectedTime(time)}
                    disabled={isPastTime}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: isSelected ? '2px solid #d4af37' : '1px solid #e5e7eb',
                      background: isPastTime ? '#f3f4f6' : isSelected ? '#fff9db' : 'white',
                      color: isPastTime ? '#9ca3af' : isSelected ? '#d4af37' : '#111827',
                      cursor: isPastTime ? 'not-allowed' : 'pointer',
                      fontWeight: isSelected ? '700' : '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    {time}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Booking Summary */}
        {selectedDate && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <h4 style={{ fontWeight: '700', marginBottom: '1rem' }}>Session Summary</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Teacher:</span>
                <span style={{ fontWeight: '600' }}>{teacherName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Date:</span>
                <span style={{ fontWeight: '600' }}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Time:</span>
                <span style={{ fontWeight: '600' }}>{selectedTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Duration:</span>
                <span style={{ fontWeight: '600' }}>60 minutes</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <span style={{ fontWeight: '700' }}>Total:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#d4af37' }}>
                  ${hourlyRate}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime}
          style={{
            width: '100%',
            padding: '1rem',
            background: selectedDate && selectedTime
              ? 'linear-gradient(135deg, #d4af37, #b4941f)'
              : '#e5e7eb',
            color: selectedDate && selectedTime ? 'white' : '#9ca3af',
            border: 'none',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: selectedDate && selectedTime ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s',
            boxShadow: selectedDate && selectedTime ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (selectedDate && selectedTime) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = selectedDate && selectedTime ? '0 4px 12px rgba(212, 175, 55, 0.3)' : 'none';
          }}
        >
          {selectedDate && selectedTime ? 'Confirm Booking' : 'Select Date & Time'}
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmation(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                zIndex: 50,
                backdropFilter: 'blur(4px)'
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                borderRadius: '1.5rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                zIndex: 51,
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2.5rem'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Booking Confirmed!
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                You'll receive a confirmation email with the meeting link shortly.
              </p>
              <button
                onClick={() => setShowConfirmation(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #d4af37, #b4941f)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
