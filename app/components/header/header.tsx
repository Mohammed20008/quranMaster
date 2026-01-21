'use client';

import { useState, useEffect, useRef } from 'react';
import { surahs } from '@/data/surah-data';
import styles from './header.module.css';
import { reciters, Reciter } from '@/data/reciters';
import { useUserData } from '@/app/context/user-data-context';
import { useAudio } from '@/app/context/audio-context';
import { motion, AnimatePresence } from 'framer-motion';
import ReciterImage from '@/app/components/audio/reciter-image';



export type ViewMode = 'verse' | 'page' | 'spread';

interface HeaderProps {
  currentSurah: number;
  onPrevSurah: () => void;
  onNextSurah: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentPage?: number;
}

export default function Header({ 
  currentSurah, 
  onPrevSurah, 
  onNextSurah, 
  onThemeToggle, 
  theme, 
  viewMode, 
  onViewModeChange,
  currentPage
}: HeaderProps) {
  const { settings, updateSettings } = useUserData();
  const { state: audioState, playSurah, playVerse, playPage, togglePlay, stop, currentReciter } = useAudio();
  
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showReciters, setShowReciters] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingReciter, setPendingReciter] = useState<Reciter | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const surah = surahs.find(s => s.number === currentSurah);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update scrolled state (for glass effect)
      setIsScrolled(currentScrollY > 20);

      // Show header when scrolling up or at top, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowReciters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleReciterSelect = (reciter: Reciter) => {
    updateSettings({ selectedReciterId: reciter.id });
    setPendingReciter(reciter);
    setShowReciters(false);
    setShowPrompt(true);
  };

  const startPlayback = (type: 'surah' | 'page') => {
    if (type === 'surah') {
      playSurah(currentSurah);
    } else if (type === 'page' && currentPage) {
      playPage(currentSurah, currentPage);
    }
    setShowPrompt(false);
  };
  
  if (!surah) return null;

  return (
    <header className={`${styles.header} ${isVisible ? styles.visible : styles.hidden} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Left Section - Surah Info */}
        <div className={styles.surahInfo}>
          <div className={styles.surahBadge}>
            <span className={styles.surahNumber}>{surah.number}</span>
          </div>
          <div className={styles.surahNames}>
            <h2 className="arabic-heading">{surah.name}</h2>
            <p className={styles.surahMeta}>
              {surah.transliteration} • {surah.translation}
            </p>
          </div>
        </div>

        {/* Center Section - Navigation Controls */}
        <div className={styles.controls}>
          <button
            className={styles.navBtn}
            onClick={onPrevSurah}
            disabled={currentSurah === 1}
            aria-label="Previous Surah"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className={styles.surahSelector}>
            <span className={styles.currentSurah}>
              Surah {currentSurah} of 114
            </span>
          </div>

          <button
            className={styles.navBtn}
            onClick={onNextSurah}
            disabled={currentSurah === 114}
            aria-label="Next Surah"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Right Section - View Options */}
        <div className={styles.options}>
          {/* View Mode Toggle */}
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeBtn} ${viewMode === 'verse' ? styles.active : ''}`}
              onClick={() => onViewModeChange('verse')}
              aria-label="Verse by verse view"
              title="Verse by verse"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
              <span>Verses</span>
            </button>
            <button
              className={`${styles.viewModeBtn} ${viewMode === 'page' ? styles.active : ''}`}
              onClick={() => onViewModeChange('page')}
              aria-label="Page view"
              title="Continuous page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Page</span>
            </button>
            <button
              className={`${styles.viewModeBtn} ${viewMode === 'spread' ? styles.active : ''}`}
              onClick={() => onViewModeChange('spread')}
              aria-label="Spread view"
              title="Spread (Book) mode"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2h.5l-.5 0v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                <path d="M11 2h.5l-.5 0v20h-.5a2.5 2.5 0 0 0-2.5-2.5V4.5A2.5 2.5 0 0 1 11 2z" transform="scale(-1, 1) translate(-24, 0)"></path>
              </svg>
              <span>Spread</span>
            </button>
          </div>

          <div className={styles.divider}></div>
          {/* Reciter Dropdown */}
          <div className={styles.reciterDropdown} ref={dropdownRef}>
            <button 
              className={styles.reciterBtn}
              onClick={() => setShowReciters(!showReciters)}
            >
              <ReciterImage 
                src={currentReciter?.imageUrl} 
                name={currentReciter?.name || 'Reciter'} 
                size={24} 
              />
              <span>{currentReciter?.name.split(' ').pop()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: showReciters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            <AnimatePresence>
              {showReciters && (
                <motion.div 
                  className={styles.reciterMenu}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {reciters.map(reciter => (
                    <button 
                      key={reciter.id}
                      className={`${styles.reciterItem} ${settings.selectedReciterId === reciter.id ? styles.active : ''}`}
                      onClick={() => handleReciterSelect(reciter)}
                    >
                      <ReciterImage 
                        src={reciter.imageUrl} 
                        name={reciter.name} 
                        size={32} 
                      />
                      <div className={styles.reciterItemInfo}>
                        <span className={styles.reciterName}>{reciter.name}</span>
                        <span className={styles.reciterSubtext}>{reciter.subtext}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.divider}></div>

          {/* Audio Play/Pause Button */}
          <button 
            className={`${styles.iconBtn} ${audioState.isPlaying ? styles.active : ''}`} 
            onClick={togglePlay}
            aria-label={audioState.isPlaying ? "Pause audio" : "Play audio"}
            title={audioState.isPlaying ? "Pause" : "Play"}
          >
            {audioState.isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          <div className={styles.divider}></div>

          {/* Font Toggle */}
          <button
            className={`${styles.fontToggleBtn} ${settings.fontMode === 'qpc' ? styles.active : ''}`}
            onClick={() => updateSettings({ fontMode: settings.fontMode === 'uthmanic' ? 'qpc' : 'uthmanic' })}
            title="Toggle Font"
          >
            {settings.fontMode === 'qpc' ? 'QPC' : 'Hafs'}
          </button>
        </div>
      </div>

      {/* Playback Prompt Modal */}
      <AnimatePresence>
        {showPrompt && (
          <div className={styles.modalOverlay} onClick={() => setShowPrompt(false)}>
            <motion.div 
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3>How do you want to start?</h3>
              <p>Choose where to begin the recitation of Surah {surah.transliteration}</p>
              <div className={styles.modalActions}>
                <button 
                  className={styles.modalBtn}
                  onClick={() => startPlayback('surah')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  <span>Beginning of Surah</span>
                </button>
                <button 
                  className={styles.modalBtn}
                  onClick={() => startPlayback('page')}
                  disabled={!currentPage}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                  <span>From Current Page</span>
                </button>
              </div>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowPrompt(false)}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
