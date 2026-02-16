'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudio } from '@/app/context/audio-context';
import { surahs } from '@/data/surah-data';

import styles from './audio-player-bar.module.css';

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function AudioPlayerBar() {
  const { 
    state, 
    togglePlay, 
    seek, 
    playNextVerse, 
    playPreviousVerse, 
    currentReciter,
    stop
  } = useAudio();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { isPlaying, currentTime, duration, buffered, currentSurah, currentVerse } = state;

  const surah = currentSurah ? surahs.find(s => s.number === currentSurah) : null;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    seek(percentage * duration);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      seek(percentage * duration);
    }
  }, [isDragging, duration, seek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!currentSurah) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div className={`${styles.playerBar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.container}>
        {/* Progress Bar */}
        <div 
          className={styles.progressContainer} 
          ref={progressBarRef}
          onClick={handleProgressClick}
          onMouseDown={() => setIsDragging(true)}
        >
          <div 
            className={styles.bufferedBar} 
            style={{ width: `${bufferedProgress}%` }}
          />
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          >
            <div className={styles.progressKnob} />
          </div>
        </div>

        <div className={styles.content}>
          {/* Surah & Reciter Info */}
          <div className={styles.info}>

            <div className={styles.textInfo}>
              <span className={styles.surahName}>
                {surah ? `${surah.transliteration} (${surah.number})` : 'Surah'}
                {currentVerse && <span className={styles.verseNum}> : {currentVerse}</span>}
              </span>
              <span className={styles.reciterName}>{currentReciter?.name}</span>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button 
              className={styles.controlBtn} 
              onClick={playPreviousVerse}
              title="Previous Verse"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>

            <button 
              className={styles.playBtn} 
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
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

            <button 
              className={styles.controlBtn} 
              onClick={playNextVerse}
              title="Next Verse"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>

          {/* Time & Actions */}
          <div className={styles.actions}>
            <div className={styles.timeInfo}>
              <span>{formatTime(currentTime)}</span>
              <span className={styles.timeDivider}>/</span>
              <span>{formatTime(duration)}</span>
            </div>

            <button 
              className={styles.actionBtn}
              onClick={() => stop()}
              title="Stop & Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
            </button>

            <button 
              className={styles.actionBtn}
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <svg 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
