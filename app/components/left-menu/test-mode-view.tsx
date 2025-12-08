'use client';

import { useState, useMemo, useEffect } from 'react';
import { Surah } from '@/types/quran';
import { getVersesBySurah, QuranVerse } from '@/data/quran-verses';
import styles from './test-mode.module.css';

interface TestModeViewProps {
  surahs: Surah[];
}

type TestView = 'intro' | 'setup' | 'active' | 'results';

interface TestConfig {
  surahNumber: number;
  startVerse: number;
  endVerse: number;
}

interface TestResult {
  total: number;
  correct: number;
  perfect: number;
}

export default function TestModeView({ surahs }: TestModeViewProps) {
  const [view, setView] = useState<TestView>('intro');
  const [config, setConfig] = useState<TestConfig>({
    surahNumber: 1,
    startVerse: 1,
    endVerse: 7
  });

  const [testVerses, setTestVerses] = useState<QuranVerse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [results, setResults] = useState<TestResult>({ total: 0, correct: 0, perfect: 0 });

  // Get current surah details
  const currentSurah = useMemo(() => 
    surahs.find(s => s.number === config.surahNumber) || surahs[0]
  , [config.surahNumber, surahs]);

  // Handle Surah Selection change to update range defaults
  const handleSurahChange = (surahId: number) => {
    const surah = surahs.find(s => s.number === surahId);
    if (surah) {
      setConfig({
        surahNumber: surahId,
        startVerse: 1,
        endVerse: surah.totalVerses
      });
    }
  };

  const startTest = () => {
    const allVerses = getVersesBySurah(config.surahNumber);
    // Filter verses based on range
    const filtered = allVerses.filter(v => v.verse >= config.startVerse && v.verse <= config.endVerse);
    
    if (filtered.length === 0) return;

    // Shuffle could be added here, but let's keep it sequential for "reciting"
    // Actually, simple recall is usually sequential.
    
    setTestVerses(filtered);
    setCurrentIndex(0);
    setIsRevealed(false);
    setResults({ total: filtered.length, correct: 0, perfect: 0 });
    setView('active');
  };

  const handleGrade = (grade: 'missed' | 'hard' | 'perfect') => {
    if (grade === 'perfect') {
      setResults(prev => ({ ...prev, correct: prev.correct + 1, perfect: prev.perfect + 1 }));
    } else if (grade === 'hard') {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    
    // Next question
    if (currentIndex < testVerses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setView('results');
    }
  };

  const restart = () => {
    setView('intro');
    setIsRevealed(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'active') return;

      if (!isRevealed) {
        // Reveal on Space, Enter, or Right Arrow
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'ArrowRight') {
          e.preventDefault();
          setIsRevealed(true);
        }
      } else {
        // Grading keys
        if (e.code === 'ArrowLeft') {
          handleGrade('missed');
        } else if (e.code === 'ArrowDown') {
          e.preventDefault(); // Prevent scrolling
          handleGrade('hard');
        } else if (e.code === 'ArrowRight') {
          handleGrade('perfect');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isRevealed, currentIndex]);

  // Renders
  if (view === 'intro') {
    return (
      <div className={`${styles.container} ${styles.animateFadeIn}`}>
        <div className={styles.hero}>
          <div className={styles.heroIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>Test Your Memory</h2>
          <p>Challenge yourself to recall verses and strengthen your memorization.</p>
          <button className={styles.primaryBtn} onClick={() => setView('setup')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Start New Test
          </button>
        </div>

        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className={styles.featureText}>
              <h4>Self-Graded</h4>
              <p>Track your confidence per verse</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.featureIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div className={styles.featureText}>
              <h4>Custom Ranges</h4>
              <p>Test specific parts of Surahs</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className={`${styles.container} ${styles.animateFadeIn}`}>
        <div className={styles.setupForm}>
          <h3>Configure Test</h3>
          
          <div className={styles.formGroup}>
            <label>Select Surah</label>
            <select 
              className={styles.selectInput}
              value={config.surahNumber}
              onChange={(e) => handleSurahChange(Number(e.target.value))}
            >
              {surahs.map(s => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.transliteration} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Verse Range (1 - {currentSurah.totalVerses})</label>
            <div className={styles.rangeInputs}>
              <input 
                type="number" 
                className={styles.numberInput}
                min={1}
                max={currentSurah.totalVerses}
                value={config.startVerse}
                onChange={(e) => setConfig({...config, startVerse: Number(e.target.value)})}
              />
              <span>to</span>
              <input 
                type="number" 
                className={styles.numberInput}
                min={1}
                max={currentSurah.totalVerses}
                value={config.endVerse}
                onChange={(e) => setConfig({...config, endVerse: Number(e.target.value)})}
              />
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={startTest}>
            Begin Test
          </button>
          <button 
            className={styles.secondaryBtn} 
            style={{marginTop: '12px', width: '100%'}}
            onClick={() => setView('intro')}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (view === 'active') {
    const currentVerse = testVerses[currentIndex];
    const progress = Math.round(((currentIndex) / testVerses.length) * 100);

    return (
      <div className={`${styles.container} ${styles.animateFadeIn}`}>
        <div className={styles.testCard}>
          <div className={styles.header}>
            <div className={styles.progress}>
              <span>Verse {currentIndex + 1} of {testVerses.length}</span>
              <span>{progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{width: `${progress}%`}}></div>
            </div>
          </div>

          <div className={styles.questionBox}>
            <span className={styles.questionLabel}>Recite Verse {currentVerse.verse}</span>
            <div className={`${styles.verseCard} ${isRevealed ? styles.revealed : ''}`}>
              <p className={`${styles.arabicText} arabic-text ${styles.blurText}`}>
                {currentVerse.text}
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            {!isRevealed ? (
              <button className={styles.primaryBtn} onClick={() => setIsRevealed(true)}>
                Reveal Answer
              </button>
            ) : (
              <div className={styles.gradeButtons}>
                <button className={`${styles.gradeBtn} ${styles.gradeRed}`} onClick={() => handleGrade('missed')} title="Left Arrow">
                  Missed (←)
                </button>
                 <button className={`${styles.gradeBtn} ${styles.gradeYellow}`} onClick={() => handleGrade('hard')} title="Down Arrow">
                  Hard (↓)
                </button>
                <button className={`${styles.gradeBtn} ${styles.gradeGreen}`} onClick={() => handleGrade('perfect')} title="Right Arrow">
                  Perfect (→)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    const scorePercentage = Math.round((results.correct / results.total) * 100);
    
    return (
      <div className={`${styles.container} ${styles.animateFadeIn}`}>
        <div className={`${styles.testCard} ${styles.resultsCard}`}>
          <h2>Test Complete!</h2>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{scorePercentage}%</span>
            <span className={styles.scoreLabel}>Accuracy</span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.total}</span>
              <span className={styles.statLabel}>Verses Tested</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{results.perfect}</span>
              <span className={styles.statLabel}>Perfect Recall</span>
            </div>
          </div>

          <button className={styles.primaryBtn} onClick={restart}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
