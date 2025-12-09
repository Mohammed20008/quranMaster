'use client';

import { useState, useEffect } from 'react';
import { surahs } from '@/data/surah-data';
import styles from './header.module.css';


export type ViewMode = 'verse' | 'page';

interface HeaderProps {
  currentSurah: number;
  onPrevSurah: () => void;
  onNextSurah: () => void;
  onThemeToggle: () => void;
  theme: 'light' | 'dark';
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function Header({ currentSurah, onPrevSurah, onNextSurah, onThemeToggle, theme, viewMode, onViewModeChange }: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
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
          </div>

          <div className={styles.divider}></div>

          {/* Audio Player (placeholder) */}
          <button className={styles.iconBtn} aria-label="Play audio" title="Play Recitation">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>

          {/* Theme Toggle */}
          <button 
            className={styles.iconBtn}
            onClick={onThemeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
