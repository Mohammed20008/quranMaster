'use client';

import { useState, useEffect } from 'react';
import canvasConfetti from 'canvas-confetti';

interface LetterVowelData {
  base: string;
  name: string;
  fathah: string;
  kasrah: string;
  dammah: string;
  fathahSound: string;
  kasrahSound: string;
  dammahSound: string;
}

const LETTER_VOWEL_DATA: LetterVowelData[] = [
  { base: 'أ', name: 'Alif', fathah: 'أَ', kasrah: 'إِ', dammah: 'أُ', fathahSound: 'a', kasrahSound: 'e', dammahSound: 'o' },
  { base: 'ب', name: 'Baa', fathah: 'بَ', kasrah: 'بِ', dammah: 'بُ', fathahSound: 'ba', kasrahSound: 'be', dammahSound: 'bo' },
  { base: 'ت', name: 'Taa', fathah: 'تَ', kasrah: 'تِ', dammah: 'تُ', fathahSound: 'ta', kasrahSound: 'te', dammahSound: 'to' },
  { base: 'ث', name: 'Thaa', fathah: 'ثَ', kasrah: 'ثِ', dammah: 'ثُ', fathahSound: 'tha', kasrahSound: 'the', dammahSound: 'tho' },
  { base: 'ج', name: 'Jeem', fathah: 'جَ', kasrah: 'جِ', dammah: 'جُ', fathahSound: 'ja', kasrahSound: 'je', dammahSound: 'jo' },
  { base: 'ح', name: 'Haa', fathah: 'حَ', kasrah: 'حِ', dammah: 'حُ', fathahSound: 'ha', kasrahSound: 'he', dammahSound: 'ho' },
  { base: 'خ', name: 'Khaa', fathah: 'خَ', kasrah: 'خِ', dammah: 'خُ', fathahSound: 'kha', kasrahSound: 'khe', dammahSound: 'kho' },
  { base: 'د', name: 'Dal', fathah: 'دَ', kasrah: 'دِ', dammah: 'دُ', fathahSound: 'da', kasrahSound: 'de', dammahSound: 'do' },
  { base: 'ذ', name: 'Thal', fathah: 'ذَ', kasrah: 'ذِ', dammah: 'ذُ', fathahSound: 'dha', kasrahSound: 'dhe', dammahSound: 'dho' },
  { base: 'ر', name: 'Raa', fathah: 'رَ', kasrah: 'رِ', dammah: 'رُ', fathahSound: 'ra', kasrahSound: 're', dammahSound: 'ro' },
  { base: 'ز', name: 'Zayn', fathah: 'زَ', kasrah: 'زِ', dammah: 'زُ', fathahSound: 'za', kasrahSound: 'ze', dammahSound: 'zo' },
  { base: 'س', name: 'Seen', fathah: 'سَ', kasrah: 'سِ', dammah: 'سُ', fathahSound: 'sa', kasrahSound: 'se', dammahSound: 'so' },
  { base: 'ش', name: 'Sheen', fathah: 'شَ', kasrah: 'شِ', dammah: 'شُ', fathahSound: 'sha', kasrahSound: 'she', dammahSound: 'sho' },
  { base: 'ص', name: 'Saad', fathah: 'صَ', kasrah: 'صِ', dammah: 'صُ', fathahSound: 'sa', kasrahSound: 'se', dammahSound: 'so' },
  { base: 'ض', name: 'Daad', fathah: 'ضَ', kasrah: 'ضِ', dammah: 'ضُ', fathahSound: 'da', kasrahSound: 'de', dammahSound: 'do' },
  { base: 'ط', name: 'Taa (Emphatic)', fathah: 'طَ', kasrah: 'طِ', dammah: 'طُ', fathahSound: 'ta', kasrahSound: 'te', dammahSound: 'to' },
  { base: 'ظ', name: 'Zaa (Emphatic)', fathah: 'ظَ', kasrah: 'ظِ', dammah: 'ظُ', fathahSound: 'za', kasrahSound: 'ze', dammahSound: 'zo' },
  { base: 'ع', name: 'Ayn', fathah: 'عَ', kasrah: 'عِ', dammah: 'عُ', fathahSound: 'a', kasrahSound: 'e', dammahSound: 'o' },
  { base: 'غ', name: 'Ghayn', fathah: 'غَ', kasrah: 'غِ', dammah: 'غُ', fathahSound: 'gha', kasrahSound: 'ghe', dammahSound: 'gho' },
  { base: 'ف', name: 'Faa', fathah: 'فَ', kasrah: 'فِ', dammah: 'فُ', fathahSound: 'fa', kasrahSound: 'fe', dammahSound: 'fo' },
  { base: 'ق', name: 'Qaaf', fathah: 'قَ', kasrah: 'قِ', dammah: 'قُ', fathahSound: 'qa', kasrahSound: 'qe', dammahSound: 'qo' },
  { base: 'ك', name: 'Kaaf', fathah: 'كَ', kasrah: 'كِ', dammah: 'كُ', fathahSound: 'ka', kasrahSound: 'ke', dammahSound: 'ko' },
  { base: 'ل', name: 'Laam', fathah: 'لَ', kasrah: 'لِ', dammah: 'لُ', fathahSound: 'la', kasrahSound: 'le', dammahSound: 'lo' },
  { base: 'م', name: 'Meem', fathah: 'مَ', kasrah: 'مِ', dammah: 'مُ', fathahSound: 'ma', kasrahSound: 'me', dammahSound: 'mo' },
  { base: 'ن', name: 'Noon', fathah: 'نَ', kasrah: 'نِ', dammah: 'نُ', fathahSound: 'na', kasrahSound: 'ne', dammahSound: 'no' },
  { base: 'هـ', name: 'Haa (هـ)', fathah: 'هَ', kasrah: 'هِ', dammah: 'هُ', fathahSound: 'ha', kasrahSound: 'he', dammahSound: 'ho' },
  { base: 'و', name: 'Waw', fathah: 'وَ', kasrah: 'وِ', dammah: 'وُ', fathahSound: 'wa', kasrahSound: 'we', dammahSound: 'wo' },
  { base: 'ي', name: 'Yaa', fathah: 'يَ', kasrah: 'يِ', dammah: 'يُ', fathahSound: 'ya', kasrahSound: 'ye', dammahSound: 'yo' }
];

