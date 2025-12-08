'use client';

import { useEffect, useState } from 'react';
import styles from './tafsir-sheet.module.css';
import { getTafsir } from '../../actions/get-tafsir';

interface TafsirSheetProps {
  verseKey: string | null; // e.g., "1-1" or "1:1"
  onClose: () => void;
}

export default function TafsirSheet({ verseKey, onClose }: TafsirSheetProps) {
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');
  const [data, setData] = useState<{ ar: any; en: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (verseKey) {
      setIsOpen(true);
      setLoading(true);
      
      // Convert "1-1" to "1:1" if necessary
      const formattedKey = verseKey.replace('-', ':');
      
      getTafsir(formattedKey)
        .then((result) => {
          setData(result);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setIsOpen(false);
      // Don't clear data immediately to allow fade out with content
      setTimeout(() => setData(null), 300);
    }
  }, [verseKey]);

  // Handle closing with animation
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (!verseKey && !isOpen) return null;

  const currentContent = activeTab === 'ar' ? data?.ar : data?.en;

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`} 
        onClick={handleClose}
      />
      <div className={`${styles.sheet} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.title}>
            Tafsir Verse {verseKey?.replace('-', ':')}
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'ar' ? styles.active : ''}`}
            onClick={() => setActiveTab('ar')}
          >
            Tafsir As-Saadi (Arabic)
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'en' ? styles.active : ''}`}
            onClick={() => setActiveTab('en')}
          >
            Ibn Kathir (English)
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Loading Tafsir...</div>
          ) : currentContent ? (
            <div 
              className={`${styles.tafsirText} ${activeTab === 'ar' ? styles.arabic : ''}`}
              dangerouslySetInnerHTML={{ __html: currentContent.text }}
            />
          ) : (
            <div className={styles.emptyState}>
              No Tafsir available for this verse.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
