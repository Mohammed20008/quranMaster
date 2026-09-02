'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LessonData, VowelAppliedData } from '../types';

const VOCAB_IMAGES: Record<string, string> = {
  // Alif
  'Rabbit': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&q=80',
  'Lion': 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400&q=80',
  'Water Jug': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=400&q=80',
  'Ear': 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=400&q=80',
  // Ba
  'House': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80',
  'Cow': 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=80',
  'Girl': 'https://images.unsplash.com/photo-1517677129300-07b130802f46?w=400&q=80',
  'Owl': 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&q=80',
  // Ta
  'Crown': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
  'Date fruit': 'https://images.unsplash.com/photo-1596517178044-eb34d3809fb0?w=400&q=80',
  'Crocodile': 'https://images.unsplash.com/photo-1606856093724-4b57497d3910?w=400&q=80',
  'Apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
  // Tha
  'Fox': 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&q=80',
  'Garment': 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80',
  'Fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
  'Snake': 'https://images.unsplash.com/photo-1531386151447-fd762e7a3ae8?w=400&q=80',
  // Jeem
  'Camel': 'https://images.unsplash.com/photo-1532684982787-dfb9a4c844b1?w=400&q=80',
  'Bell': 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=400&q=80',
  'Wall': 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=80',
  'Cheese': 'https://images.unsplash.com/photo-1486887396153-fa416525c108?w=400&q=80',
  // Hha
  'Sweets': 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&q=80',
  'Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
  'Donkey': 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?w=400&q=80',
  'Whale / Fish': 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&q=80',
  // Kha
  'Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'Sheep': 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=400&q=80',
  'Closet': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80',
  'Elephant Trunk': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&q=80',
  // Dal
  'Steps / Ladder': 'https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=400&q=80',
  'Notebook': 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80',
  'Rooster': 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80',
  'Bear': 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&q=80',
  // Dhal
  'Gold': 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&q=80',
  'Wolf': 'https://images.unsplash.com/photo-1590420485404-f86d22b8abf8?w=400&q=80',
  'Corn': 'https://images.unsplash.com/photo-1551754625-70c90487530d?w=400&q=80',
  // Ra
  'Pomegranate': 'https://images.unsplash.com/photo-1530176611610-e593a20d43a6?w=400&q=80',
  'Man': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'Feather': 'https://images.unsplash.com/photo-1505232771569-80b6f98ef818?w=400&q=80',
  // Zay
  'Flower': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&q=80',
  'Giraffe': 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400&q=80',
  'Button': 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&q=80',
  'Glass': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
  // Seen
  'Fish': 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&q=80',
  'Car': 'https://images.unsplash.com/photo-1494976388531-d110a4a8622b?w=400&q=80',
  'Knife': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&q=80',
  'Ships': 'https://images.unsplash.com/photo-1507682531662-421b17ac4f83?w=400&q=80',
  // Sheen
  'Sun': 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=400&q=80',
  'Tree': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80',
  'Meteor': 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&q=80',
  'Soup': 'https://images.unsplash.com/photo-1547592165-e1d17fed6006?w=400&q=80',
  // Sad
  'Falcon': 'https://images.unsplash.com/photo-1603507340038-f9b8c0053a47?w=400&q=80',
  'Plate': 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&q=80',
  'Tray': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
  'Box': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80',
  // Dad
  'Hyena': 'https://images.unsplash.com/photo-1591821037595-c5541c415566?w=400&q=80',
  'Light': 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=400&q=80',
  'Teeth': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&q=80',
  // Ta (thick)
  'Airplane': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
  'Doctor': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
  'Baby / Child': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80',
  'Birds': 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80',
  // Dha
  'Envelope': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
  'Back': 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
  'Shadow / Umbrella': 'https://images.unsplash.com/photo-1522441815192-d9f240683b66?w=400&q=80',
  'Nail': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
  // Ayn
  'Eye': 'https://images.unsplash.com/photo-1544485340-7e97478d34b8?w=400&q=80',
  'Honey': 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=400&q=80',
  'Grapes': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80',
  'Nest': 'https://images.unsplash.com/photo-1539281729352-be525164d939?w=400&q=80',
  // Ghayn
  'Forest': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  'Deer': 'https://images.unsplash.com/photo-1484406566174-9da000fd267d?w=400&q=80',
  'Sieve': 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&q=80',
  'Crow': 'https://images.unsplash.com/photo-1522850400380-639c10d2ca18?w=400&q=80',
  // Fa
  'Elephant': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400&q=80',
  'Butterfly': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80',
  'Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
  // Qaf
  'Moon': 'https://images.unsplash.com/photo-1522030287044-d667c26c90e1?w=400&q=80',
  'Pen': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80',
  'Cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
  'Dome': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&q=80',
  // Kaf
  'Book': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
  'Dog': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
  'Ball': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&q=80',
  // Lam
  'Lemon': 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80',
  'Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
  'Tongue': 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=400&q=80',
  'Pearl': 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=400&q=80',
  // Mim
  'Mosque': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=400&q=80',
  'Rain': 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=80',
  'Key': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&q=80',
  'Apricot': 'https://images.unsplash.com/photo-1501746877-14780dfc303f?w=400&q=80',
  // Noon
  'Star': 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400&q=80',
  'Bee': 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=400&q=80',
  'Eagle': 'https://images.unsplash.com/photo-1534823983341-d4e6e4aa046c?w=400&q=80',
  'Stars': 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&q=80',
  // Ha
  'Crescent Moon': 'https://images.unsplash.com/photo-1505342981915-1143ccd7f6e0?w=400&q=80',
  'Phone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  'Hoopoe Bird': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
  // Waw
  'Rose': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
  'Boy': 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80',
  'Medal': 'https://images.unsplash.com/photo-1578269174936-2709b5a8e0f9?w=400&q=80',
  'Ablution': 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=400&q=80',
  // Ya
  'Hand': 'https://images.unsplash.com/photo-1516733729877-a53683bf9c02?w=400&q=80',
  'Dove': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80',
  'Yen': 'https://images.unsplash.com/photo-1502920514313-52581002a659?w=400&q=80',
  'Tangerine': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=400&q=80'
};

