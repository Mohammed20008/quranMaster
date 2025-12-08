'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from './learn.module.css';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'preferences' | 'payment' | 'confirmation';

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  if (!isOpen) return null;

  const [step, setStep] = useState<Step>('preferences');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    gender: 'male',
    ageGroup: 'adult',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quran_app_preferences');
    if (saved) {
      try {
        const { gender, ageGroup } = JSON.parse(saved);
        if (gender && ageGroup) {
          setFormData(prev => ({ ...prev, gender, ageGroup }));
        }
      } catch (e) {
        console.error('Failed to parse preferences');
      }
    }
  }, []);

  // Trigger confetti on confirmation
  useEffect(() => {
    if (step === 'confirmation') {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }; // Higher z-index for modal

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [step]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleNext = async () => {
    setError(null);

    if (step === 'preferences') {
      // Save preferences
      localStorage.setItem('quran_app_preferences', JSON.stringify({
        gender: formData.gender,
        ageGroup: formData.ageGroup
      }));
      setStep('payment');
    } else if (step === 'payment') {
      // Basic validation
      if (!formData.cardNumber || !formData.expiry || !formData.cvc) {
        setError('Please fill in all payment details.');
        return;
      }

      setLoading(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
      setStep('confirmation');
    }
  };

  const getWhatsAppLink = () => {
    const message = `Assalamu alaykum, I have completed my booking payment. 
    \nPreferences:
    \n- Teacher Gender: ${formData.gender}
    \n- Student: ${formData.ageGroup}`;
    
    return `https://wa.me/201097677202?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Step Indicators */}
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${step === 'preferences' ? styles.active : styles.completed}`} />
          <div className={`${styles.stepDot} ${step === 'payment' ? styles.active : (step === 'confirmation' ? styles.completed : '')}`} />
          <div className={`${styles.stepDot} ${step === 'confirmation' ? styles.active : ''}`} />
        </div>

        {step === 'preferences' && (
          <>
            <h2 className={styles.modalTitle}>Customize Session</h2>
            <p className={styles.modalSubtitle}>Help us match you with the perfect teacher.</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Preferred Teacher Gender</label>
              <div className={styles.optionGrid}>
                <div 
                  className={`${styles.optionCard} ${formData.gender === 'male' ? styles.selected : ''}`}
                  onClick={() => setFormData({...formData, gender: 'male'})}
                >
                  Male Teacher
                </div>
                <div 
                  className={`${styles.optionCard} ${formData.gender === 'female' ? styles.selected : ''}`}
                  onClick={() => setFormData({...formData, gender: 'female'})}
                >
                  Female Teacher
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Student Age Group</label>
              <select 
                className={styles.select}
                value={formData.ageGroup}
                onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
              >
                <option value="child">Child (5-12)</option>
                <option value="teen">Teen (13-18)</option>
                <option value="adult">Adult (18+)</option>
              </select>
            </div>

            <button className={styles.primaryBtn} onClick={handleNext}>
              Continue to Payment
            </button>
          </>
        )}

        {step === 'payment' && (
          <>
            <h2 className={styles.modalTitle}>Secure Payment</h2>
            <p className={styles.modalSubtitle}>Session Fee: $15.00</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Card Number</label>
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000"
                className={styles.input}
                maxLength={19}
                value={formData.cardNumber}
                onChange={(e) => { 
                  setError(null); 
                  setFormData({...formData, cardNumber: formatCardNumber(e.target.value)}); 
                }}
              />
            </div>

            <div className={styles.optionGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expiry</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  className={styles.input}
                  maxLength={5}
                  value={formData.expiry}
                  onChange={(e) => { 
                    setError(null); 
                    setFormData({...formData, expiry: formatExpiry(e.target.value)}); 
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>CVC</label>
                <input 
                  type="text" 
                  placeholder="123"
                  className={styles.input}
                  maxLength={3}
                  value={formData.cvc}
                  onChange={(e) => { 
                    setError(null); 
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({...formData, cvc: v}); 
                  }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center', fontSize: '0.9rem' }}>
                {error}
              </p>
            )}

            <button 
              className={styles.primaryBtn} 
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay $15.00'}
            </button>
          </>
        )}

        {step === 'confirmation' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', color: '#10B981' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className={styles.modalTitle}>Booking Confirmed!</h2>
            <p className={styles.modalSubtitle}>
              Please click the button below to send your confirmation to the teacher on WhatsApp.
            </p>

            <a 
              href={getWhatsAppLink()}
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.primaryBtn}
              style={{ textDecoration: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Open WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
