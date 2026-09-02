'use client';

import { useUserData } from '@/app/context/user-data-context';
import styles from './side-controls.module.css';

const DEFAULT_FONT_SIZE = 32;

export default function SideControls() {
  const { settings, updateSettings } = useUserData();
  const fontSize = settings?.fontSize || DEFAULT_FONT_SIZE;

  const handleZoomIn = () => {
    updateSettings({ fontSize: Math.min(64, fontSize + 2) });
  };

  const handleZoomOut = () => {
    updateSettings({ fontSize: Math.max(16, fontSize - 2) });
  };

  const handleReset = () => {
    updateSettings({ fontSize: DEFAULT_FONT_SIZE });
  };

  const isDefault = fontSize === DEFAULT_FONT_SIZE;
  const zoomPercentage = Math.round((fontSize / DEFAULT_FONT_SIZE) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Page Zoom</h3>

        {/* 3 stacked buttons: +, reset (neutral), - */}
        <div className={styles.btnStack}>
          {/* Zoom In */}
          <button
            className={styles.iconBtn}
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            disabled={fontSize >= 64}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Reset / Neutral */}
          <button
            className={`${styles.iconBtn} ${styles.resetBtn} ${isDefault ? styles.resetBtnActive : ''}`}
            onClick={handleReset}
            title="Reset to 100%"
            aria-label="Reset Zoom"
          >
            <span className={styles.resetLabel}>{zoomPercentage}%</span>
          </button>

          {/* Zoom Out */}
          <button
            className={styles.iconBtn}
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            disabled={fontSize <= 16}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
