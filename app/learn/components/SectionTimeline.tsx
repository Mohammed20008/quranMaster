'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionData, LessonData, UserProgress } from '../types';

interface SectionTimelineProps {
  selectedSection: SectionData;
  styles: any;
  userProgress: UserProgress;
  getLevelStatus: (sectionId: string, levelId: 'explorer' | 'adventure' | 'master') => 'locked' | 'active' | 'passed';
  onBack: () => void;
  onStartLesson: (lesson: LessonData, levelKey: 'explorer' | 'adventure' | 'master') => void;
  onStartQuiz: (lesson: LessonData, levelKey: 'explorer' | 'adventure' | 'master') => void;
  onStartUnlockQuiz: (fromLevelKey: 'explorer' | 'adventure', targetLevelKey: 'adventure' | 'master') => void;
}

const arabicLevels = {
  explorer: 'المستكشف',
  adventure: 'المغامر',
  master: 'المتقن'
};

const getLessonIcon = (lesson: LessonData) => {
  if (lesson.isAlphabet && lesson.alphabetData && lesson.alphabetData.letters.length > 0) {
    return (
      <span 
        style={{ 
          fontFamily: 'var(--font-qpc), var(--font-uthmanic), sans-serif', 
          fontSize: '2.5rem', 
          color: '#c69320', 
          fontWeight: 'bold',
          lineHeight: 1
        }}
      >
        {lesson.alphabetData.letters[0]}
      </span>
    );
  }
  
  // Custom Emojis for general lessons
  const titleLower = lesson.title.toLowerCase();
  if (titleLower.includes('shaddah')) return <span style={{ fontSize: '2.2rem', color: '#c69320', fontWeight: 'bold' }}>ّ</span>;
  if (titleLower.includes('tanween')) return <span style={{ fontSize: '2rem', color: '#c69320', fontWeight: 'bold' }}>◌ٌ</span>;
  if (titleLower.includes('purification') || titleLower.includes('water') || titleLower.includes('taharah')) return '💧';
  if (titleLower.includes('wudu')) return '🧼';
  if (titleLower.includes('salah') || titleLower.includes('prayer')) return '🕌';
  if (titleLower.includes('fasting') || titleLower.includes('ramadan') || titleLower.includes('sawm')) return '🌙';
  if (titleLower.includes('iman') || titleLower.includes('faith')) return '🌟';
  if (titleLower.includes('tawhid')) return '☝️';
  if (titleLower.includes('shirk')) return '🚫';
  if (titleLower.includes('adam')) return '🌱';
  if (titleLower.includes('musa') || titleLower.includes('sea')) return '🦯';
  if (titleLower.includes('yusuf')) return '👑';
  if (titleLower.includes('birth') || titleLower.includes('early')) return '👶';
  if (titleLower.includes('hijrah') || titleLower.includes('migration')) return '🗺️';
  if (titleLower.includes('conquest') || titleLower.includes('makkah')) return '🕋';
  
  return '📖'; // Fallback
};

