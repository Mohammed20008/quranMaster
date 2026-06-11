'use client';

import { motion } from 'framer-motion';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  activeQuiz: { 
    lessonId: string; 
    questions: QuizQuestion[]; 
    points: number;
    isUnlockQuiz?: boolean;
    targetLevelKey?: 'explorer' | 'adventure' | 'master';
  } | null;
  currentQuestionIndex: number;
  selectedOption: number | null;
  isAnswered: boolean;
  quizScore: number;
  quizFinished: boolean;
  styles: any;
  onOptionSelect: (idx: number) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onClose: () => void;
}

export default function QuizModal({
  activeQuiz,
  currentQuestionIndex,
  selectedOption,
  isAnswered,
  quizScore,
  quizFinished,
  styles,
  onOptionSelect,
  onSubmitAnswer,
  onNextQuestion,
  onClose
}: QuizModalProps) {
  if (!activeQuiz) return null;

  const currentQuestion = activeQuiz.questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + (isAnswered ? 1 : 0)) / activeQuiz.questions.length) * 100);
  
  const minToPass = activeQuiz.isUnlockQuiz
    ? Math.ceil(activeQuiz.questions.length * 0.8) // 80% for comprehensive reviews
    : Math.ceil(activeQuiz.questions.length * 0.6); // 60% for regular quizzes
    
  const isPassed = quizScore >= minToPass;

  return (
    <div className={styles.modalOverlay}>
      <motion.div 
        className={styles.modalContentCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
      >
        {/* Header progress info */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleText}>
            <h3>{activeQuiz.isUnlockQuiz ? '🔑 Comprehensive Tier Unlock Quiz' : 'Interactive Knowledge Quiz Check'}</h3>
            <p>
              {activeQuiz.isUnlockQuiz
                ? `Pass this comprehensive review to unlock the ${activeQuiz.targetLevelKey} tier! (80% correct required)`
                : `Pass to unlock the next level and earn ⭐ {activeQuiz.points} XP`
              }
            </p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* Dynamic percentage bar */}
        <div className={styles.quizProgressBarTrack}>
          <div 
            className={styles.quizProgressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {!quizFinished ? (
          /* Question Viewport */
          <div className={styles.quizBody}>
            <div className={styles.quizHeaderBar}>
              <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
              <span>Passing Requirement: {minToPass}+ Correct</span>
            </div>

            <div className={styles.questionBox}>
              <h4>{currentQuestion.question}</h4>
            </div>

            <div className={styles.optionsGrid}>
              {currentQuestion.options.map((opt, oIdx) => {
                let cardClass = styles.optionCard;
                if (selectedOption === oIdx) {
                  cardClass += ` ${styles.optionCardSelected}`;
                }
                
                // Colors overlay if question is answered
                if (isAnswered) {
                  cardClass += ` ${styles.optionCardDisabled}`;
                  if (oIdx === currentQuestion.correctAnswer) {
                    cardClass += ` ${styles.optionCardCorrect}`;
                  } else if (selectedOption === oIdx) {
                    cardClass += ` ${styles.optionCardIncorrect}`;
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => onOptionSelect(oIdx)}
                    disabled={isAnswered}
                    className={cardClass}
                  >
                    <span>{opt}</span>
                    <span className={styles.feedbackIcon}>
                      {isAnswered && oIdx === currentQuestion.correctAnswer && '✓'}
                      {isAnswered && selectedOption === oIdx && oIdx !== currentQuestion.correctAnswer && '✕'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation box shown post submission */}
            {isAnswered && (
              <motion.div 
                className={styles.explanationCard}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h5>💡 Knowledge Explanation</h5>
                <p>{currentQuestion.explanation}</p>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className={styles.quizFooterRow}>
              {!isAnswered ? (
                <button
                  onClick={onSubmitAnswer}
                  disabled={selectedOption === null}
                  className={styles.quizBtn}
                  style={{ width: 'auto', padding: '0.85rem 2.5rem' }}
                >
                  Verify Answer
                </button>
              ) : (
                <button
                  onClick={onNextQuestion}
                  className={styles.quizBtn}
                  style={{ width: 'auto', padding: '0.85rem 2.5rem' }}
                >
                  {currentQuestionIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Final Quiz Tally Score view */
          <div className={`${styles.quizBody} ${styles.quizResultBody}`}>
            <div className={styles.quizResultIcon}>{isPassed ? '🏆' : '📚'}</div>
            
            <h3 className={styles.quizResultTitle} style={{ color: isPassed ? '#10b981' : 'var(--foreground)' }}>
              {isPassed 
                ? (activeQuiz.isUnlockQuiz ? '🎉 Tier Unlocked Successfully!' : 'Congratulations! Level Passed!')
                : 'Practice Makes Perfect'
              }
            </h3>
            
            <p className={styles.quizResultDesc} style={{ color: 'var(--foreground-secondary)' }}>
              {isPassed 
                ? (activeQuiz.isUnlockQuiz 
                    ? `Excellent! You scored ${quizScore} / ${activeQuiz.questions.length}. The ${activeQuiz.targetLevelKey} tier is now fully unlocked for you to explore!`
                    : `You passed the check with a score of ${quizScore} / ${activeQuiz.questions.length}! You have earned ⭐ ${activeQuiz.points} XP.`
                  )
                : (activeQuiz.isUnlockQuiz
                    ? `You scored ${quizScore} / ${activeQuiz.questions.length}. You need ${minToPass}+ correct answers (80%) to unlock the ${activeQuiz.targetLevelKey} tier. Keep reviewing the letters and try again!`
                    : `You scored ${quizScore} / ${activeQuiz.questions.length}. To unlock the next level and earn XP, please aim to get ${minToPass}+ correct answers.`
                  )
              }
            </p>

            <div className={styles.quizResultBtnRow}>
              <button 
                onClick={onClose}
                className={styles.learnBtn}
                style={{ width: 'auto', padding: '0.85rem 2.5rem', borderRadius: '16px' }}
              >
                {isPassed ? 'Continue Learning' : 'Practice More'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
