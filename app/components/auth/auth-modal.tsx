'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { useAuth } from '@/app/context/auth-context';
import { signIn } from 'next-auth/react';
import styles from './auth.module.css';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For now, we use the manual login from context
      // In a real app, this would call an API or next-auth
      if (isLogin) {
        // Manual login for demonstration
        login({
          email,
          name: email.split('@')[0], // Fallback name
        });
      } else {
        // Simulate registration
        login({
          email,
          name,
        });
      }
      closeAuthModal();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <AnimatePresence>
      <div className={styles.modalOverlay} onClick={closeAuthModal}>
        <motion.div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Decorative Side */}
          <div className={styles.decorativeSide}>
            <div className={styles.pattern} />
            <div className={styles.decorativeContent}>
              <div className={styles.kufiText}>
                ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ
              </div>
              <div className={styles.quoteAttribution}>
                Surah Al-Alaq [96:1]
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className={styles.formSide}>
            <button className={styles.closeButton} onClick={closeAuthModal}>
              <X size={20} />
            </button>

            <div className={styles.formContainer}>
              <div className={styles.header}>
                <h2 className={styles.title}>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
                <p className={styles.subtitle}>
                  {isLogin
                    ? 'Continue your journey with the Holy Quran'
                    : 'Start your journey with the Holy Quran today'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={styles.input}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                    <User className={styles.inputIcon} size={18} />
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className={styles.inputIcon} size={18} />
                </div>

                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    placeholder="Password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock className={styles.inputIcon} size={18} />
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className={styles.divider}>
                <span>OR</span>
              </div>

              <div className={styles.socialButtons}>
                <button
                  className={styles.socialBtn}
                  onClick={() => handleSocialLogin('google')}
                >
                  <Chrome size={18} />
                  <span>Google</span>
                </button>
                <button
                  className={styles.socialBtn}
                  onClick={() => handleSocialLogin('github')}
                >
                  <Github size={18} />
                  <span>GitHub</span>
                </button>
              </div>

              <div className={styles.toggleText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <span
                  className={styles.link}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
