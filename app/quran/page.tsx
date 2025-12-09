'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LeftMenu from '../components/left-menu/left-menu';
import Header, { ViewMode } from '../components/header/header';
import QuranReader from '../components/quran-reader/quran-reader';
import SideControls from '../components/side-controls/side-controls';
import { useUserData } from '@/app/hooks/use-user-data';

function QuranContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSurah = parseInt(searchParams.get('surah') || '1');
  
  const [currentSurah, setCurrentSurah] = useState(initialSurah);
  const { 
    bookmarks, 
    toggleBookmark, 
    updateLastRead, 
    settings, 
    updateSettings,
    incrementVersesRead 
  } = useUserData();

  // Update current surah if valid URL param changes
  useEffect(() => {
    const surahParam = searchParams.get('surah');
    if (surahParam) {
       const num = parseInt(surahParam);
       if (!isNaN(num) && num >= 1 && num <= 114) {
          setCurrentSurah(num);
       }
    }
  }, [searchParams]);

  // Apply theme handled by provider, no need to do it here.

  const handleSurahSelect = (surahNumber: number) => {
    setCurrentSurah(surahNumber);
    updateLastRead(surahNumber, 1);
    
    // Update URL without full reload
    const params = new URLSearchParams(window.location.search);
    params.set('surah', surahNumber.toString());
    router.replace(`/quran?${params.toString()}`, { scroll: false });
    
    // Scroll to top when changing surah
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevSurah = () => {
    if (currentSurah > 1) {
      handleSurahSelect(currentSurah - 1);
    }
  };

  const handleNextSurah = () => {
    // When finishing a surah, increment verses read
    if (currentSurah < 114) {
      handleSurahSelect(currentSurah + 1);
    }
  };

  const handleThemeToggle = () => {
    updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
  };
  
  const handleViewModeChange = (mode: ViewMode) => {
    updateSettings({ viewMode: mode });
  };

  const handleFontSizeChange = (size: number) => {
    updateSettings({ fontSize: size });
  };

  return (
    <div className="app-container">
      {/* Left Menu - Two-tier sidebar */}
      <LeftMenu
        currentSurah={currentSurah}
        onSurahSelect={handleSurahSelect}
        bookmarkedVerses={bookmarks}
        onToggleBookmark={toggleBookmark}
      />

      {/* Main Content */}
      <main 
        className="main-content"
        style={{
          marginLeft: '70px', // Only primary sidebar (secondary is hidden by default)
          transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <Header
          currentSurah={currentSurah}
          onPrevSurah={handlePrevSurah}
          onNextSurah={handleNextSurah}
          onThemeToggle={handleThemeToggle}
          theme={settings.theme}
          viewMode={settings.viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* Quran Reader */}
        <SideControls 
          onFontSizeChange={handleFontSizeChange} 
          currentFontSize={settings.fontSize}
        />

        <QuranReader
          surahNumber={currentSurah}
          showTransliteration={settings.showTransliteration}
          showTranslation={settings.showTranslation}
          viewMode={settings.viewMode}
          bookmarkedVerses={bookmarks}
          onToggleBookmark={toggleBookmark}
          onNextSurah={handleNextSurah}
          fontSize={settings.fontSize}
        />
      </main>

      <style jsx>{`
        .app-container {
          min-height: 100vh;
          background: var(--background);
        }

        .main-content {
          min-height: 100vh;
        }

        .font-toggle-container {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding: 2rem 0 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .font-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--border);
          border-radius: 12px;
          background: var(--card-bg);
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .font-toggle-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .font-toggle-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .font-toggle-btn svg {
          opacity: 0.8;
        }

        .font-toggle-btn.active svg {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 60px !important; /* Only primary sidebar on mobile */
          }

          .font-toggle-container {
            padding: 1rem;
          }

          .font-toggle-btn {
            padding: 0.6rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}

export default function QuranPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <QuranContent />
    </Suspense>
  );
}