interface OptionSound {
  sound: string;
  vowelType: 'fathah' | 'kasrah' | 'dammah';
}

interface RaindropState {
  letterName: string;
  char: string;
  vowelType: 'fathah' | 'kasrah' | 'dammah';
  sound: string;
  options: OptionSound[];
  y: number;
  shake: boolean;
}

interface SplashState {
  id: string;
  x: number;
  y: number;
  type: 'correct' | 'wrong' | 'ground';
}

interface PopupState {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface VowelPopperProps {
  styles: any;
  onAwardXp: (amount: number) => void;
  onBackToArcade: () => void;
}

const TOTAL_DROPS = 15;

export default function VowelPopper({ styles, onAwardXp, onBackToArcade }: VowelPopperProps) {
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'gameover'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);

  // Raindrop gameplay states
  const [currentDropIdx, setCurrentDropIdx] = useState(0);
  const [currentDrop, setCurrentDrop] = useState<RaindropState | null>(null);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [splashes, setSplashes] = useState<SplashState[]>([]);
  const [popups, setPopups] = useState<PopupState[]>([]);

  // Synthesizing sound effects with Web Audio API
  const playSound = (type: 'correct' | 'wrong' | 'splash') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        // Cute upward water splash sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1300, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else if (type === 'wrong') {
        // Damped cartoon buzzer
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(75, ctx.currentTime + 0.26);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.26);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      } else if (type === 'splash') {
        // Soft noise water impact splash
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (err) {
      // Audio context blocked
    }
  };

  const startCountdown = () => {
    setGameState('countdown');
    setCountdown(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMistakes(0);
    setCurrentDropIdx(0);
    setSplashes([]);
    setPopups([]);
    setXpAwarded(false);

    const countInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countInterval);
          setGameState('playing');
          spawnNewDrop(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Helper to spawn a new raindrop containing a vowel
  const spawnNewDrop = (idx: number) => {
    if (idx >= TOTAL_DROPS) {
      endGame();
      return;
    }

    // Pick a random letter data
    const randomLetter = LETTER_VOWEL_DATA[Math.floor(Math.random() * LETTER_VOWEL_DATA.length)];
    const vowelTypes: ('fathah' | 'kasrah' | 'dammah')[] = ['fathah', 'kasrah', 'dammah'];
    const randomVowel = vowelTypes[Math.floor(Math.random() * vowelTypes.length)];

    let charVal = randomLetter.fathah;
    let correctSound = randomLetter.fathahSound;
    if (randomVowel === 'kasrah') {
      charVal = randomLetter.kasrah;
      correctSound = randomLetter.kasrahSound;
    } else if (randomVowel === 'dammah') {
      charVal = randomLetter.dammah;
      correctSound = randomLetter.dammahSound;
    }

    // Build option pool
    const optionsPool: OptionSound[] = [
      { sound: randomLetter.fathahSound, vowelType: 'fathah' },
      { sound: randomLetter.kasrahSound, vowelType: 'kasrah' },
      { sound: randomLetter.dammahSound, vowelType: 'dammah' }
    ];

    // Shuffle options
    const shuffledOptions = optionsPool.sort(() => 0.5 - Math.random());

    setSelectedOptIdx(null);
    setIsAnswering(false);
    setCurrentDropIdx(idx);
    setCurrentDrop({
      letterName: randomLetter.name,
      char: charVal,
      vowelType: randomVowel,
      sound: correctSound,
      options: shuffledOptions,
      y: 0,
      shake: false
    });
  };

  // Select vowel option button handler
  const handleOptionSelect = (optIdx: number) => {
    if (gameState !== 'playing' || !currentDrop || isAnswering) return;
    setIsAnswering(true);
    setSelectedOptIdx(optIdx);

    const isMatch = currentDrop.options[optIdx].vowelType === currentDrop.vowelType;

    if (isMatch) {
      playSound('correct');
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxCombo((prev) => Math.max(prev, nextCombo));

      const pointsGained = 10 + (nextCombo > 1 ? (nextCombo - 1) * 5 : 0);
      setScore((prev) => prev + pointsGained);

      // Create splash animation
      const splashId = Math.random().toString();
      setSplashes((prev) => [...prev, { id: splashId, x: 50, y: currentDrop.y, type: 'correct' }]);
      setTimeout(() => {
        setSplashes((prev) => prev.filter((s) => s.id !== splashId));
      }, 400);

      // Score popup
      const popupId = Math.random().toString();
      setPopups((prev) => [...prev, {
        id: popupId,
        text: `+${pointsGained} XP ${nextCombo > 1 ? `(Combo x${nextCombo})` : ''}`,
        x: 50,
        y: currentDrop.y,
        color: '#10b981'
      }]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 800);

      // Transition to next drop after splash displays
      setTimeout(() => {
        spawnNewDrop(currentDropIdx + 1);
      }, 450);
    } else {
      playSound('wrong');
      setCombo(0);
      setMistakes((prev) => prev + 1);

      // Shake drop
      setCurrentDrop((prev) => (prev ? { ...prev, shake: true } : null));
      setTimeout(() => {
        setCurrentDrop((prev) => (prev ? { ...prev, shake: false } : null));
      }, 400);

      // Add feedback popup
      const popupId = Math.random().toString();
      setPopups((prev) => [...prev, {
        id: popupId,
        text: 'Wrong vowel!',
        x: 50,
        y: currentDrop.y,
        color: '#ef4444'
      }]);
      setTimeout(() => {
        setPopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 800);

      // Allow correcting their choice
      setTimeout(() => {
        setIsAnswering(false);
        setSelectedOptIdx(null);
      }, 450);
    }
  };

  // Drop reaches floor without being answered
  const handleDropMissed = () => {
    if (!currentDrop || isAnswering) return;
    setIsAnswering(true);
    playSound('splash');
    setCombo(0);

    // Ground splash
    const splashId = Math.random().toString();
    setSplashes((prev) => [...prev, { id: splashId, x: 50, y: 92, type: 'ground' }]);
    setTimeout(() => {
      setSplashes((prev) => prev.filter((s) => s.id !== splashId));
    }, 400);

    // Feedback popup
    const popupId = Math.random().toString();
    setPopups((prev) => [...prev, {
      id: popupId,
      text: 'Splash! Missed',
      x: 50,
      y: 85,
      color: '#0284c7'
    }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== popupId));
    }, 800);

    // Wait and spawn next
    setTimeout(() => {
      spawnNewDrop(currentDropIdx + 1);
    }, 450);
  };

  // Raindrop falling game loop
  useEffect(() => {
    if (gameState !== 'playing' || !currentDrop || isAnswering) return;

    // falling speed increments based on current combo
    const baseSpeed = 0.85; 
    const speedMultiplier = 1 + Math.min(1.0, combo * 0.05);
    const tickSpeed = baseSpeed * speedMultiplier;

    const fallInterval = setInterval(() => {
      setCurrentDrop((prev) => {
        if (!prev) return null;
        const nextY = prev.y + tickSpeed;
        if (nextY >= 100) {
          clearInterval(fallInterval);
          handleDropMissed();
          return { ...prev, y: 100 };
        }
        return { ...prev, y: nextY };
      });
    }, 50);

    return () => clearInterval(fallInterval);
  }, [gameState, currentDrop === null, currentDropIdx, combo, isAnswering]);

  // Keyboard number keys hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing' || !currentDrop || isAnswering) return;
      if (e.key === '1') handleOptionSelect(0);
      if (e.key === '2') handleOptionSelect(1);
      if (e.key === '3') handleOptionSelect(2);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentDrop, currentDropIdx, isAnswering]);

  const endGame = () => {
    setGameState('gameover');
    canvasConfetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    // Calculate XP (max 50 XP, 1 XP for every 10 points)
    const earnedXp = Math.min(50, Math.floor(score / 10));
    if (earnedXp > 0 && !xpAwarded) {
      onAwardXp(earnedXp);
      setXpAwarded(true);
    }
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.popperBoard}>
        <div className={styles.gameHeaderBar} style={{ borderBottom: 'none', marginBottom: '1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBackToArcade} className={styles.backToArcadeBtn}>
            🎮 Back to Arcade
          </button>
          <span className={styles.gameTitle}>Tajweed Raindrops 🌧️</span>
          {gameState === 'playing' && (
            <span className={styles.gameScoreBadge}>
              Drop: {currentDropIdx + 1} / {TOTAL_DROPS}
            </span>
          )}
        </div>
        {/* Score & Combo HUD inside the board */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #e2e8f0',
            padding: '4px 14px',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#1e293b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}>
            Score: <span style={{ color: '#0ea5e9' }}>{score}</span>
          </div>

          {combo > 1 && (
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              color: 'white',
              padding: '4px 14px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: 900,
              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
              animation: 'pulse 1s infinite alternate',
            }}>
              🔥 Combo x{combo}
            </div>
          )}
        </div>

        {/* --- STAGE: PLAYING BOARD --- */}
        {gameState === 'playing' && currentDrop && (
          <>
            {/* Cute Rain Cloud at top */}
            <div className={styles.cloudContainer}>
              <div className={styles.rainCloud}>
                <div className={styles.cloudFace}>
                  <div className={styles.cloudEyes}>
                    <div className={styles.cloudEye}></div>
                    <div className={styles.cloudEye}></div>
                  </div>
                  <div className={styles.cloudSmile}></div>
                </div>
              </div>
            </div>

            {/* Falling Raindrop */}
            <div
              className={`${styles.raindropContainer} ${currentDrop.shake ? styles.shaking : ''}`}
              style={{
                left: 'calc(50% - 40px)',
                top: `calc(130px + ${currentDrop.y} * (100% - 370px) / 100)`, // responsive full page fall height
                opacity: currentDrop.y >= 98 || (isAnswering && selectedOptIdx !== null) ? 0 : 1,
                transition: 'opacity 0.15s ease'
              }}
            >
              <svg viewBox="0 0 100 120" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 5 C72 45 88 68 88 88 A38 38 0 0 1 12 88 C12 68 28 45 50 5 Z"
                  fill="url(#dropGrad)"
                  stroke="#0284c7"
                  strokeWidth="2"
                  filter="drop-shadow(0px 4px 6px rgba(2, 132, 199, 0.2))"
                />
                <text
                  x="50"
                  y="72"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="52"
                  fontWeight="900"
                  fontFamily="var(--font-arabic-alt), var(--font-qpc), serif"
                  filter="drop-shadow(0px 2.5px 2.5px rgba(0, 0, 0, 0.4))"
                >
                  {currentDrop.char}
                </text>
              </svg>
            </div>

            {/* Ripple puddle line on ground */}
            <div className={styles.puddleLayer}></div>

            {/* Render Splash Animations */}
            {splashes.map((splash) => (
              <div
                key={splash.id}
                className={styles.splashBurst}
                style={{
                  left: '50%',
                  top: `calc(130px + ${splash.y} * (100% - 370px) / 100 + 48px)`
                }}
              >
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: '#38bdf8' }}>
                  <path d="M50 50 L40 10 A4 4 0 0 1 50 10 Z" />
                  <path d="M50 50 L10 40 A4 4 0 0 1 10 50 Z" />
                  <path d="M50 50 L25 75 A4 4 0 0 1 15 65 Z" />
                  <path d="M50 50 L60 90 A4 4 0 0 1 50 90 Z" />
                  <path d="M50 50 L90 60 A4 4 0 0 1 90 50 Z" />
                  <path d="M50 50 L75 25 A4 4 0 0 1 85 35 Z" />
                </svg>
              </div>
            ))}

            {/* Floating popups */}
            {popups.map((p) => (
              <div
                key={p.id}
                className={styles.floatingPoints}
                style={{
                  left: '50%',
                  top: `calc(130px + ${p.y} * (100% - 370px) / 100)`,
                  transform: 'translateX(-50%)',
                  color: p.color,
                  textShadow: '0 2px 4px rgba(255,255,255,0.85)',
                  fontSize: '1.4rem'
                }}
              >
                {p.text}
              </div>
            ))}

            {/* Options Shelf */}
            <div className={styles.optionsShelf}>
              {currentDrop.options.map((opt, oIdx) => {
                const isSelected = selectedOptIdx === oIdx;
                const isCorrectVal = opt.vowelType === currentDrop.vowelType;

                let cardClass = styles.optionCard;
                if (isSelected) {
                  cardClass += isCorrectVal
                    ? ` ${styles.correctSelected}`
                    : ` ${styles.incorrectSelected}`;
                }

                return (
                  <div
                    key={oIdx}
                    onClick={() => handleOptionSelect(oIdx)}
                    className={cardClass}
                  >
                    <span className={styles.hotkeyBadge}>{oIdx + 1}</span>
                    <span className={styles.optionText}>{opt.sound}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* --- STAGE: INTRO OVERLAY --- */}
        {gameState === 'intro' && (
          <div className={styles.gameOverlay}>
            <div className={styles.summaryCard} style={{ borderColor: '#0284c7' }}>
              <div className={styles.summaryEmoji}>🌧️</div>
              <h3 className={styles.summaryTitle} style={{ color: '#0284c7' }}>Tajweed Raindrops</h3>
              <p className={styles.summaryText}>
                Cute raindrops carrying Arabic letters with Fathah, Kasrah, and Dammah will fall one by one. Choose the option matching its correct sound before it splashes on the ground!
              </p>

              <div style={{
                background: '#f0f9ff',
                border: '1.5px solid #e0f2fe',
                padding: '12px',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#0369a1',
                lineHeight: 1.5,
              }}>
                💡 **Keyboard Shortcuts:** You can click the options or press **1**, **2**, or **3** on your keyboard to choose options instantly!
              </div>

              <button onClick={startCountdown} className={styles.restartGameBtn} style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
                🚀 Ready, Start Game!
              </button>
            </div>
          </div>
        )}

        {/* --- STAGE: COUNTDOWN OVERLAY --- */}
        {gameState === 'countdown' && (
          <div className={styles.gameOverlay} style={{ background: 'rgba(0, 0, 0, 0.75)' }}>
            <div style={{
              fontSize: '6.5rem',
              fontWeight: 950,
              color: '#ffffff',
              animation: 'scaleUpAndFade 1s infinite alternate',
              textShadow: '0 0 20px rgba(2, 132, 199, 0.8)',
            }}>
              {countdown > 0 ? countdown : 'GO! 🌧️'}
            </div>
          </div>
        )}

        {/* --- STAGE: GAMEOVER OVERLAY --- */}
        {gameState === 'gameover' && (
          <div className={styles.gameOverlay}>
            <div className={styles.summaryCard} style={{ borderColor: '#10b981' }}>
              <div className={styles.summaryEmoji}>🏆</div>
              <h3 className={styles.summaryTitle}>Spectacular!</h3>
              <p className={styles.summaryText}>
                You answered the raindrops successfully! Let's check your final scorecard:
              </p>

              <div className={styles.summaryStatsBox}>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal}>{score}</span>
                  <span className={styles.summaryStatLbl}>Score</span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal} style={{ color: '#ef4444' }}>{maxCombo}x</span>
                  <span className={styles.summaryStatLbl}>Max Combo</span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal} style={{ color: '#ca8a04' }}>+{Math.min(50, Math.floor(score / 10))}</span>
                  <span className={styles.summaryStatLbl}>XP Won</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button onClick={startCountdown} className={styles.restartGameBtn} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
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
    </div>
  );
}