interface LessonModalProps {
  activeLesson: LessonData | null;
  currentSlideIndex: number;
  setCurrentSlideIndex: (idx: number) => void;
  currentAlphabetStep: 'shapes' | 'vowels';
  setCurrentAlphabetStep: (step: 'shapes' | 'vowels') => void;
  selectedAlphabetLetter: string;
  setSelectedAlphabetLetter: (letter: string) => void;
  selectedVowelIndex: number;
  setSelectedVowelIndex: (idx: number) => void;
  activeVowelLetterApplied: string;
  setActiveVowelLetterApplied: (val: string) => void;
  styles: any;
  onClose: () => void;
  onStartQuiz: (lesson: LessonData) => void;
}

export default function LessonModal({
  activeLesson,
  currentSlideIndex,
  setCurrentSlideIndex,
  currentAlphabetStep,
  setCurrentAlphabetStep,
  selectedAlphabetLetter,
  setSelectedAlphabetLetter,
  selectedVowelIndex,
  setSelectedVowelIndex,
  activeVowelLetterApplied,
  setActiveVowelLetterApplied,
  styles,
  onClose,
  onStartQuiz
}: LessonModalProps) {
  const [selectedShapeType, setSelectedShapeType] = useState<'isolated' | 'initial' | 'medial' | 'final'>('isolated');

  if (!activeLesson) return null;

  // Calculate dynamic real-time progress percentages
  let progressPercent = 0;
  if (activeLesson.isAlphabet && activeLesson.alphabetData) {
    const letters = activeLesson.alphabetData.letters;
    const letterIdx = letters.indexOf(selectedAlphabetLetter);
    if (currentAlphabetStep === 'shapes') {
      progressPercent = Math.max(5, Math.round(((letterIdx + 1) / (letters.length * 2)) * 100));
    } else {
      progressPercent = 50 + Math.max(5, Math.round(((selectedVowelIndex + 1) / 3) * 50));
    }
  } else if (activeLesson.slides && activeLesson.slides.length > 0) {
    progressPercent = Math.round(((currentSlideIndex + 1) / activeLesson.slides.length) * 100);
  }

  return (
    <motion.div 
      className={styles.lessonOverlay}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: 'spring', damping: 26, stiffness: 190 }}
    >
      {/* Immersive Top Navigation Header */}
      <div className={styles.lessonHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button onClick={onClose} className={styles.exitLessonBtn} title="Exit Lesson">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.08em' }}>
              {activeLesson.isAlphabet ? 'Alphabet Practice' : 'Interactive Lecture'}
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: 850, color: 'var(--foreground)' }}>
              {activeLesson.title}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className={styles.lessonProgressContainer}>
          <div className={styles.lessonProgressBar}>
            <div 
              className={styles.lessonProgressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--foreground-secondary)', minWidth: '45px', textAlign: 'right' }}>
            {progressPercent}%
          </span>
        </div>

        {/* Lesson Points Reward Badge */}
        <div className={styles.lessonMetaBadges}>
          <div className={styles.xpBadge}>
            <span>⭐</span>
            <span>{activeLesson.points} XP</span>
          </div>
        </div>
      </div>

      {/* Main Expansive Content Body Container */}
      <div className={styles.lessonContainer}>
        {/* TWO-PART INTERACTIVE ALPHABET LESSON */}
        {activeLesson.isAlphabet && activeLesson.alphabetData ? (
          <>
            {/* Step Switcher Navigation */}
            <div className={styles.partsStepper} style={{ margin: '0 auto 2.5rem', width: '100%', maxWidth: '800px', background: 'var(--background-secondary)', padding: '0.75rem 1.5rem', borderRadius: '100px', border: '1px solid var(--border)' }}>
              <div 
                className={`${styles.stepItem} ${currentAlphabetStep === 'shapes' ? styles.stepItemActive : styles.stepItemDone}`}
                onClick={() => setCurrentAlphabetStep('shapes')}
                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              >
                <span>Step 1: Connection Shapes</span>
              </div>
              <span className={styles.stepArrow}>➡️</span>
              <div 
                className={`${styles.stepItem} ${currentAlphabetStep === 'vowels' ? styles.stepItemActive : ''}`}
                onClick={() => setCurrentAlphabetStep('vowels')}
                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              >
                <span>Step 2: Vowels & Examples</span>
              </div>
            </div>

            {/* STEP 1: CONNECTION SHAPES PRACTICE */}
            {currentAlphabetStep === 'shapes' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '1.25rem', color: 'var(--foreground-secondary)' }}>
                  Select an Arabic letter to explore its shapes and connection rules:
                </h3>

                {/* Premium Alphabet Card Grid */}
                <div className={styles.premiumLetterGrid}>
                  {activeLesson.alphabetData.letters.map((letter) => (
                    <button
                      key={letter}
                      onClick={() => {
                        setSelectedAlphabetLetter(letter);
                        setSelectedShapeType('isolated');
                        const details = activeLesson.alphabetData?.letterDetails[letter];
                        if (details?.vowels.length) {
                          setSelectedVowelIndex(0);
                          setActiveVowelLetterApplied(details.vowels[0].letterApplied);
                        }
                      }}
                      className={`${styles.glassLetterCard} ${selectedAlphabetLetter === letter ? styles.glassLetterCardActive : ''}`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>

                {/* Connection Details Split-screen */}
                {selectedAlphabetLetter && activeLesson.alphabetData.letterDetails[selectedAlphabetLetter] && (
                  <div className={styles.twoColumnLayout}>
                    {/* Left Column: Shape selection cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className={styles.letterDisplayCard} style={{ background: 'var(--background-secondary)', border: '1.5px solid var(--border)', borderRadius: '24px', padding: '2.5rem 1.5rem', boxShadow: 'none' }}>
                        <div className={styles.displayLetter} style={{ fontSize: '5.5rem', color: 'var(--primary)', lineHeight: 1 }}>{selectedAlphabetLetter}</div>
                        <div className={styles.displayName} style={{ fontSize: '1.25rem', fontWeight: 850, marginTop: '0.75rem', color: 'var(--foreground)' }}>
                          Letter: {activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].name}
                        </div>
                      </div>

                      <div className={styles.shapesGrid}>
                        <div 
                          className={`${styles.shapeCard} ${styles.isolated} ${selectedShapeType === 'isolated' ? styles.shapeCardActive : ''}`}
                          onClick={() => setSelectedShapeType('isolated')}
                          style={{ borderRadius: '20px', padding: '1.5rem' }}
                        >
                          <div className={styles.shapeLabel} style={{ fontWeight: 800 }}>Isolated</div>
                          <div className={styles.shapeLetter} style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                            {activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes.isolated}
                          </div>
                          <div className={styles.shapeExample} style={{ fontWeight: 700 }}>Independent form</div>
                        </div>

                        {!activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes.isNonConnecting && (
                          <>
                            <div 
                              className={`${styles.shapeCard} ${styles.initial} ${selectedShapeType === 'initial' ? styles.shapeCardActive : ''}`}
                              onClick={() => setSelectedShapeType('initial')}
                              style={{ borderRadius: '20px', padding: '1.5rem' }}
                            >
                              <div className={styles.shapeLabel} style={{ fontWeight: 800 }}>Initial (Start)</div>
                              <div className={styles.shapeLetter} style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                                {activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes.initial}
                              </div>
                              <div className={styles.shapeExample} style={{ fontWeight: 700 }}>joins next ➡️</div>
                            </div>

                            <div 
                              className={`${styles.shapeCard} ${styles.medial} ${selectedShapeType === 'medial' ? styles.shapeCardActive : ''}`}
                              onClick={() => setSelectedShapeType('medial')}
                              style={{ borderRadius: '20px', padding: '1.5rem' }}
                            >
                              <div className={styles.shapeLabel} style={{ fontWeight: 800 }}>Medial (Middle)</div>
                              <div className={styles.shapeLetter} style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                                {activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes.medial}
                              </div>
                              <div className={styles.shapeExample} style={{ fontWeight: 700 }}>⬅️ joins both ➡️</div>
                            </div>
                          </>
                        )}

                        <div 
                          className={`${styles.shapeCard} ${styles.final} ${selectedShapeType === 'final' ? styles.shapeCardActive : ''}`}
                          onClick={() => setSelectedShapeType('final')}
                          style={{ borderRadius: '20px', padding: '1.5rem' }}
                        >
                          <div className={styles.shapeLabel} style={{ fontWeight: 800 }}>Final (End)</div>
                          <div className={styles.shapeLetter} style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
                            {activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes.final}
                          </div>
                          <div className={styles.shapeExample} style={{ fontWeight: 700 }}>⬅️ joins previous</div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Shape illustrations & Usage rules */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {(() => {
                        const shapes = activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes;
                        let activeWord = shapes.exampleWord;
                        let activeTrans = shapes.exampleTranslation;
                        let activeArab = shapes.exampleArabic;
                        let activeEmo = shapes.illustrationEmoji;

                        if (selectedShapeType === 'isolated') {
                          activeWord = shapes.isolatedWord || shapes.exampleWord;
                          activeTrans = shapes.isolatedTranslation || shapes.exampleTranslation;
                          activeArab = shapes.isolatedArabic || shapes.exampleArabic;
                          activeEmo = shapes.isolatedEmoji || shapes.illustrationEmoji;
                        } else if (selectedShapeType === 'initial') {
                          activeWord = shapes.initialWord || shapes.exampleWord;
                          activeTrans = shapes.initialTranslation || shapes.exampleTranslation;
                          activeArab = shapes.initialArabic || shapes.exampleArabic;
                          activeEmo = shapes.initialEmoji || shapes.illustrationEmoji;
                        } else if (selectedShapeType === 'medial') {
                          activeWord = shapes.medialWord || shapes.exampleWord;
                          activeTrans = shapes.medialTranslation || shapes.exampleTranslation;
                          activeArab = shapes.medialArabic || shapes.exampleArabic;
                          activeEmo = shapes.medialEmoji || shapes.illustrationEmoji;
                        } else if (selectedShapeType === 'final') {
                          activeWord = shapes.finalWord || shapes.exampleWord;
                          activeTrans = shapes.finalTranslation || shapes.exampleTranslation;
                          activeArab = shapes.finalArabic || shapes.exampleArabic;
                          activeEmo = shapes.finalEmoji || shapes.illustrationEmoji;
                        }

                        let selectedShapeChar = shapes.isolated;
                        if (selectedShapeType === 'initial') selectedShapeChar = shapes.initial;
                        else if (selectedShapeType === 'medial') selectedShapeChar = shapes.medial;
                        else if (selectedShapeType === 'final') selectedShapeChar = shapes.final;

                        const vocabImage = VOCAB_IMAGES[activeTrans] || VOCAB_IMAGES[activeWord];

                        return (
                          <div className={styles.illustrationCard} style={{ padding: '2.5rem 2rem', background: 'var(--background-secondary)', border: '1.5px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                              {vocabImage ? (
                                <img 
                                  src={vocabImage} 
                                  alt={activeWord} 
                                  style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '24px',
                                    border: '2px solid var(--primary-light)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                  }}
                                />
                              ) : (
                                <div className={styles.illustrationEmoji} style={{ margin: 0, fontSize: '5rem' }}>
                                  {activeEmo}
                                </div>
                              )}
                              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'var(--font-arabic)', background: 'var(--background)', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid var(--primary-light)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }} title={`${selectedShapeType} shape character`}>
                                {selectedShapeChar}
                              </div>
                            </div>
                            
                            <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '0.75rem', textAlign: 'center' }}>
                              {selectedShapeType} shape example
                            </div>
                            
                            <div className={styles.illustrationArabic} style={{ fontSize: '3.5rem', marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                              {activeArab}
                            </div>
                            <div className={styles.illustrationEnglish} style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--foreground-secondary)', marginBottom: '1rem' }}>
                              Example: <span style={{ color: 'var(--foreground)' }}>{activeWord}</span> ({activeTrans})
                            </div>

                            <div className={styles.pronouncePrompt}>
                              🗣️ Say it out loud: <strong>{activeArab}</strong>!
                            </div>
                          </div>
                        );
                      })()}

                      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--foreground-secondary)', textAlign: 'center', background: 'var(--background-secondary)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)', margin: 0 }}>
                        ℹ️ <strong>Usage Rule:</strong> {activeLesson.alphabetData.letterDetails[selectedAlphabetLetter].shapes.letterExplanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom slide navigation */}
                <div className={styles.slideFooter} style={{ background: 'transparent', borderTop: '1px solid var(--border)', padding: '2rem 0 1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--foreground-secondary)', fontWeight: 650 }}>
                    💡 Review all letter connection shapes, then click Step 2.
                  </span>
                  <button 
                    onClick={() => setCurrentAlphabetStep('vowels')}
                    className={`${styles.navButton} ${styles.nextButton}`}
                    style={{ padding: '0.85rem 2.25rem', borderRadius: '16px' }}
                  >
                    Step 2: Vowels ➡️
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: VOWELS & HARAKAT SYSTEM */}
            {currentAlphabetStep === 'vowels' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 850, marginBottom: '1.25rem', color: 'var(--foreground-secondary)', textAlign: 'center' }}>
                  Select a vowel to view its marks, sound rules, and letter applications:
                </h3>

                {/* Beautiful Vowels Tab Selectors */}
                <div className={styles.vowelTabContainer}>
                  {['Fathah (◌َ)', 'Kasrah (◌ِ)', 'Dammah (◌ُ)'].map((vowelLabel, idx) => (
                    <div
                      key={vowelLabel}
                      onClick={() => {
                        setSelectedVowelIndex(idx);
                        const details = activeLesson.alphabetData?.letterDetails[selectedAlphabetLetter];
                        if (details?.vowels[idx]) {
                          setSelectedVowelIndex(idx);
                          setActiveVowelLetterApplied(details.vowels[idx].letterApplied);
                        }
                      }}
                      className={`${styles.vowelTabButton} ${selectedVowelIndex === idx ? styles.vowelTabButtonActive : ''}`}
                    >
                      <div className={styles.vowelTabMark}>
                        {idx === 0 ? '◌َ' : idx === 1 ? '◌ِ' : '◌ُ'}
                      </div>
                      <div className={styles.vowelTabTitle}>
                        {idx === 0 ? 'Fathah' : idx === 1 ? 'Kasrah' : 'Dammah'}
                      </div>
                      <div className={styles.vowelTabSound}>
                        Sound: {idx === 0 ? '"a"' : idx === 1 ? '"i"' : '"u"'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vowels applied forms split screen */}
                <div className={styles.twoColumnLayout}>
                  {/* Column 1: letter applied form rows in scrollable box */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--foreground-secondary)' }}>
                      Click any letter applied form to pronounce:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                      {activeLesson.alphabetData.letters.map((letter) => {
                        const detail = activeLesson.alphabetData?.letterDetails[letter];
                        const vowelData = detail?.vowels[selectedVowelIndex];

                        if (!vowelData) return null;
                        const isActive = activeVowelLetterApplied === vowelData.letterApplied;

                        return (
                          <div
                            key={letter}
                            onClick={() => setActiveVowelLetterApplied(vowelData.letterApplied)}
                            className={`${styles.vowelAppliedRow} ${isActive ? styles.vowelAppliedRowActive : ''}`}
                            style={{ margin: 0, padding: '1rem 1.5rem', borderRadius: '18px' }}
                          >
                            <div className={styles.vowelAppliedLetter} style={{ fontSize: '2.5rem', color: isActive ? 'var(--primary)' : 'var(--foreground)' }}>
                              {vowelData.letterApplied}
                            </div>
                            <div className={styles.vowelAppliedExample}>
                              <span className={styles.vowelAppliedExampleArabic} style={{ fontSize: '1.8rem', fontFamily: 'var(--font-arabic)', marginRight: '1rem' }}>
                                {vowelData.exampleArabic}
                              </span>
                              <span className={styles.vowelAppliedExampleEnglish} style={{ fontSize: '1rem', fontWeight: 750 }}>
                                {vowelData.exampleWord} ({vowelData.exampleTranslation})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Column 2: Details illustration card */}
                  <div>
                    {(() => {
                      let currentVowelData: VowelAppliedData | null = null;
                      activeLesson.alphabetData?.letters.forEach(letter => {
                        const detail = activeLesson.alphabetData?.letterDetails[letter];
                        const v = detail?.vowels[selectedVowelIndex];
                        if (v && v.letterApplied === activeVowelLetterApplied) {
                          currentVowelData = v;
                        }
                      });

                      if (!currentVowelData) {
                        const firstLetter = activeLesson.alphabetData?.letters[0] || '';
                        currentVowelData = activeLesson.alphabetData?.letterDetails[firstLetter]?.vowels[selectedVowelIndex] || null;
                      }

                      if (!currentVowelData) return null;

                      const vocabImage = VOCAB_IMAGES[currentVowelData.exampleTranslation] || VOCAB_IMAGES[currentVowelData.exampleWord];

                      return (
                        <div className={styles.illustrationCard} style={{ padding: '2.5rem 2rem', background: 'var(--background-secondary)', border: '1.5px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                            {vocabImage ? (
                              <img 
                                src={vocabImage} 
                                alt={currentVowelData.exampleWord} 
                                style={{
                                  width: '120px',
                                  height: '120px',
                                  objectFit: 'cover',
                                  borderRadius: '24px',
                                  border: '2px solid var(--primary-light)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                }}
                              />
                            ) : (
                              <div className={styles.illustrationEmoji} style={{ margin: 0, fontSize: '5rem' }}>
                                {currentVowelData.illustrationEmoji}
                              </div>
                            )}
                          </div>
                          <div className={styles.illustrationArabic} style={{ fontSize: '3.5rem', marginBottom: '0.75rem', color: 'var(--foreground)' }}>
                            {currentVowelData.exampleArabic}
                          </div>
                          <div className={styles.illustrationEnglish} style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--foreground-secondary)', marginBottom: '1rem' }}>
                            Example: <span style={{ color: 'var(--foreground)' }}>{currentVowelData.exampleWord}</span> ({currentVowelData.exampleTranslation})
                          </div>

                          <div className={styles.pronouncePrompt} style={{ marginBottom: '1.5rem' }}>
                            🗣️ Pronounce: <strong>{currentVowelData.letterApplied}</strong> makes the sound <strong>"{currentVowelData.sound}"</strong>!
                          </div>

                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)', background: 'rgba(198,147,32,0.08)', padding: '0.45rem 1rem', borderRadius: '50px', border: '1px solid rgba(198,147,32,0.15)' }}>
                            Vowel applied: {currentVowelData.letterApplied} (Pronounced: "{currentVowelData.sound}")
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Bottom slide navigation */}
                <div className={styles.slideFooter} style={{ background: 'transparent', borderTop: '1px solid var(--border)', padding: '2rem 0 1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    onClick={() => setCurrentAlphabetStep('shapes')}
                    className={`${styles.navButton} ${styles.prevButton}`}
                    style={{ padding: '0.85rem 1.75rem', borderRadius: '16px' }}
                  >
                    ⬅️ Back to Shapes
                  </button>
                  <button 
                    onClick={() => onStartQuiz(activeLesson)}
                    className={`${styles.navButton} ${styles.nextButton}`}
                    style={{ padding: '0.85rem 2.25rem', borderRadius: '16px' }}
                  >
                    Unlock certification Quiz 🎯
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* STANDARD STUDY SLIDE LECTURE SYSTEM (Fiqh, Aqidah, Qasas, Sirah) */
          activeLesson.slides && activeLesson.slides.length > 0 ? (
            (() => {
              const slides = activeLesson.slides;
              const slide = slides[currentSlideIndex];
              return (
                <div className={styles.slideMainContainer}>
                  <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--foreground)', marginBottom: '2rem', textAlign: 'center' }}>
                    {slide.title}
                  </h2>

                  {slide.arabic && (
                    <div className={styles.arabicHeroBox}>
                      <div className={styles.arabicHeroText}>
                        {slide.arabic}
                      </div>
                      {slide.transliteration && (
                        <div className={styles.translitText} style={{ fontSize: '1.25rem', marginTop: '0.75rem', fontWeight: 700, color: 'var(--foreground-secondary)' }}>
                          [ {slide.transliteration} ]
                        </div>
                      )}
                    </div>
                  )}

                  <p className={styles.textContent} style={{ fontSize: '1.25rem', lineHeight: '1.85', color: 'var(--foreground-secondary)', maxWidth: '720px', margin: '0 auto 3rem', textAlign: 'center' }}>
                    {slide.content}
                  </p>

                  <div className={styles.slideFooter} style={{ background: 'transparent', borderTop: '1px solid var(--border)', padding: '2rem 0 1rem', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <button 
                      onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                      disabled={currentSlideIndex === 0}
                      className={`${styles.navButton} ${styles.prevButton}`}
                      style={{ padding: '0.85rem 1.75rem', borderRadius: '16px' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      Previous
                    </button>

                    <div className={styles.dotsWrapper}>
                      {slides.map((_, i) => (
                        <span 
                          key={i} 
                          onClick={() => setCurrentSlideIndex(i)}
                          className={`${styles.dot} ${i === currentSlideIndex ? styles.dotActive : ''}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {currentSlideIndex < slides.length - 1 ? (
                      <button 
                        onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                        className={`${styles.navButton} ${styles.nextButton}`}
                        style={{ padding: '0.85rem 1.75rem', borderRadius: '16px' }}
                      >
                        Next
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ) : (
                      <button 
                        onClick={() => onStartQuiz(activeLesson)}
                        className={`${styles.navButton} ${styles.nextButton}`}
                        style={{ padding: '0.85rem 2rem', borderRadius: '16px' }}
                      >
                        Start Lesson Quiz 🎯
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : null
        )}
      </div>
    </motion.div>
  );
}

