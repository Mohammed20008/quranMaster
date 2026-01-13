'use client';

import { motion } from 'framer-motion';
import styles from './featured-hadith.module.css';

interface FeaturedHadithProps {
  hadith: {
    arabic: string;
    english: string;
    narrator?: string;
    reference: string;
  };
}

export default function FeaturedHadith({ hadith }: FeaturedHadithProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Hadith of the Day',
        text: `${hadith.english}\n\n— ${hadith.reference}`,
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${hadith.arabic}\n\n${hadith.english}\n\n— ${hadith.reference}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.featuredContainer}
    >
      <div className={styles.featuredCard}>
        <div className={styles.cornerDecor}></div>
        <div className={styles.badge}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Hadith of the Day
        </div>
        
        <div className={styles.arabicText} dir="rtl">
          {hadith.arabic}
        </div>
        
        <div className={styles.englishText}>
          "{hadith.english}"
        </div>
        
        {hadith.narrator && (
          <div className={styles.narrator}>
            Narrated by {hadith.narrator}
          </div>
        )}
        
        <div className={styles.reference}>
          {hadith.reference}
        </div>
        
        <div className={styles.actions}>
          <button onClick={handleCopy} className={styles.actionBtn} aria-label="Copy">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button onClick={handleShare} className={styles.actionBtn} aria-label="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
