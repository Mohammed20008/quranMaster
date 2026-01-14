'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestimonialsCarouselProps {
  teacherId: string;
}

// Mock testimonials data
const MOCK_TESTIMONIALS = [
  {
    id: '1',
    studentName: 'Fatima Ahmed',
    rating: 5,
    date: '2 weeks ago',
    comment: 'An amazing teacher! Very patient and knowledgeable. My Tajweed has improved tremendously. The lessons are well-structured and engaging.',
    subject: 'Tajweed & Recitation'
  },
  {
    id: '2',
    studentName: 'Mohammed Ali',
    rating: 5,
    date: '1 month ago',
    comment: 'MashaAllah, excellent teaching method. Explains complex topics in a simple way that anyone can understand. Highly recommend!',
    subject: 'Quran Memorization'
  },
  {
    id: '3',
    studentName: 'Aisha Rahman',
    rating: 5,
    date: '2 months ago',
    comment: 'The best Quran teacher I have ever had. Very dedicated and makes learning enjoyable. My children love the classes!',
    subject: 'Kids Quran'
  },
  {
    id: '4',
    studentName: 'Yusuf Hassan',
    rating: 4,
    date: '3 months ago',
    comment: 'Great teacher with deep knowledge. Sessions are interactive and helpful. I have learned so much in a short time.',
    subject: 'Islamic Studies'
  },
];

export default function TestimonialsCarousel({ teacherId }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % MOCK_TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = MOCK_TESTIMONIALS[currentIndex];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            style={{
              color: i < rating ? '#fbbf24' : '#e5e7eb',
              fontSize: '1.25rem'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '1.5rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Student Reviews
        </h3>
        <p style={{ color: '#6b7280' }}>
          What students are saying about this teacher
        </p>
      </div>

      {/* Carousel Container */}
      <div style={{
        position: 'relative',
        minHeight: '250px',
        marginBottom: '2rem'
      }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            style={{
              position: 'absolute',
              width: '100%'
            }}
          >
            <div style={{
              background: '#f9fafb',
              borderRadius: '1rem',
              padding: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              {/* Quote Icon */}
              <div style={{
                fontSize: '3rem',
                color: '#d4af37',
                opacity: 0.3,
                lineHeight: 1,
                marginBottom: '1rem'
              }}>
                "
              </div>

              {/* Rating */}
              <div style={{ marginBottom: '1rem' }}>
                {renderStars(currentTestimonial.rating)}
              </div>

              {/* Comment */}
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.8',
                color: '#374151',
                marginBottom: '1.5rem',
                fontStyle: 'italic'
              }}>
                {currentTestimonial.comment}
              </p>

              {/* Student Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #d4af37, #b4941f)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '1.25rem'
                  }}>
                    {currentTestimonial.studentName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      {currentTestimonial.studentName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {currentTestimonial.subject}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  {currentTestimonial.date}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2px solid #e5e7eb',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d4af37';
            e.currentTarget.style.background = '#fff9db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = 'white';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        {/* Dots */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {MOCK_TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              style={{
                width: currentIndex === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: 'none',
                background: currentIndex === index ? '#d4af37' : '#e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.3s',
                padding: 0
              }}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '2px solid #e5e7eb',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#d4af37';
            e.currentTarget.style.background = '#fff9db';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = 'white';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* Auto-play indicator */}
      {isAutoPlaying && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          Auto-playing
        </div>
      )}
    </div>
  );
}
