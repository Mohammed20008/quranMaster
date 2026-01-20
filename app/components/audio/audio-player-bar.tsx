'use client';

import React, { useState, useEffect } from 'react';
import { useAudio } from '@/app/context/audio-context';
import { surahs } from '@/data/surah-data';
import styles from './audio-player-bar.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import ReciterImage from './reciter-image';


export default function AudioPlayerBar() {
  const { state, togglePlay, seek, stop, playNextVerse, playPreviousVerse, currentReciter } = useAudio();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!state.currentSurah && !state.isPlaying) return null;

  const surah = surahs.find(s => s.number === state.currentSurah);
  const progressPercent = (state.currentTime / state.duration) * 100 || 0;
  const bufferedPercent = (state.buffered / state.duration) * 100 || 0;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className={`${styles.playerBar} ${isExpanded ? styles.expanded : styles.collapsed}`}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
    >
      <div className={styles.container}>
        {/* Progress Bar */}
        <div className={styles.progressContainer} onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickedTime = (x / rect.width) * state.duration;
            seek(clickedTime);
        }}>
          <div className={styles.bufferedBar} style={{ width: `${bufferedPercent}%` }}></div>
          <div className={styles.progressBar} style={{ width: `${progressPercent}%` }}>
            <div className={styles.progressKnob}></div>
          </div>
        </div>

        <div className={styles.content}>
          {/* Reciter & Surah Info */}
          <div className={styles.info}>
            <ReciterImage 
              src={currentReciter?.imageUrl} 
              name={currentReciter?.name || 'Reciter'} 
              size={40} 
              className={styles.reciterImg} 
            />
            <div className={styles.textInfo}>
              <span className={styles.surahName}>{surah?.transliteration} {state.currentVerse ? `:${state.currentVerse}` : ''}</span>
              <span className={styles.reciterName}>{currentReciter?.name}</span>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={stop} title="Stop">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"></rect>
              </svg>
            </button>
            <button className={styles.controlBtn} onClick={playPreviousVerse} title="Previous Verse">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <rect x="5" y="4" width="2" height="16"></rect>
              </svg>
            </button>
            <button className={styles.playBtn} onClick={togglePlay} title={state.isPlaying ? "Pause" : "Play"}>
              {state.isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            <button className={styles.controlBtn} onClick={playNextVerse} title="Next Verse">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <rect x="17" y="4" width="2" height="16"></rect>
              </svg>
            </button>
            <div className={styles.timeInfo}>
               <span>{formatTime(state.currentTime)}</span>
               <span className={styles.timeDivider}>/</span>
               <span>{formatTime(state.duration)}</span>
            </div>
          </div>

          {/* Additional Options */}
          <div className={styles.actions}>
            <button className={styles.actionBtn} onClick={() => setIsExpanded(!isExpanded)}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(0)' : 'rotate(180deg)', transition: 'transform 0.3s' }}>
                 <path d="M6 9l6 6 6-6"/>
               </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
