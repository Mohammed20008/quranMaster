'use client';

import { useState, useEffect } from 'react';
import styles from './side-controls.module.css';

interface SideControlsProps {
  onFontSizeChange: (size: number) => void;
  currentFontSize: number;
}

export default function SideControls({ onFontSizeChange, currentFontSize }: SideControlsProps) {
  const [isAutoScroll, setIsAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 to 10

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    
    // Accumulator for sub-pixel scrolling
    let scrollAccumulator = 0;

    const animateScroll = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Base speed: 20px per second
      // Multiplier: scrollSpeed (1-10)
      // Total pixels per second = 20 + (scrollSpeed * 15)
      // Example: Speed 1 = 35px/s, Speed 10 = 170px/s
      const pixelsPerSecond = 20 + (scrollSpeed * 15);
      
      const pixelsToScroll = (pixelsPerSecond * deltaTime) / 1000;
      scrollAccumulator += pixelsToScroll;

      // Allow sub-pixel scrolling if browser supports it, otherwise keep accumulating
      // We pass the full accumulator to scrollBy, then subtract what we *intended* to scroll.
      // Ideally, we'd subtract only what actually scrolled, but we can't easily know that.
      // A safe hybrid: scroll only if > 0.5 to avoid micro-jitters, but pass float.
      if (scrollAccumulator >= 0.5) {
        window.scrollBy({ top: scrollAccumulator, behavior: 'auto' });
        scrollAccumulator = 0;
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    if (isAutoScroll) {
      animationFrameId = requestAnimationFrame(animateScroll);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAutoScroll, scrollSpeed]);

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFontSizeChange(Number(e.target.value));
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrollSpeed(Number(e.target.value));
  };

  return (
    <div className={styles.container}>
      {/* Font Size Control */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Font Size</h3>
        <div className={styles.row}>
          <div className={styles.iconBtn} title="Font Size">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3M9 20h6M12 4v16" />
            </svg>
          </div>
          <div className={styles.sliderContainer}>
            <input 
              type="range" 
              min="20" 
              max="100" 
              value={currentFontSize} 
              onChange={handleFontSizeChange}
              className={styles.rangeInput}
            />
          </div>
        </div>
      </div>

      {/* Auto Scroll Control */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Auto Scroll</h3>
        <div className={styles.row}>
          <button 
            className={`${styles.iconBtn} ${isAutoScroll ? styles.active : ''}`}
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            title={isAutoScroll ? "Pause Auto Scroll" : "Start Auto Scroll"}
          >
            {isAutoScroll ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            )}
          </button>
          <div className={styles.sliderContainer}>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={scrollSpeed} 
              onChange={handleSpeedChange}
              className={styles.rangeInput}
            />
            <span className={styles.speedValue}>{scrollSpeed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
