'use client';

import { motion } from 'framer-motion';
import { UserProgress } from '../types';

interface UserProgressBannerProps {
  userProgress: UserProgress;
  scholarRank: string;
  overallCompletion: number;
  styles: any;
}

export default function UserProgressBanner({
  userProgress,
  scholarRank,
  overallCompletion,
  styles
}: UserProgressBannerProps) {
  return (
    <motion.div 
      className={styles.userStatsCard}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className={styles.profileInfo}>
        <div className={styles.profileAvatarRing}>🕌</div>
        <div className={styles.profileText}>
          <h3>
            Seeker of Knowledge
            <span className={styles.levelTag}>{scholarRank}</span>
          </h3>
          <p className={styles.quranQuote}>
            "Rabbi Zidni 'Ilman" — My Lord, increase me in knowledge (Quran 20:114)
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statVal}>⭐ {userProgress.xp} XP</div>
          <div className={styles.statLbl}>Experience</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statVal}>✔️ {userProgress.completedLessons.length}</div>
          <div className={styles.statLbl}>Lessons Done</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statVal}>{overallCompletion}%</div>
          <div className={styles.statLbl}>Track Progress</div>
        </div>
      </div>
    </motion.div>
  );
}
