'use client';

import { surahs } from '@/data/surah-data';
import TestModeView from '@/app/components/left-menu/test-mode-view';
import styles from './page.module.css';

export default function TestPage() {
  return (
    <main className={styles.main}>
      <TestModeView surahs={surahs} />
    </main>
  );
}
