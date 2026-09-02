'use client';

import { useState, useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

interface LetterTile {
  id: string;
  char: string;
}

const ALL_LETTERS = [
  'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ',
  'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص',
  'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق',
  'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي'
];

interface LetterOrderProps {
  styles: any;
  onAwardXp: (amount: number) => void;
  onBackToArcade: () => void;
}

export default function LetterOrder({ styles, onAwardXp, onBackToArcade }: LetterOrderProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [filledSlots, setFilledSlots] = useState<string[]>([]);
  const [nextSlotIdx, setNextSlotIdx] = useState(0);
  const [pool, setPool] = useState<LetterTile[]>([]);
  const [clickedTileIds, setClickedTileIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shakeActive, setShakeActive] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Audio synthesizer utilizing Web Audio API
  const playSound = (type: 'correct' | 'wrong' | 'magic') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'magic') {
        const now = ctx.currentTime;
        const playTone = (freq: number, start: number, duration: number) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, start);
          o.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.08, start);
          g.gain.exponentialRampToValueAtTime(0.005, start + duration);
          o.start(start);
          o.stop(start + duration);
        };
        playTone(523.25, now, 0.25); // C5
        playTone(659.25, now + 0.06, 0.25); // E5
        playTone(783.99, now + 0.12, 0.25); // G5
        playTone(1046.50, now + 0.18, 0.35); // C6
      }
    } catch (err) {
      // Catch browser blocking
    }
  };

  const initGame = () => {
    setFilledSlots(new Array(ALL_LETTERS.length).fill(''));
    setNextSlotIdx(0);
    setClickedTileIds([]);
    setShakeActive(false);
    setMistakes(0);
    setXpAwarded(false);

    // Build shuffled pool of all 28 letter tiles
    const tiles: LetterTile[] = ALL_LETTERS.map((char, index) => ({
      id: `${char}_${index}_${Math.random()}`,
      char,
    }));
    const shuffledTiles = tiles.sort(() => 0.5 - Math.random());
    setPool(shuffledTiles);
    setGameState('playing');
  };

  const handleTileClick = (tile: LetterTile) => {
    if (gameState !== 'playing') return;

    const targetChar = ALL_LETTERS[nextSlotIdx];
    const isCorrect = tile.char === targetChar;

    if (isCorrect) {
      playSound('correct');
      const updatedSlots = [...filledSlots];
      updatedSlots[nextSlotIdx] = tile.char;
      setFilledSlots(updatedSlots);
      setClickedTileIds((prev) => [...prev, tile.id]);

      const nextSlot = nextSlotIdx + 1;
      if (nextSlot >= ALL_LETTERS.length) {
        // All letters sorted successfully!
        playSound('magic');
        canvasConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        setGameState('gameover');
        
        if (!xpAwarded) {
          onAwardXp(60); // Award 60 XP
          setXpAwarded(true);
        }
      } else {
        setNextSlotIdx(nextSlot);
      }
    } else {
      playSound('wrong');
      setMistakes((prev) => prev + 1);
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.wordBuilderBoard}>
        <div className={styles.gameHeaderBar}>
          <button onClick={onBackToArcade} className={styles.backToArcadeBtn}>
            🎮 Back to Arcade
          </button>
          <span className={styles.gameTitle}>Alphabet Sorter 🧩</span>
          {gameState === 'playing' && (
            <span className={styles.gameScoreBadge}>
              Sorted: {nextSlotIdx} / 28
            </span>
          )}
        </div>
        {/* --- STAGE: PLAYING BOARD --- */}
        {gameState === 'playing' && (
          <>
            <div style={{ textAlign: 'center', marginTop: '0.25rem', width: '100%' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.1rem', animation: 'bounce 2.5s infinite' }}>
                🔠
              </div>
              <h4 style={{
                fontSize: '1.45rem',
                fontWeight: 950,
                color: '#ca8a04',
                margin: '0 0 0.25rem 0',
              }}>
                Sort the Arabic Alphabet
              </h4>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--foreground-secondary)',
                margin: 0
              }}>
                Click the letters in their correct alphabetical order (right-to-left)!
              </p>
            </div>

            {/* Target Slots layout from right to left in a 7x4 grid */}
            <div 
              className={shakeActive ? 'shake-element' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                direction: 'rtl',
                margin: '1rem 0',
                width: '100%',
                maxWidth: '400px'
              }}
            >
              {ALL_LETTERS.map((_, idx) => {
                const isCurrent = idx === nextSlotIdx;
                const charVal = filledSlots[idx];

                return (
                  <div
                    key={idx}
                    className={`${styles.letterSlot} ${isCurrent ? styles.activeSlot : ''} ${charVal ? styles.filledSlot : ''}`}
                    style={{
                      width: '46px',
                      height: '46px',
                      fontSize: '1.35rem',
                      borderRadius: '10px',
                      borderWidth: '2.5px'
                    }}
                  >
                    {charVal}
                  </div>
                );
              })}
            </div>

            {/* Shuffled pool tile selectors in a 7x4 grid */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--foreground-secondary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Click the next alphabetical letter:
              </div>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                  width: '100%',
                  maxWidth: '400px',
                  marginTop: '0.25rem'
                }}
              >
                {pool.map((tile) => {
                  const isUsed = clickedTileIds.includes(tile.id);
                  return (
                    <div
                      key={tile.id}
                      onClick={() => handleTileClick(tile)}
                      className={`${styles.shapeCard} ${isUsed ? styles.disabledCard : ''}`}
                      style={{
                        width: '46px',
                        height: '46px',
                        fontSize: '1.35rem',
                        borderRadius: '10px',
                        borderWidth: '2px',
                        padding: 0
                      }}
                    >
                      {tile.char}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* --- STAGE: INTRO OVERLAY --- */}
        {gameState === 'intro' && (
          <div className={styles.gameOverlay}>
            <div className={styles.summaryCard} style={{ borderColor: '#ca8a04' }}>
              <div className={styles.summaryEmoji}>🧩</div>
              <h3 className={styles.summaryTitle}>Alphabet Sorter</h3>
              <p className={styles.summaryText}>
                All 28 Arabic letters will appear shuffled at the bottom. Click them in the correct alphabetical order from Alif to Yaa (`أ` to `ي`) to place them in the grid!
              </p>

              <div style={{
                background: '#fffbeb',
                border: '1.5px solid #fef3c7',
                padding: '12px',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#854d0e',
                lineHeight: 1.5,
              }}>
                💡 **Tip:** The alphabet slots flow from right-to-left. Try to arrange them as fast as possible with minimal mistakes!
              </div>

              <button onClick={initGame} className={styles.restartGameBtn} style={{ background: 'linear-gradient(135deg, #ca8a04 0%, #a16207 100%)', boxShadow: '0 4px 12px rgba(202, 138, 4, 0.3)' }}>
                🚀 Start Sorting!
              </button>
            </div>
          </div>
        )}

        {/* --- STAGE: GAMEOVER OVERLAY --- */}
        {gameState === 'gameover' && (
          <div className={styles.gameOverlay}>
            <div className={styles.summaryCard} style={{ borderColor: '#10b981' }}>
              <div className={styles.summaryEmoji}>👑</div>
              <h3 className={styles.summaryTitle}>Alphabet Master!</h3>
              <p className={styles.summaryText}>
                You sorted the entire Arabic alphabet from Alif to Yaa perfectly!
              </p>

              <div className={styles.summaryStatsBox}>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal}>{mistakes}</span>
                  <span className={styles.summaryStatLbl}>Mistakes</span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal} style={{ color: '#10b981' }}>
                    {mistakes === 0 ? '🏆 Perfect' : '👍 Great'}
                  </span>
                  <span className={styles.summaryStatLbl}>Accuracy</span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal} style={{ color: '#ca8a04' }}>+60</span>
                  <span className={styles.summaryStatLbl}>XP Won</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={initGame} className={styles.restartGameBtn} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                  🔄 Play Again
                </button>
                <button 
                  onClick={onBackToArcade} 
                  className={styles.restartGameBtn} 
                  style={{ background: '#6b7280', boxShadow: 'none' }}
                >
                  🎮 Return to Arcade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shakeSlots {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .shake-element {
          animation: shakeSlots 0.4s ease;
        }
      `}</style>
    </div>
  );
}
