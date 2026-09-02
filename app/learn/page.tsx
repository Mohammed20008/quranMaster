'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import canvasConfetti from 'canvas-confetti';

import styles from './learn.module.css';
import { SectionData, LessonData, UserProgress, QuizQuestion } from './types';
import { INITIAL_LEARNING_SECTIONS } from './data/curriculum';
import { useTeachers } from '@/app/context/teacher-context';
import GeometricPattern from '@/app/components/ui/geometric-pattern';

// Import newly externalized modular components
import UserProgressBanner from './components/UserProgressBanner';
import SectionTimeline from './components/SectionTimeline';
import LessonModal from './components/LessonModal';
import QuizModal from './components/QuizModal';
import TeacherMarketplace from './components/TeacherMarketplace';
import GamesArcade from './components/GamesArcade';

const BookingModal = dynamic(() => import('./booking-modal'), { 
  ssr: false,
  loading: () => null 
});

interface LearnPageProps {
  subject?: string;
}

export default function LearnPage({ subject }: LearnPageProps = {}) {
  const router = useRouter();
  // Navigation & View Toggles
  const [activeTab, setActiveTab] = useState<'path' | 'teachers' | 'games'>('path');
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const [selectedLevelKey, setSelectedLevelKey] = useState<'explorer' | 'adventure' | 'master' | null>(null);

  // User database state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 0,
    completedLessons: [],
    unlockedLevels: { arabic: ['explorer'] }
  });

  // Load Curriculum state (respecting custom LocalStorage modifications from architect)
  const [learningSections, setLearningSections] = useState<SectionData[]>(INITIAL_LEARNING_SECTIONS);

  // Resolve initial selected section based on subject parameter
  const initialSection = useMemo(() => {
    if (!subject) return null;
    const normalized = subject.toLowerCase();
    const targetId = normalized === 'aqida' ? 'aqidah' : normalized;
    return learningSections.find(s => s.id === targetId) || null;
  }, [subject, learningSections]);

  // Sync selectedSection state when the deep-link subject changes
  useEffect(() => {
    setSelectedSection(initialSection);
  }, [initialSection]);

  // Studying states
  const [activeLesson, setActiveLesson] = useState<LessonData | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Alphabet lessons helper states
  const [currentAlphabetStep, setCurrentAlphabetStep] = useState<'shapes' | 'vowels'>('shapes');
  const [selectedAlphabetLetter, setSelectedAlphabetLetter] = useState('أ');
  const [selectedVowelIndex, setSelectedVowelIndex] = useState(0);
  const [activeVowelLetterApplied, setActiveVowelLetterApplied] = useState('أَ');

  // Quiz Engine State
  const [activeQuiz, setActiveQuiz] = useState<{ 
    lessonId: string; 
    questions: QuizQuestion[]; 
    points: number;
    isUnlockQuiz?: boolean;
    targetLevelKey?: 'adventure' | 'master';
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Teacher marketplace states
  const { teachers: allTeachers } = useTeachers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'students' | 'newest'>('rating');

  // Load user data on startup
  useEffect(() => {
    const savedProgress = localStorage.getItem('quranmaster_learn_progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setUserProgress({
          xp: typeof parsed?.xp === 'number' ? parsed.xp : 0,
          completedLessons: Array.isArray(parsed?.completedLessons) ? parsed.completedLessons : [],
          unlockedLevels: parsed?.unlockedLevels && typeof parsed.unlockedLevels === 'object' ? parsed.unlockedLevels : { arabic: ['explorer'] }
        });
      } catch (err) {
        console.error('Failed to parse user progress', err);
      }
    }

    const savedCurriculum = localStorage.getItem('quranmaster_curriculum_v2');
    if (savedCurriculum) {
      try {
        const parsed: SectionData[] = JSON.parse(savedCurriculum);
        const merged = parsed.map(s => {
          const original = INITIAL_LEARNING_SECTIONS.find(o => o.id === s.id);
          
          if (s.id === 'arabic' && original) {
            const updatedLevels = { ...s.levels };
            (['explorer', 'adventure', 'master'] as const).forEach(lvlKey => {
              const origLvl = original.levels[lvlKey];
              const savedLvl = s.levels[lvlKey];
              if (savedLvl && origLvl) {
                savedLvl.lessons = savedLvl.lessons.map(savedLsn => {
                  if (savedLsn.isAlphabet) {
                    savedLsn.description = "";
                    const origLsn = origLvl.lessons.find(l => l.id === savedLsn.id);
                    if (origLsn && origLsn.alphabetData && savedLsn.alphabetData) {
                      const updatedDetails = { ...savedLsn.alphabetData.letterDetails };
                      
                      Object.keys(updatedDetails).forEach(letterChar => {
                        const savedDetail = updatedDetails[letterChar];
                        const origDetail = origLsn.alphabetData?.letterDetails[letterChar];
                        if (origDetail && savedDetail) {
                          savedDetail.shapes = {
                            ...origDetail.shapes,
                            ...savedDetail.shapes,
                            isNonConnecting: origDetail.shapes.isNonConnecting
                          };
                          
                          const fields = [
                            'isolatedWord', 'isolatedTranslation', 'isolatedArabic', 'isolatedEmoji',
                            'initialWord', 'initialTranslation', 'initialArabic', 'initialEmoji',
                            'medialWord', 'medialTranslation', 'medialArabic', 'medialEmoji',
                            'finalWord', 'finalTranslation', 'finalArabic', 'finalEmoji'
                          ] as const;
                          fields.forEach(f => {
                            if (!savedDetail.shapes[f]) {
                              (savedDetail.shapes as any)[f] = origDetail.shapes[f];
                            }
                          });
                        }
                      });
                      
                      return {
                        ...savedLsn,
                        alphabetData: {
                          ...savedLsn.alphabetData,
                          letterDetails: updatedDetails
                        }
                      };
                    }
                  }
                  return savedLsn;
                });
              }
            });
          }
          
          return { ...s, icon: original ? original.icon : null };
        });
        setLearningSections(merged);
      } catch (err) {
        console.error('Failed to parse curriculum backup', err);
      }
    }
  }, []);

  const saveProgress = (updatedProgress: UserProgress) => {
    localStorage.setItem('quranmaster_learn_progress', JSON.stringify(updatedProgress));
    setUserProgress(updatedProgress);
  };

  const triggerConfetti = () => {
    canvasConfetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  };

  // Compile certified teacher subjects
  const teacherSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    allTeachers.forEach(teacher => {
      teacher.subjects.forEach(subject => subjectSet.add(subject));
    });
    return Array.from(subjectSet);
  }, [allTeachers]);

  // Filtering teachers list
  const filteredTeachers = useMemo(() => {
    const filtered = allTeachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            teacher.bio.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'all' || teacher.subjects.includes(selectedSubject);
      return matchesSearch && matchesSubject;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'students') return (b.students || 0) - (a.students || 0);
      if (sortBy === 'newest') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      return 0;
    });

    return filtered;
  }, [allTeachers, searchQuery, selectedSubject, sortBy]);

  // Overall track completion calculation
  const overallCompletion = useMemo(() => {
    let totalLessonsCount = 0;
    let completedLessonsCount = 0;
    const completedList = userProgress?.completedLessons || [];

    learningSections.forEach(sec => {
      (['explorer', 'adventure', 'master'] as const).forEach(lvlKey => {
        const lvl = sec.levels[lvlKey];
        totalLessonsCount += lvl.lessons.length;
        lvl.lessons.forEach(lsn => {
          if (completedList.includes(lsn.id)) {
            completedLessonsCount++;
          }
        });
      });
    });

    if (totalLessonsCount === 0) return 0;
    return Math.round((completedLessonsCount / totalLessonsCount) * 100);
  }, [userProgress?.completedLessons, learningSections]);

  // Determine seeker scholar rank status
  const scholarRank = useMemo(() => {
    const xp = userProgress.xp;
    if (xp >= 1200) return 'Grand Scholar (عَالِم)';
    if (xp >= 700) return 'Researcher (بَاحِث)';
    if (xp >= 400) return 'Scholar (شَيْخ)';
    if (xp >= 150) return 'Seeker (طَالِب عِلْم)';
    return 'Initiate (مُبْتَدِئ)';
  }, [userProgress.xp]);

  // Initialize selected alphabet letter details
  useEffect(() => {
    if (activeLesson?.isAlphabet && activeLesson.alphabetData?.letters.length) {
      const firstLetter = activeLesson.alphabetData.letters[0];
      setSelectedAlphabetLetter(firstLetter);
      setSelectedVowelIndex(0);
      setCurrentAlphabetStep('shapes');
      
      const letterData = activeLesson.alphabetData.letterDetails[firstLetter];
      if (letterData?.vowels.length) {
        setActiveVowelLetterApplied(letterData.vowels[0].letterApplied);
      }
    }
  }, [activeLesson]);

  // Submit Quiz Options Answers
  const submitAnswer = () => {
    if (selectedOption === null || isAnswered || !activeQuiz) return;
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    if (selectedOption === currentQuestion.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    setIsAnswered(true);
  };

  // Stepper logic for quiz navigation
  const nextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      const minToPass = activeQuiz.isUnlockQuiz
        ? Math.ceil(activeQuiz.questions.length * 0.8) // 80% passing for review unlock quiz
        : Math.ceil(activeQuiz.questions.length * 0.6); // 60% passing for regular lesson quiz
      const passed = quizScore >= minToPass;
      setQuizFinished(true);

      if (passed) {
        triggerConfetti();

        let newXp = userProgress?.xp || 0;
        let newCompleted = [...(userProgress?.completedLessons || [])];

        const currentSecId = selectedSection?.id || '';
        let updatedUnlocked = { ...(userProgress?.unlockedLevels || {}) };
        const unlockedList = [...(updatedUnlocked[currentSecId] || ['explorer'])];

        if (activeQuiz.isUnlockQuiz && activeQuiz.targetLevelKey) {
          if (!unlockedList.includes(activeQuiz.targetLevelKey)) {
            unlockedList.push(activeQuiz.targetLevelKey);
          }
          if (!newCompleted.includes(activeQuiz.lessonId)) {
            newCompleted.push(activeQuiz.lessonId);
            newXp += activeQuiz.points;
          }
          updatedUnlocked[currentSecId] = unlockedList as ('explorer' | 'adventure' | 'master')[];
        } else {
          if (!newCompleted.includes(activeQuiz.lessonId)) {
            newCompleted.push(activeQuiz.lessonId);
            newXp += activeQuiz.points;
          }
        }

        saveProgress({
          xp: newXp,
          completedLessons: newCompleted,
          unlockedLevels: updatedUnlocked
        });
      }
    }
  };

  const startUnlockQuiz = (fromLevelKey: 'explorer' | 'adventure', targetLevelKey: 'adventure' | 'master') => {
    if (!selectedSection) return;
    
    const levelsToInclude: ('explorer' | 'adventure')[] = targetLevelKey === 'master' 
      ? ['explorer', 'adventure'] 
      : ['explorer'];

    // Collect all quiz questions from all lessons in the previous levels
    let allQuestions: QuizQuestion[] = [];
    levelsToInclude.forEach(lvlKey => {
      const lessons = selectedSection.levels[lvlKey]?.lessons || [];
      lessons.forEach(lesson => {
        if (lesson.quiz && lesson.quiz.length > 0) {
          allQuestions = [...allQuestions, ...lesson.quiz];
        }
      });
    });

    if (allQuestions.length === 0) {
      alert("No review questions available in the previous level to generate an unlock quiz.");
      return;
    }

    // Shuffle the collected questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    // Select up to 10 questions for the unlock quiz
    const selectedQuestions = shuffled.slice(0, 10);

    // Initialize the activeQuiz state
    setQuizScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);

    setActiveQuiz({
      lessonId: `unlock_quiz_${selectedSection.id}_${targetLevelKey}`,
      questions: selectedQuestions,
      points: 100, // Unlock quizzes give 100 bonus points!
      isUnlockQuiz: true,
      targetLevelKey: targetLevelKey
    });
  };

  const getLevelStatus = (sectionId: string, levelId: 'explorer' | 'adventure' | 'master') => {
    const unlocked = userProgress?.unlockedLevels?.[sectionId] || ['explorer'];
    const isUnlocked = unlocked.includes(levelId);
    
    if (!isUnlocked) return 'locked';

    const levelLessons = learningSections.find(s => s.id === sectionId)?.levels[levelId].lessons || [];
    const completedList = userProgress?.completedLessons || [];
    const allCompleted = levelLessons.length > 0 && levelLessons.every(l => completedList.includes(l.id));
    
    if (allCompleted) return 'passed';
    return 'active';
  };

  const resetQuizState = () => {
    setActiveQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  return (
    <div className={`${styles.container} ${selectedSection ? styles.hasBackground : ''}`} style={{ position: 'relative', overflowX: 'hidden' }}>
      {!selectedSection && <GeometricPattern showOverlay={false} fixed={true} />}
      {selectedSection && <div className={styles.parallaxBg} />}
      
      {/* Top Breadcrumb & Architect Jump links */}
      <div className={styles.architectBar}>
        <Link href="/" className={styles.backLink} style={{ margin: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Back to Home
        </Link>

        <Link
          href="/learn/edit"
          className={styles.architectLink}
        >
          <span>Curriculum Architect 🛠️</span>
        </Link>
      </div>

      {/* Hero Header */}
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={styles.title}>
          <span>QuranMaster Learning Hub</span>
          Expand Your Faith
        </h1>
        <p className={styles.subtitle}>
          Embark on a beautifully structured journey of knowledge. Explore the depths of the Arabic language, Islamic jurisprudence, core creed, stories of the prophets, and Prophetic biographies.
        </p>
      </motion.div>

      {/* Primary Tab Toggler Switches */}
      <div className={styles.tabContainer}>
        <button 
          onClick={() => { setActiveTab('path'); setSelectedSection(null); setSelectedLevelKey(null); }}
          className={`${styles.tabButton} ${activeTab === 'path' ? styles.tabButtonActive : ''}`}
        >
          📚 Self-Paced Curriculum
        </button>
        <button 
          onClick={() => { setActiveTab('games'); setSelectedSection(null); setSelectedLevelKey(null); }}
          className={`${styles.tabButton} ${activeTab === 'games' ? styles.tabButtonActive : ''}`}
        >
          🎮 Play & Learn Arcade
        </button>
        <button 
          onClick={() => { setActiveTab('teachers'); setSelectedSection(null); setSelectedLevelKey(null); }}
          className={`${styles.tabButton} ${activeTab === 'teachers' ? styles.tabButtonActive : ''}`}
        >
          🎓 Certified Teachers
        </button>
      </div>

      {/* Render selected active Tab pane */}
      {activeTab === 'path' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          {!selectedSection ? (
            /* Subcomponent: Overall Seeker status banner followed by grid selectors */
            <>
              <UserProgressBanner
                userProgress={userProgress}
                scholarRank={scholarRank}
                overallCompletion={overallCompletion}
                styles={styles}
              />

              <div className={styles.sectionGrid}>
                {learningSections.map((section) => {
                  let totalLsns = 0;
                  let completedLsns = 0;
                  const completedList = userProgress?.completedLessons || [];
                  
                  (['explorer', 'adventure', 'master'] as const).forEach(lvlKey => {
                    const level = section.levels[lvlKey];
                    totalLsns += level.lessons.length;
                    level.lessons.forEach(l => {
                      if (completedList.includes(l.id)) {
                        completedLsns++;
                      }
                    });
                  });

                  const percent = totalLsns > 0 ? Math.round((completedLsns / totalLsns) * 100) : 0;

                  return (
                    <motion.div
                      key={section.id}
                      className={section.id === 'arabic' ? `${styles.sectionCard} ${styles.sectionCardArabic}` : styles.sectionCard}
                      onClick={() => {
                        setSelectedSection(section);
                        const subjectSlug = section.id === 'aqidah' ? 'aqida' : section.id;
                        router.push(`/learn/${subjectSlug}`);
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ y: -6, scale: 1.01 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={styles.sectionHeader}>
                        <div className={styles.sectionIconRing}>{section.icon}</div>
                        <div className={styles.sectionTitleCol}>
                          <h3>{section.title}</h3>
                          <span className={styles.arabicHeading}>{section.arabicTitle}</span>
                        </div>
                      </div>
                      <p className={styles.sectionDesc}>{section.description}</p>
                      
                      <div className={styles.progressBarTrack}>
                        <div className={styles.progressBarFill} style={{ width: `${percent}%` }} />
                      </div>
                      <div className={styles.sectionProgressFooter}>
                        <span>{percent}% Completed</span>
                        <span>{completedLsns} / {totalLsns} Lessons</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Subcomponent: Section Level timelines detailed roadmaps viewport */
            <SectionTimeline
              selectedSection={selectedSection}
              styles={styles}
              userProgress={userProgress}
              getLevelStatus={getLevelStatus}
              onBack={() => {
                setSelectedSection(null);
                setSelectedLevelKey(null);
                router.push('/learn');
              }}
              onStartLesson={(lesson, levelKey) => {
                setActiveLesson(lesson);
                setSelectedLevelKey(levelKey);
                setCurrentSlideIndex(0);
              }}
              onStartQuiz={(lesson, levelKey) => {
                resetQuizState();
                setSelectedLevelKey(levelKey);
                setActiveQuiz({
                  lessonId: lesson.id,
                  questions: lesson.quiz,
                  points: lesson.points
                });
              }}
              onStartUnlockQuiz={startUnlockQuiz}
            />
          )}
        </motion.div>
      )}
      {/* Tab: Games Arcade */}
      {activeTab === 'games' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <GamesArcade
            styles={styles}
            userProgress={userProgress}
            onAwardXp={(xpAmount) => {
              const newXp = (userProgress?.xp || 0) + xpAmount;
              saveProgress({
                ...userProgress,
                xp: newXp,
              });
            }}
          />
        </motion.div>
      )}

      {/* Tab 2: Certified teachers listing */}
      {activeTab === 'teachers' && (
        <TeacherMarketplace
          styles={styles}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          sortBy={sortBy}
          setSortBy={setSortBy}
          teacherSubjects={teacherSubjects}
          filteredTeachers={filteredTeachers}
          onBookClick={() => setIsModalOpen(true)}
        />
      )}

      {/* overlay study slide-deck modal */}
      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            activeLesson={activeLesson}
            currentSlideIndex={currentSlideIndex}
            setCurrentSlideIndex={setCurrentSlideIndex}
            currentAlphabetStep={currentAlphabetStep}
            setCurrentAlphabetStep={setCurrentAlphabetStep}
            selectedAlphabetLetter={selectedAlphabetLetter}
            setSelectedAlphabetLetter={setSelectedAlphabetLetter}
            selectedVowelIndex={selectedVowelIndex}
            setSelectedVowelIndex={setSelectedVowelIndex}
            activeVowelLetterApplied={activeVowelLetterApplied}
            setActiveVowelLetterApplied={setActiveVowelLetterApplied}
            styles={styles}
            onClose={() => { setActiveLesson(null); setCurrentSlideIndex(0); }}
            onStartQuiz={(lesson) => {
              resetQuizState();
              setActiveLesson(null);
              setActiveQuiz({
                lessonId: lesson.id,
                questions: lesson.quiz,
                points: lesson.points
              });
            }}
          />
        )}
      </AnimatePresence>

      {/* overlay practice check quiz modal */}
      <AnimatePresence>
        {activeQuiz && (
          <QuizModal
            activeQuiz={activeQuiz}
            currentQuestionIndex={currentQuestionIndex}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            quizScore={quizScore}
            quizFinished={quizFinished}
            styles={styles}
            onOptionSelect={isAnswered ? () => {} : setSelectedOption}
            onSubmitAnswer={submitAnswer}
            onNextQuestion={nextQuestion}
            onClose={resetQuizState}
          />
        )}
      </AnimatePresence>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

    </div>
  );
}
