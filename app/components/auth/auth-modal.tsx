'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/auth-context';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './auth.module.css';
import { X, Mail, Lock, User, Github, Chrome } from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, getLoginRedirectPath } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const validate = () => {
    // Basic email regex
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validate()) return;

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        name: name || 'User', // Pass name for our mock provider
      });

      if (result?.error) {
        setError('Authentication failed');
        setLoading(false);
      } else {
        // Successful login
        resetForm();
        closeAuthModal();
        
        // Smart Redirect
        const redirectPath = getLoginRedirectPath(email);
        router.push(redirectPath);
      }
    } catch (error) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    closeAuthModal();
    setTimeout(resetForm, 300); // Reset after animation
  };

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <motion.div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
          >
            {/* Left Side - Decorative */}
            <div className={styles.decorativeSide}>
               <div className={styles.pattern} />
               <motion.div 
                 className={styles.decorativeContent}
                 key={mode}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.2 }}
               >
                 <div className={styles.kufiText}>
                   {mode === 'login' ? 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا' : 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ'}
                 </div>
                 <div className={styles.quoteAttribution}>
                   {mode === 'login' ? 'Surah Al-Muzzammil [73:4]' : 'Surah Al-Alaq [96:1]'}
                 </div>
               </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className={styles.formSide}>
              <button className={styles.closeButton} onClick={handleClose}>
                <X size={20} />
              </button>

              <div className={styles.formContainer}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.header}>
                    <h2 className={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
                    <p className={styles.subtitle}>
                      {mode === 'login' 
                        ? 'Enter your details to access your progress' 
                        : 'Join us to track your Quran journey'}
                    </p>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={styles.errorMessage}
                      style={{ 
                        color: '#ef4444', 
                        background: '#fef2f2', 
                        padding: '10px', 
                        borderRadius: '8px', 
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {mode === 'register' && (
                      <div className={styles.inputGroup}>
                        <input 
                          type="text" 
                          className={styles.input} 
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                        <User className={styles.inputIcon} size={18} />
                      </div>
                    )}

                    <div className={styles.inputGroup}>
                      <input 
                        type="email" 
                        className={styles.input} 
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <Mail className={styles.inputIcon} size={18} />
                    </div>

                    <div className={styles.inputGroup}>
                      <input 
                        type="password" 
                        className={styles.input} 
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Lock className={styles.inputIcon} size={18} />
                    </div>

                    <button 
                      type="submit" 
                      className={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span className="spinner-small" /> Processing...
                        </span>
                      ) : (
                        mode === 'login' ? 'Sign In' : 'Create Account'
                      )}
                    </button>
                  </form>

                  <div className={styles.divider}>
                    <span>Or continue with</span>
                  </div>

                  <div className={styles.socialButtons}>
                    <button className={styles.socialBtn} onClick={() => signIn('google')}>
                      <Chrome size={18} /> Google
                    </button>
                    <button className={styles.socialBtn} onClick={() => signIn('github')}>
                      <Github size={18} /> GitHub
                    </button>
                  </div>

                  <div className={styles.toggleText}>
                    {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                    <span 
                      className={styles.link}
                      onClick={() => {
                        setMode(mode === 'login' ? 'register' : 'login');
                        setError(null);
                      }}
                    >
                      {mode === 'login' ? 'Sign up' : 'Sign in'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
