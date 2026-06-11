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
  const [activeLvlKey, setActiveLvlKey] = useState<'explorer' | 'adventure' | 'master'>('explorer');

  // Automatically focus on the highest unlocked level tier upon loading a section
  useEffect(() => {
    const masterStatus = getLevelStatus(selectedSection.id, 'master');
    const adventureStatus = getLevelStatus(selectedSection.id, 'adventure');
    
    if (masterStatus !== 'locked') {
      setActiveLvlKey('master');
    } else if (adventureStatus !== 'locked') {
      setActiveLvlKey('adventure');
    } else {
      setActiveLvlKey('explorer');
    }
  }, [selectedSection.id]);

  const activeLevel = selectedSection.levels[activeLvlKey];
  const activeLevelStatus = getLevelStatus(selectedSection.id, activeLvlKey);
  const activeLevelXp = activeLevel?.lessons.reduce((acc, curr) => acc + curr.points, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className={styles.timelineView}
    >
      {/* Top Section Header */}
      <div className={styles.detailHeader}>
        <div className={styles.detailTitleText}>
          <h2>
            <span>{selectedSection.icon}</span> 
            {selectedSection.title} ({selectedSection.arabicTitle})
          </h2>
          <p>Choose a level from the left primary menu to view and study its lessons on the right.</p>
        </div>
        
        <button onClick={onBack} className={styles.backBtn}>
          ← Back to Curriculum
        </button>
      </div>

      {/* Two Column Layout: Left Column = Levels Menu, Right Column = Lessons Stack */}
      <div className={styles.twoColPathway}>
        
        {/* Left Column: Premium Gold-Themed Levels Primary Menu */}
        <div className={styles.primaryMenuColumn}>
          {(['explorer', 'adventure', 'master'] as const).map((lvlKey) => {
            const level = selectedSection.levels[lvlKey];
            const status = getLevelStatus(selectedSection.id, lvlKey);
            const isLocked = status === 'locked';
            const isPassed = status === 'passed';
            const isActive = activeLvlKey === lvlKey;

            let cardClass = styles.levelGoldCard;
            if (isActive) cardClass += ` ${styles.levelGoldCardActive}`;
            if (isLocked) cardClass += ` ${styles.levelGoldCardLocked}`;

            return (
              <div
                key={lvlKey}
                className={cardClass}
                onClick={() => {
                  if (!isLocked) {
                    setActiveLvlKey(lvlKey);
                  }
                }}
              >
                <div className={styles.levelGoldCardHeader}>
                  <div className={styles.levelGoldCardTitleRow}>
                    <h3>{lvlKey} tier</h3>
                    <span className={styles.levelGoldCardArabic}>
                      {arabicLevels[lvlKey]}
                    </span>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={styles.levelStatusIcon}>
                    {isLocked ? '🔒' : isPassed ? '✅' : '🎯'}
                  </span>
                </div>

                <p className={styles.levelGoldCardDesc}>
                  {level.title}
                </p>

                <div className={styles.levelGoldCardFooter}>
                  <span className={styles.levelGoldCardXp}>
                    ⭐ {level.lessons.reduce((acc, curr) => acc + curr.points, 0)} XP
                  </span>

                  {!isLocked && (
                    <button className={styles.levelGoldCardBtn}>
                      {isActive ? 'Active 👀' : 'Select ➡️'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Lessons Secondary Menu Area */}
        <div className={styles.secondaryMenuColumn}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLvlKey}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeLevelStatus === 'locked' ? (
                (() => {
                  const prevLvlKey = activeLvlKey === 'master' ? 'adventure' : 'explorer';
                  const prevLvlLessons = selectedSection.levels[prevLvlKey]?.lessons || [];
                  const completedList = userProgress?.completedLessons || [];
                  const completedPrevCount = prevLvlLessons.filter(l => completedList.includes(l.id)).length;
                  const totalPrevCount = prevLvlLessons.length;
                  const prevLvlCompleted = totalPrevCount > 0 && completedPrevCount === totalPrevCount;

                  if (prevLvlCompleted) {
                    return (
                      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(198, 147, 32, 0.03)', borderRadius: '2rem', border: '1px dashed var(--primary)' }}>
                        <span style={{ fontSize: '3rem' }}>🔑</span>
                        <h3 style={{ marginTop: '1rem', fontWeight: '900', fontSize: '1.5rem', color: 'var(--foreground)' }}>Unlock {activeLvlKey.charAt(0).toUpperCase() + activeLvlKey.slice(1)} Tier</h3>
                        <p style={{ fontSize: '1rem', maxWidth: '400px', margin: '0.75rem auto 1.5rem', color: 'var(--foreground-secondary)', lineHeight: '1.6' }}>
                          Excellent job! You have completed all lessons in the <strong>{prevLvlKey}</strong> tier. 
                          To unlock the next level, you must pass a comprehensive review quiz covering those lessons.
                        </p>
                        <button 
                          onClick={() => onStartUnlockQuiz(prevLvlKey, activeLvlKey as any)}
                          className={styles.learnBtn}
                          style={{ padding: '1rem 2.5rem', fontSize: '1rem', borderRadius: '14px', width: 'auto', fontWeight: '800' }}
                        >
                          Start Tier Unlock Quiz 🎯
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--foreground-secondary)' }}>
                        <span style={{ fontSize: '3rem' }}>🔒</span>
                        <h3 style={{ marginTop: '1rem', fontWeight: '800', color: 'var(--foreground)' }}>{activeLvlKey.charAt(0).toUpperCase() + activeLvlKey.slice(1)} Level is Locked</h3>
                        <p style={{ fontSize: '0.95rem', maxWidth: '350px', margin: '0.75rem auto 0', lineHeight: '1.6' }}>
                          To unlock this tier, you must first complete all lessons in the <strong>{prevLvlKey}</strong> tier.
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--background-secondary)', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '800' }}>
                          Progress: {completedPrevCount} / {totalPrevCount} Lessons Completed
                        </div>
                      </div>
                    );
                  }
                })()
              ) : (
                <>
                  {/* Secondary Menu Header */}
                  <div className={styles.secondaryHeaderRow}>
                    <div className={styles.secondaryHeaderTitle}>
                      <h2>
                        <span>{activeLvlKey} Menu</span>
                        <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-arabic)' }}>
                          ({arabicLevels[activeLvlKey]})
                        </span>
                      </h2>
                      <p>{activeLevel.description}</p>
                    </div>

                    <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ⭐ {activeLevelXp} XP Available
                    </div>
                  </div>

                  {/* Secondary Menu Lessons list */}
                  {activeLevel.lessons.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-secondary)' }}>
                      No lessons available inside this level tier yet.
                    </p>
                  ) : (
                    <div className={styles.secondaryLessonsGrid}>
                      {activeLevel.lessons.map((lesson) => {
                        const isCompleted = (userProgress?.completedLessons || []).includes(lesson.id);
                        return (
                          <div 
                            key={lesson.id} 
                            className={styles.lessonRow}
                          >
                            <div className={styles.lessonHeader}>
                              <span className={styles.lessonTitle}>
                                {lesson.title}
                              </span>
                              {isCompleted && (
                                <span className={styles.lessonCompletedBadge}>
                                  Done
                                </span>
                              )}
                            </div>
                            
                            {lesson.description && (
                              <p className={styles.lessonDesc}>
                                {lesson.description}
                              </p>
                            )}

                            <div className={styles.lessonBtnRow}>
                              <button
                                onClick={() => onStartLesson(lesson, activeLvlKey)}
                                className={styles.learnBtn}
                                style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
                              >
                                Study Slide 📖
                              </button>
                              <button
                                onClick={() => onStartQuiz(lesson, activeLvlKey)}
                                className={isCompleted ? styles.quizBtnPassed : styles.quizBtn}
                                style={{ flex: 1, padding: '0.65rem', fontSize: '0.85rem' }}
                              >
                                {isCompleted ? 'Quiz Done ✓' : 'Take Quiz 🎯'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
