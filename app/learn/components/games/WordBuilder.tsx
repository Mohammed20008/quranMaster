'use client';

import { useState } from 'react';
import canvasConfetti from 'canvas-confetti';

interface LetterPart {
  isolated: string;
  correctShape: string;
  distractors: string[];
}

interface WordPuzzle {
  word: string;
  translation: string;
  emoji: string;
  letters: LetterPart[];
}

const EASY_WORDS: WordPuzzle[] = [
  {
    word: 'بَيْت',
    translation: 'House',
    emoji: '🏠',
    letters: [
      { isolated: 'ب', correctShape: 'بـ', distractors: ['ب', 'ـب'] },
      { isolated: 'ي', correctShape: 'ـيـ', distractors: ['يـ', 'ـي'] },
      { isolated: 'ت', correctShape: 'ـت', distractors: ['ت', 'تـ'] },
    ],
  },
  {
    word: 'جَمَل',
    translation: 'Camel',
    emoji: '🐪',
    letters: [
      { isolated: 'ج', correctShape: 'جـ', distractors: ['ج', 'ـجـ'] },
      { isolated: 'م', correctShape: 'ـمـ', distractors: ['مـ', 'ـم'] },
      { isolated: 'ل', correctShape: 'ـل', distractors: ['ل', 'لـ'] },
    ],
  },
  {
    word: 'عَسَل',
    translation: 'Honey',
    emoji: '🍯',
    letters: [
      { isolated: 'ع', correctShape: 'عـ', distractors: ['ع', 'ـعـ'] },
      { isolated: 'س', correctShape: 'ـسـ', distractors: ['سـ', 'س'] },
      { isolated: 'ل', correctShape: 'ـل', distractors: ['ل', 'لـ'] },
    ],
  },
  {
    word: 'قَلَم',
    translation: 'Pen',
    emoji: '🖊️',
    letters: [
      { isolated: 'ق', correctShape: 'قـ', distractors: ['ق', 'ـق'] },
      { isolated: 'ل', correctShape: 'ـلـ', distractors: ['لـ', 'ل'] },
      { isolated: 'م', correctShape: 'ـم', distractors: ['م', 'مـ'] },
    ],
  },
  {
    word: 'أَسَد',
    translation: 'Lion',
    emoji: '🦁',
    letters: [
      { isolated: 'أ', correctShape: 'أ', distractors: ['أَ', 'ـأ'] },
      { isolated: 'س', correctShape: 'سـ', distractors: ['س', 'ـسـ'] },
      { isolated: 'د', correctShape: 'ـد', distractors: ['د', 'دـ'] },
    ],
  },
  {
    word: 'تَاج',
    translation: 'Crown',
    emoji: '👑',
    letters: [
      { isolated: 'ت', correctShape: 'تـ', distractors: ['ت', 'ـت'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'ج', correctShape: 'ج', distractors: ['جـ', 'ـج'] },
    ],
  },
  {
    word: 'خُبْز',
    translation: 'Bread',
    emoji: '🍞',
    letters: [
      { isolated: 'خ', correctShape: 'خـ', distractors: ['خ', 'ـخ'] },
      { isolated: 'ب', correctShape: 'ـبـ', distractors: ['بـ', 'ب'] },
      { isolated: 'ز', correctShape: 'ـز', distractors: ['ز', 'زـ'] },
    ],
  },
  {
    word: 'وَلَد',
    translation: 'Boy',
    emoji: '👦',
    letters: [
      { isolated: 'و', correctShape: 'و', distractors: ['وـ', 'ـو'] },
      { isolated: 'ل', correctShape: 'لـ', distractors: ['ل', 'ـلـ'] },
      { isolated: 'د', correctShape: 'ـد', distractors: ['د', 'دـ'] },
    ],
  },
];

const MEDIUM_WORDS: WordPuzzle[] = [
  {
    word: 'كِتَاب',
    translation: 'Book',
    emoji: '📖',
    letters: [
      { isolated: 'ك', correctShape: 'كـ', distractors: ['ك', 'ـك'] },
      { isolated: 'ت', correctShape: 'ـتـ', distractors: ['تـ', 'ت'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'ب', correctShape: 'ب', distractors: ['بـ', 'ـب'] },
    ],
  },
  {
    word: 'مَسْجِد',
    translation: 'Mosque',
    emoji: '🕌',
    letters: [
      { isolated: 'م', correctShape: 'مـ', distractors: ['م', 'ـم'] },
      { isolated: 'س', correctShape: 'ـسـ', distractors: ['سـ', 'س'] },
      { isolated: 'ج', correctShape: 'ـجـ', distractors: ['جـ', 'ـج'] },
      { isolated: 'د', correctShape: 'ـد', distractors: ['د', 'دـ'] },
    ],
  },
  {
    word: 'هِلَال',
    translation: 'Crescent',
    emoji: '🌙',
    letters: [
      { isolated: 'هـ', correctShape: 'هـ', distractors: ['ه', 'ـهـ'] },
      { isolated: 'ل', correctShape: 'ـلـ', distractors: ['لـ', 'ل'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'ل', correctShape: 'ل', distractors: ['لـ', 'ـل'] },
    ],
  },
  {
    word: 'وَرْدَة',
    translation: 'Rose',
    emoji: '🌹',
    letters: [
      { isolated: 'و', correctShape: 'و', distractors: ['ـو', 'وـ'] },
      { isolated: 'ر', correctShape: 'ر', distractors: ['ـr', 'رـ'] },
      { isolated: 'د', correctShape: 'د', distractors: ['ـد', 'دـ'] },
      { isolated: 'ة', correctShape: 'ة', distractors: ['ـة', 'ةـ'] },
    ],
  },
  {
    word: 'بَقَرَة',
    translation: 'Cow',
    emoji: '🐄',
    letters: [
      { isolated: 'ب', correctShape: 'بـ', distractors: ['ب', 'ـب'] },
      { isolated: 'ق', correctShape: 'ـقـ', distractors: ['قـ', 'ق'] },
      { isolated: 'ر', correctShape: 'ـر', distractors: ['ر', 'رـ'] },
      { isolated: 'ة', correctShape: 'ة', distractors: ['ـة', 'ةـ'] },
    ],
  },
  {
    word: 'نَجْمَة',
    translation: 'Star',
    emoji: '⭐',
    letters: [
      { isolated: 'ن', correctShape: 'نـ', distractors: ['ن', 'ـن'] },
      { isolated: 'ج', correctShape: 'ـجـ', distractors: ['جـ', 'ـج'] },
      { isolated: 'م', correctShape: 'ـمـ', distractors: ['مـ', 'م'] },
      { isolated: 'ة', correctShape: 'ـة', distractors: ['ة', 'ةـ'] },
    ],
  },
  {
    word: 'دَفْتَر',
    translation: 'Notebook',
    emoji: '📓',
    letters: [
      { isolated: 'د', correctShape: 'د', distractors: ['ـد', 'دـ'] },
      { isolated: 'ف', correctShape: 'فـ', distractors: ['ف', 'ـفـ'] },
      { isolated: 'ت', correctShape: 'ـتـ', distractors: ['تـ', 'ت'] },
      { isolated: 'ر', correctShape: 'ـر', distractors: ['ر', 'رـ'] },
    ],
  },
  {
    word: 'بُومَة',
    translation: 'Owl',
    emoji: '🦉',
    letters: [
      { isolated: 'ب', correctShape: 'بـ', distractors: ['ب', 'ـب'] },
      { isolated: 'و', correctShape: 'ـو', distractors: ['و', 'وـ'] },
      { isolated: 'م', correctShape: 'مـ', distractors: ['م', 'ـمـ'] },
      { isolated: 'ة', correctShape: 'ـة', distractors: ['ة', 'ةـ'] },
    ],
  },
];

const HARD_WORDS: WordPuzzle[] = [
  {
    word: 'سَيَّارَة',
    translation: 'Car',
    emoji: '🚗',
    letters: [
      { isolated: 'س', correctShape: 'سـ', distractors: ['س', 'ـس'] },
      { isolated: 'ي', correctShape: 'ـيـ', distractors: ['يـ', 'ـي'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'ر', correctShape: 'ر', distractors: ['ـر', 'رـ'] },
      { isolated: 'ة', correctShape: 'ة', distractors: ['ـة', 'ةـ'] },
    ],
  },
  {
    word: 'فَرَّاشَة',
    translation: 'Butterfly',
    emoji: '🦋',
    letters: [
      { isolated: 'ف', correctShape: 'فـ', distractors: ['ف', 'ـف'] },
      { isolated: 'ر', correctShape: 'ـر', distractors: ['ر', 'رـ'] },
      { isolated: 'ا', correctShape: 'ا', distractors: ['ـا', 'أ'] },
      { isolated: 'ش', correctShape: 'شـ', distractors: ['ش', 'ـش'] },
      { isolated: 'ة', correctShape: 'ـة', distractors: ['ة', 'ةـ'] },
    ],
  },
  {
    word: 'تِمْسَاح',
    translation: 'Crocodile',
    emoji: '🐊',
    letters: [
      { isolated: 'ت', correctShape: 'تـ', distractors: ['ت', 'ـت'] },
      { isolated: 'م', correctShape: 'ـمـ', distractors: ['مـ', 'م'] },
      { isolated: 'س', correctShape: 'ـسـ', distractors: ['سـ', 'س'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'ح', correctShape: 'ح', distractors: ['حـ', 'ـح'] },
    ],
  },
  {
    word: 'مَدْرَسَة',
    translation: 'School',
    emoji: '🏫',
    letters: [
      { isolated: 'م', correctShape: 'مـ', distractors: ['م', 'ـم'] },
      { isolated: 'د', correctShape: 'ـد', distractors: ['د', 'دـ'] },
      { isolated: 'ر', correctShape: 'ر', distractors: ['ـر', 'رـ'] },
      { isolated: 'س', correctShape: 'سـ', distractors: ['س', 'ـس'] },
      { isolated: 'ة', correctShape: 'ـة', distractors: ['ة', 'ةـ'] },
    ],
  },
  {
    word: 'إِبْرِيق',
    translation: 'Jug',
    emoji: '🏺',
    letters: [
      { isolated: 'إ', correctShape: 'إ', distractors: ['إَ', 'ـإ'] },
      { isolated: 'ب', correctShape: 'بـ', distractors: ['ب', 'ـب'] },
      { isolated: 'ر', correctShape: 'ـر', distractors: ['ر', 'رـ'] },
      { isolated: 'ي', correctShape: 'يـ', distractors: ['ـيـ', 'ـي'] },
      { isolated: 'ق', correctShape: 'ـق', distractors: ['ق', 'قـ'] },
    ],
  },
  {
    word: 'بُرْتُقَال',
    translation: 'Orange',
    emoji: '🍊',
    letters: [
      { isolated: 'ب', correctShape: 'بـ', distractors: ['ب', 'ـب'] },
      { isolated: 'ر', correctShape: 'ـر', distractors: ['ر', 'رـ'] },
      { isolated: 'ت', correctShape: 'تـ', distractors: ['ت', 'ـت'] },
      { isolated: 'ق', correctShape: 'ـقـ', distractors: ['قـ', 'ق'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'ل', correctShape: 'ل', distractors: ['لـ', 'ـل'] },
    ],
  },
  {
    word: 'عَنْكَبُوت',
    translation: 'Spider',
    emoji: '🕷️',
    letters: [
      { isolated: 'ع', correctShape: 'عـ', distractors: ['ع', 'ـعـ'] },
      { isolated: 'ن', correctShape: 'ـنـ', distractors: ['نـ', 'ن'] },
      { isolated: 'ك', correctShape: 'ـكـ', distractors: ['كـ', 'ك'] },
      { isolated: 'ب', correctShape: 'ـبـ', distractors: ['بـ', 'ب'] },
      { isolated: 'و', correctShape: 'ـو', distractors: ['و', 'وـ'] },
      { isolated: 'ت', correctShape: 'ت', distractors: ['تـ', 'ـت'] },
    ],
  },
  {
    word: 'سَجَّادَة',
    translation: 'Prayer Mat',
    emoji: '🕌',
    letters: [
      { isolated: 'س', correctShape: 'سـ', distractors: ['س', 'ـس'] },
      { isolated: 'ج', correctShape: 'ـجـ', distractors: ['جـ', 'ـج'] },
      { isolated: 'ا', correctShape: 'ـا', distractors: ['ا', 'أ'] },
      { isolated: 'د', correctShape: 'د', distractors: ['ـد', 'دـ'] },
      { isolated: 'ة', correctShape: 'ة', distractors: ['ـة', 'ةـ'] },
    ],
  },
];

interface OptionCard {
  id: string;
  char: string;
  letterIndex: number;
}

interface WordBuilderProps {
  styles: any;
  onAwardXp: (amount: number) => void;
  onBackToArcade: () => void;
}

export default function WordBuilder({ styles, onAwardXp, onBackToArcade }: WordBuilderProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'fused' | 'gameover'>('intro');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [selectedWords, setSelectedWords] = useState<WordPuzzle[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [filledLetters, setFilledLetters] = useState<string[]>([]);
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);
  const [options, setOptions] = useState<OptionCard[]>([]);
  const [clickedCardIds, setClickedCardIds] = useState<string[]>([]);
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
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
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

  // Initialize a new game session with selected difficulty
  const initGame = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSelectedDifficulty(difficulty);
    
    // Choose word database
    let wordDatabase = EASY_WORDS;
    if (difficulty === 'medium') wordDatabase = MEDIUM_WORDS;
    if (difficulty === 'hard') wordDatabase = HARD_WORDS;

    // Select 5 random words from the selected database
    const shuffled = [...wordDatabase].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    setSelectedWords(selected);
    setCurrentWordIdx(0);
    setMistakes(0);
    setXpAwarded(false);
    loadPuzzleWord(selected[0]);
  };

  // Load a specific puzzle word layout
  const loadPuzzleWord = (puzzle: WordPuzzle) => {
    setGameState('playing');
    setCurrentSlotIdx(0);
    setFilledLetters(new Array(puzzle.letters.length).fill(''));
    setClickedCardIds([]);
    setShakeActive(false);

    // Build the pool of shape options
    const cardPool: OptionCard[] = [];
    puzzle.letters.forEach((letter, letterIdx) => {
      // Add correct shape
      cardPool.push({
        id: `correct_${letterIdx}_${Math.random()}`,
        char: letter.correctShape,
        letterIndex: letterIdx,
      });

      // Add a single distractor dynamically to keep the layout clean
      if (letter.distractors.length > 0) {
        const randomDist = letter.distractors[Math.floor(Math.random() * letter.distractors.length)];
        cardPool.push({
          id: `distractor_${letterIdx}_${Math.random()}`,
          char: randomDist,
          letterIndex: -1, // representing wrong shape
        });
      }
    });

    // Shuffle the options card pool
    const shuffledPool = cardPool.sort(() => 0.5 - Math.random());
    setOptions(shuffledPool);
  };

  const handleCardClick = (card: OptionCard) => {
    if (gameState !== 'playing') return;

    const currentPuzzle = selectedWords[currentWordIdx];
    const isCorrect = card.letterIndex === currentSlotIdx;

    if (isCorrect) {
      // Place the correct letter shape
      playSound('correct');
      const updatedLetters = [...filledLetters];
      updatedLetters[currentSlotIdx] = card.char;
      setFilledLetters(updatedLetters);
      setClickedCardIds((prev) => [...prev, card.id]);

      const nextSlot = currentSlotIdx + 1;
      if (nextSlot >= currentPuzzle.letters.length) {
        // Complete word spell! Transition to fusion board state
        setGameState('fused');
        playSound('magic');
        canvasConfetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
      } else {
        setCurrentSlotIdx(nextSlot);
      }
    } else {
      // Wrong card shape selected
      playSound('wrong');
      setMistakes((prev) => prev + 1);
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 500);
    }
  };

  const handleNextWord = () => {
    const nextIdx = currentWordIdx + 1;
    if (nextIdx < selectedWords.length) {
      setCurrentWordIdx(nextIdx);
      loadPuzzleWord(selectedWords[nextIdx]);
    } else {
      // Game ended
      setGameState('gameover');
      canvasConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      // Determine award XP dynamically
      let xpToAward = 50;
      if (selectedDifficulty === 'medium') xpToAward = 70;
      if (selectedDifficulty === 'hard') xpToAward = 90;

      if (!xpAwarded) {
        onAwardXp(xpToAward);
        setXpAwarded(true);
      }
    }
  };

  const currentPuzzle = selectedWords[currentWordIdx];

  // Helper to get selected difficulty label
  const getDifficultyLabel = () => {
    if (selectedDifficulty === 'easy') return 'Easy';
    if (selectedDifficulty === 'medium') return 'Medium';
    return 'Hard';
  };

  // Helper to get total XP earned for current selection
  const getDifficultyXpValue = () => {
    if (selectedDifficulty === 'easy') return 50;
    if (selectedDifficulty === 'medium') return 70;
    return 90;
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.wordBuilderBoard}>
        <div className={styles.gameHeaderBar}>
          <button onClick={onBackToArcade} className={styles.backToArcadeBtn}>
            🎮 Back to Arcade
          </button>
          <span className={styles.gameTitle}>Arabic Word Builder 🛠️</span>
          {selectedWords.length > 0 && (
            <span className={styles.gameScoreBadge}>
              Word: {currentWordIdx + 1} / {selectedWords.length}
            </span>
          )}
        </div>
        {/* --- STAGE: PLAYING BOARD --- */}
        {gameState === 'playing' && currentPuzzle && (
          <>
            {/* Visual word clue header entirely in Arabic */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '0.25rem',
              width: '100%'
            }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '0.1rem', animation: 'bounce 2.2s infinite' }}>
                {currentPuzzle.emoji}
              </div>
              <h4 style={{
                fontSize: '1.5rem',
                fontWeight: 950,
                color: '#ca8a04',
                margin: '0 0 0.25rem 0',
                fontFamily: 'var(--font-arabic-alt), var(--font-qpc), serif'
              }}>
                Spell the word: <span style={{ color: 'var(--foreground)', textDecoration: 'underline' }}>{currentPuzzle.word}</span>
              </h4>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--foreground-secondary)',
                margin: '0 0 0.5rem 0'
              }}>
                Spelling: {currentPuzzle.translation}
              </p>

              {/* RTL Isolated Letter Formula Prompt */}
              <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                justifyContent: 'center',
                direction: 'rtl',
                background: 'rgba(255, 255, 255, 0.45)',
                padding: '4px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.03)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                {currentPuzzle.letters.map((letObj, idx) => (
                  <span key={idx} style={{
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-arabic-alt), var(--font-qpc), serif',
                    fontWeight: 800,
                    color: '#1f2937'
                  }}>
                    {letObj.isolated}
                    {idx < currentPuzzle.letters.length - 1 ? ' + ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Letter construction slots aligned right-to-left */}
            <div className={`${styles.slotsContainer} ${shakeActive ? 'shake-element' : ''}`}>
              {currentPuzzle.letters.map((_, idx) => {
                const isCurrent = idx === currentSlotIdx;
                const charVal = filledLetters[idx];

                return (
                  <div
                    key={idx}
                    className={`${styles.letterSlot} ${isCurrent ? styles.activeSlot : ''} ${charVal ? styles.filledSlot : ''}`}
                  >
                    {charVal}
                  </div>
                );
              })}
            </div>

            {/* Option shape cards pool selector */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--foreground-secondary)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Select the correct connection shape:
              </div>
              
              <div className={styles.cardPool}>
                {options.map((card) => {
                  const isUsed = clickedCardIds.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`${styles.shapeCard} ${isUsed ? styles.disabledCard : ''}`}
                    >
                      {card.char}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* --- STAGE: FUSED FUSION EFFECT --- */}
        {gameState === 'fused' && currentPuzzle && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>✨ {currentPuzzle.emoji} ✨</div>
            <p style={{
              fontSize: '1.25rem',
              fontWeight: 850,
              color: '#10b981',
              fontFamily: 'var(--font-arabic-alt), var(--font-qpc), serif',
              margin: 0
            }}>
              Great job! You connected the letters successfully:
            </p>

            <div className={styles.fusedWordContainer}>
              <span className={styles.fusedWord}>
                {currentPuzzle.word}
              </span>
            </div>

            <p style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--foreground)',
              maxWidth: '380px',
              marginBottom: '2rem'
            }}>
              You connected the word **{currentPuzzle.translation}**!
            </p>

            <button onClick={handleNextWord} className={styles.restartGameBtn} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', width: '220px' }}>
              {currentWordIdx === selectedWords.length - 1 ? '🎉 Finish' : 'Next Word ➡️'}
            </button>
          </div>
        )}

        {/* --- STAGE: INTRO DIFFICULTY SELECTION --- */}
        {gameState === 'intro' && (
          <div className={styles.gameOverlay}>
            <div className={styles.summaryCard} style={{ borderColor: '#ca8a04', maxWidth: '440px' }}>
              <div className={styles.summaryEmoji}>🛠️</div>
              <h3 className={styles.summaryTitle} style={{ color: '#b8860b' }}>Word Builder</h3>
              <p className={styles.summaryText}>
                Connect isolated Arabic letters to spell complete words! Select a difficulty level to begin:
              </p>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1rem',
                width: '100%'
              }}>
                {/* Easy Button */}
                <button
                  onClick={() => initGame('easy')}
                  className={styles.restartGameBtn}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>🟢 Easy (3 Letters)</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>+50 XP</span>
                </button>

                {/* Medium Button */}
                <button
                  onClick={() => initGame('medium')}
                  className={styles.restartGameBtn}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>🔵 Medium (4 Letters)</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>+70 XP</span>
                </button>

                {/* Hard Button */}
                <button
                  onClick={() => initGame('hard')}
                  className={styles.restartGameBtn}
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>🔴 Hard (5+ Letters)</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>+90 XP</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STAGE: GAMEOVER OVERLAY --- */}
        {gameState === 'gameover' && (
          <div className={styles.gameOverlay}>
            <div className={styles.summaryCard} style={{ borderColor: '#10b981' }}>
              <div className={styles.summaryEmoji}>👑</div>
              <h3 className={styles.summaryTitle}>Word Master!</h3>
              <p className={styles.summaryText}>
                You completed the spelling challenge! Excellent Arabic word construction:
              </p>

              <div className={styles.summaryStatsBox}>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal}>{getDifficultyLabel()}</span>
                  <span className={styles.summaryStatLbl}>Difficulty</span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal}>{mistakes}</span>
                  <span className={styles.summaryStatLbl}>Mistakes</span>
                </div>
                <div className={styles.summaryStatItem}>
                  <span className={styles.summaryStatVal} style={{ color: '#ca8a04' }}>+{getDifficultyXpValue()}</span>
                  <span className={styles.summaryStatLbl}>XP Won</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => { setGameState('intro'); }} 
                  className={styles.restartGameBtn} 
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                >
                  🔄 Play Another Level
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

      {/* Internal CSS Shake keyframe fallback */}
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