export default function SectionTimeline({
  selectedSection,
  styles,
  userProgress,
  getLevelStatus,
  onBack,
  onStartLesson,
  onStartQuiz,
  onStartUnlockQuiz
}: SectionTimelineProps) {
  // Modal popover state for the selected lesson card
  const [activeLessonOptions, setActiveLessonOptions] = useState<{
    lesson: LessonData & { sequenceNum: number; isCompleted: boolean };
    levelKey: 'explorer' | 'adventure' | 'master';
  } | null>(null);

  // Parallax Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const totalHeight = doc.scrollHeight - doc.clientHeight;
      if (totalHeight <= 0) return;
      const percent = window.scrollY / totalHeight;
      document.documentElement.style.setProperty('--scroll-percent', `${percent}`);
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial compute
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute sequential lesson numbers and group levels data
  const allTiers = ['explorer', 'adventure', 'master'] as const;
  let lessonCounter = 0;

  const levelsData = allTiers.map((lvlKey) => {
    const level = selectedSection.levels[lvlKey];
    const status = getLevelStatus(selectedSection.id, lvlKey);
    const isLocked = status === 'locked';
    const isPassed = status === 'passed';
    
    const lessonsWithNumbers = level.lessons.map((lesson) => {
      lessonCounter++;
      return {
        ...lesson,
        sequenceNum: lessonCounter,
        isLocked,
        isCompleted: (userProgress?.completedLessons || []).includes(lesson.id)
      };
    });

    return {
      lvlKey,
      level,
      status,
      isLocked,
      isPassed,
      lessons: lessonsWithNumbers
    };
  });

  const handleCheckpointClick = (lvlKey: 'explorer' | 'adventure', isLocked: boolean) => {
    if (isLocked) {
      alert("🔒 Lock: Please complete all lessons in this level first to unlock the Checkpoint Review!");
    } else {
      const targetLvl = lvlKey === 'explorer' ? 'adventure' : 'master';
      onStartUnlockQuiz(lvlKey, targetLvl);
    }
  };

  return (
    <motion.div
      id="timeline-parallax-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className={styles.timelineView}
    >
      {/* Top Header Row */}
      <div className={styles.detailHeader}>
        <div className={styles.detailTitleText}>
          <h2 className={styles.detailTitle}>
            <span className={styles.detailIcon}>{selectedSection.icon}</span> 
            {selectedSection.title} ({selectedSection.arabicTitle})
          </h2>
          <p className={styles.detailSubtitle}>Follow the continuous grid path below. Complete lessons and pass checkpoint reviews to progress!</p>
        </div>
        
        <button onClick={onBack} className={styles.backBtn}>
          ← Back to Curriculum
        </button>
      </div>

      {/* Gamified Stacked Timeline Path */}
      <div className={styles.timelineRoadmap}>
        {levelsData.map(({ lvlKey, level, status, isLocked, isPassed, lessons }) => {
          return (
            <div key={lvlKey} className={styles.timelineLevelSection}>
              {/* Kid-friendly Level Header */}
              <div className={`${styles.levelHeader} ${styles[`levelHeader_${lvlKey}`]}`}>
                <div className={styles.levelHeaderInfo}>
                  <span className={styles.levelBadge}>
                    Level {lvlKey === 'explorer' ? '1' : lvlKey === 'adventure' ? '2' : '3'}
                  </span>
                  <h3>{level.title} Tier ({arabicLevels[lvlKey]})</h3>
                </div>
                <div className={styles.levelHeaderStatus}>
                  {isLocked ? (
                    <span className={styles.statusLabelLocked}>🔒 Locked</span>
                  ) : isPassed ? (
                    <span className={styles.statusLabelPassed}>✅ Completed</span>
                  ) : (
                    <span className={styles.statusLabelActive}>🎯 In Progress</span>
                  )}
                </div>
              </div>

              {/* Grid of Lesson Cards */}
              <div className={styles.lessonsGrid}>
                {lessons.map((lesson) => {
                  return (
                    <div 
                      key={lesson.id} 
                      className={`${styles.lessonCard} ${lesson.isLocked ? styles.lessonCardLocked : ''} ${lesson.isCompleted ? styles.lessonCardCompleted : ''}`}
                      onClick={() => {
                        if (lesson.isLocked) {
                          alert("🔒 This lesson is locked! Complete the previous levels first.");
                        } else {
                          setActiveLessonOptions({ lesson, levelKey: lvlKey });
                        }
                      }}
                    >
                      {/* Top Row: Num & Star */}
                      <span className={styles.cardNum}>{lesson.sequenceNum}</span>
                      {lesson.isLocked ? (
                        <span className={styles.cardStatus}>🔒</span>
                      ) : lesson.isCompleted ? (
                        <span className={styles.cardStatus} style={{ color: '#eab308' }}>⭐</span>
                      ) : (
                        <span className={styles.cardStatus} style={{ color: '#c69320', opacity: 0.5 }}>☆</span>
                      )}

                      {/* Letter / Emoji Center */}
                      <div className={styles.cardIcon}>
                        {getLessonIcon(lesson)}
                      </div>

                      {/* Small Label bottom */}
                      <span className={styles.cardTitle}>{lesson.title}</span>
                    </div>
                  );
                })}

                {/* Level Checkpoint Card (Review Quiz) for Explorer and Adventure */}
                {lvlKey !== 'master' && (
                  (() => {
                    const completedCount = lessons.filter(l => l.isCompleted).length;
                    const totalCount = lessons.length;
                    const allLessonsDone = totalCount > 0 && completedCount === totalCount;
                    const nextLevelStatus = getLevelStatus(selectedSection.id, lvlKey === 'explorer' ? 'adventure' : 'master');
                    const checkpointPassed = nextLevelStatus !== 'locked';

                    return (
                      <div 
                        className={`${styles.lessonCard} ${styles.checkpointCard} ${checkpointPassed ? styles.checkpointCardCompleted : ''} ${!allLessonsDone ? styles.lessonCardLocked : ''}`}
                        onClick={() => handleCheckpointClick(lvlKey, !allLessonsDone)}
                        title="Checkpoint Review Quiz"
                      >
                        <span className={styles.cardNum}>CP</span>
                        {checkpointPassed ? (
                          <span className={styles.cardStatus}>🏆</span>
                        ) : (
                          <span className={styles.cardStatus}>🔑</span>
                        )}

                        <div className={styles.cardIcon}>
                          <span style={{ fontSize: '2.5rem' }}>{checkpointPassed ? '🏆' : '🔑'}</span>
                        </div>

                        <span className={styles.cardTitle}>Review Checkpoint</span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity selector modal popup */}
      <AnimatePresence>
        {activeLessonOptions && (
          <div 
            className={styles.modalOverlay} 
            onClick={() => setActiveLessonOptions(null)}
          >
            <motion.div 
              className={styles.kidModal} 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className={styles.kidModalHeader}>
                <div className={styles.kidModalEmoji}>
                  {getLessonIcon(activeLessonOptions.lesson)}
                </div>
                <h2>Lesson {activeLessonOptions.lesson.sequenceNum}</h2>
                <h3>{activeLessonOptions.lesson.title}</h3>
              </div>
              <p className={styles.kidModalDesc}>
                {activeLessonOptions.lesson.description || "Learn this lesson by reading the interactive slides and testing your knowledge in a quick quiz!"}
              </p>
              
              <div className={styles.kidModalButtons}>
                <button 
                  className={styles.kidModalStudyBtn}
                  onClick={() => {
                    onStartLesson(activeLessonOptions.lesson, activeLessonOptions.levelKey);
                    setActiveLessonOptions(null);
                  }}
                >
                  Study Slides 📖
                </button>
                <button 
                  className={activeLessonOptions.lesson.isCompleted ? styles.kidModalQuizDoneBtn : styles.kidModalQuizBtn}
                  onClick={() => {
                    onStartQuiz(activeLessonOptions.lesson, activeLessonOptions.levelKey);
                    setActiveLessonOptions(null);
                  }}
                >
                  {activeLessonOptions.lesson.isCompleted ? 'Play Quiz Again 🎯' : 'Play Quiz 🎯'}
                </button>
              </div>
              
              <button 
                className={styles.kidModalClose} 
                onClick={() => setActiveLessonOptions(null)}
              >
                ✕ Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
