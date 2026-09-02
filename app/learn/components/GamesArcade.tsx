'use client';

import { useState } from 'react';
import LetterOrder from './games/LetterOrder';
import VowelPopper from './games/VowelPopper';
import WordBuilder from './games/WordBuilder';

interface GamesArcadeProps {
  styles: any;
  userProgress: {
    xp: number;
    completedLessons: string[];
    unlockedLevels: Record<string, ('explorer' | 'adventure' | 'master')[]>;
  };
  onAwardXp: (amount: number) => void;
}

export default function GamesArcade({ styles, userProgress, onAwardXp }: GamesArcadeProps) {
  const [selectedGame, setSelectedGame] = useState<'menu' | 'order' | 'popper' | 'builder'>('menu');

  if (selectedGame === 'order') {
    return (
      <LetterOrder 
        styles={styles} 
        onAwardXp={onAwardXp} 
        onBackToArcade={() => setSelectedGame('menu')} 
      />
    );
  }

  if (selectedGame === 'popper') {
    return (
      <VowelPopper 
        styles={styles} 
        onAwardXp={onAwardXp} 
        onBackToArcade={() => setSelectedGame('menu')} 
      />
    );
  }

  if (selectedGame === 'builder') {
    return (
      <WordBuilder 
        styles={styles} 
        onAwardXp={onAwardXp} 
        onBackToArcade={() => setSelectedGame('menu')} 
      />
    );
  }

  return (
    <div>
      {/* Mini Arcade Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2.5rem',
        padding: '0 1rem',
      }}>
        <h2 style={{
          fontSize: '2.25rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #c69320 0%, #eab308 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem',
        }}>
          🕹️ Play & Learn Games Arcade 🎮
        </h2>
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--foreground-secondary)',
          maxWidth: '600px',
          margin: '0 auto 1.5rem',
        }}>
          Play fun games to test your Arabic alphabet recognition, shapes, and Tajweed diacritics skills! Earn XP to level up your ranking!
        </p>

        {/* XP Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(198, 147, 32, 0.1)',
          border: '2px dashed #c69320',
          padding: '0.6rem 1.5rem',
          borderRadius: '50px',
          fontWeight: 800,
          color: '#c69320',
          fontSize: '1.05rem',
        }}>
          <span>⭐ Current Score Balance:</span>
          <span style={{ fontWeight: 950, fontSize: '1.2rem', color: '#b8860b' }}>
            {userProgress.xp} XP
          </span>
        </div>
      </div>

      {/* Games Grid Selection */}
      <div className={styles.gamesArcadeGrid}>
        
        {/* Game 1: Arabic Alphabet Sorter */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardHeader}>
            🧩
            <span className={styles.difficultyBadge}>Easy</span>
          </div>
          <div className={styles.gameCardContent}>
            <h3 className={styles.gameCardTitle}>Alphabet Sorter</h3>
            <p className={styles.gameCardDesc}>
              Sort the shuffled Arabic letters from Alif to Yaa in their correct alphabetical order right-to-left! Play through 5 levels.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(254, 240, 138, 0.3)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#854d0e',
            }}>
              <span>🎁 Award:</span>
              <span>+60 XP points</span>
            </div>
            <button 
              onClick={() => setSelectedGame('order')} 
              className={styles.playGameBtn}
            >
              Play Game 🚀
            </button>
          </div>
        </div>

        {/* Game 2: Tajweed Raindrops */}
        <div className={styles.gameCard}>
          <div className={`${styles.gameCardHeader} ${styles.gameCardHeader_popper}`} style={{ background: 'linear-gradient(135deg, #bae6fd 0%, #38bdf8 100%)' }}>
            🌧️
            <span className={styles.difficultyBadge} style={{ background: '#2563eb' }}>Medium</span>
          </div>
          <div className={styles.gameCardContent}>
            <h3 className={styles.gameCardTitle}>Tajweed Raindrops</h3>
            <p className={styles.gameCardDesc}>
              Match the vowel sound of falling raindrops carrying Arabic letters! Choose the correct sound option before they hit the ground.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(219, 234, 254, 0.4)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#1e40af',
            }}>
              <span>🎁 Award:</span>
              <span>Up to +50 XP points</span>
            </div>
            <button 
              onClick={() => setSelectedGame('popper')} 
              className={styles.playGameBtn}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}
            >
              Play Game 🚀
            </button>
          </div>
        </div>

        {/* Game 3: Arabic Word Builder */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardHeader} style={{ background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)' }}>
            🛠️
            <span className={styles.difficultyBadge} style={{ background: '#ea580c' }}>Hard</span>
          </div>
          <div className={styles.gameCardContent}>
            <h3 className={styles.gameCardTitle}>Arabic Word Builder</h3>
            <p className={styles.gameCardDesc}>
              Learn how isolated Arabic letters change shape and connect together to spell complete words! Spells right-to-left.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(254, 215, 170, 0.4)',
              padding: '8px 16px',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#c2410c',
            }}>
              <span>🎁 Award:</span>
              <span>+70 XP points</span>
            </div>
            <button 
              onClick={() => setSelectedGame('builder')} 
              className={styles.playGameBtn}
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 8px 20px rgba(234, 88, 12, 0.3)' }}
            >
              Play Game 🚀
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
