'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from './tafsir-sheet.module.css';
import { getTafsir, QulTafsirItem } from '../../actions/get-tafsir';
import tafsirsListData from '@/data/tafsirs-list.json';

interface TafsirSheetProps {
  verseKey: string | null; // e.g., "1-1" or "1:1"
  onClose: () => void;
}

export default function TafsirSheet({ verseKey, onClose }: TafsirSheetProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([912, 169]); // 912: As-Saadi, 169: Ibn Kathir
  const [activeTafsirId, setActiveTafsirId] = useState<number>(912);
  const [data, setData] = useState<QulTafsirItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Settings Panel States
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLangFilter, setActiveLangFilter] = useState('all');

  // Load selection from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selected_tafsir_ids');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids) && ids.length > 0) {
          setSelectedIds(ids);
          // Set first id as active default
          setActiveTafsirId(ids[0]);
        }
      } catch (e) {
        console.error('Failed to parse selected_tafsir_ids', e);
      }
    }
  }, []);

  // Fetch Tafsir content
  useEffect(() => {
    if (verseKey) {
      setIsOpen(true);
      setLoading(true);
      
      const formattedKey = verseKey.replace('-', ':');
      
      getTafsir(formattedKey, selectedIds)
        .then((result) => {
          setData(result);
          // Verify if activeTafsirId exists in the returned items, otherwise default to first returned item
          if (result.length > 0) {
            const hasActive = result.some(item => item.resource_id === activeTafsirId);
            if (!hasActive) {
              setActiveTafsirId(result[0].resource_id);
            }
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setIsOpen(false);
      // Reset settings states on close
      setShowSettings(false);
      setSearchQuery('');
      setActiveLangFilter('all');
      setTimeout(() => setData(null), 300);
    }
  }, [verseKey, selectedIds]);

  // Extract all unique languages from the metadata
  const languages = useMemo(() => {
    const langs = new Set<string>();
    tafsirsListData.tafsirs.forEach((t: any) => {
      if (t.language_name) {
        langs.add(t.language_name.toLowerCase());
      }
    });
    return ['all', ...Array.from(langs).sort()];
  }, []);

  // Filter the list of tafsirs based on search query and active language filter
  const filteredTafsirs = useMemo(() => {
    return tafsirsListData.tafsirs.filter((t: any) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.author_name && t.author_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLang = 
        activeLangFilter === 'all' || 
        (t.language_name && t.language_name.toLowerCase() === activeLangFilter.toLowerCase());
      
      return matchesSearch && matchesLang;
    });
  }, [searchQuery, activeLangFilter]);

  // Handle closing with animation
  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [handleClose]);

  const toggleTafsir = (id: number) => {
    setSelectedIds(prev => {
      let updated;
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least one tafsir
        updated = prev.filter(x => x !== id);
      } else {
        updated = [...prev, id];
      }
      localStorage.setItem('selected_tafsir_ids', JSON.stringify(updated));
      return updated;
    });
  };

  if (!verseKey && !isOpen) return null;

  // Resolve active tafsir content
  const currentContent = data?.find(item => item.resource_id === activeTafsirId);

  // Helper to determine if a language is RTL
  const isRTL = (langName?: string) => {
    if (!langName) return false;
    const rtlLanguages = ['arabic', 'urdu', 'persian', 'hebrew', 'pashto', 'sindhi'];
    return rtlLanguages.includes(langName.toLowerCase());
  };

  // Helper to find tafsir name in metadata
  const getTafsirName = (id: number) => {
    const found = tafsirsListData.tafsirs.find(t => t.id === id);
    return found ? found.name : `Tafsir ${id}`;
  };

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

        {/* Dynamic tabs list */}
        {!showSettings && (
          <div className={styles.tabsContainer}>
            <div className={styles.tabs}>
              {data && data.map((item) => {
                const isSelected = activeTafsirId === item.resource_id;
                return (
                  <button 
                    key={item.resource_id}
                    className={`${styles.tab} ${isSelected ? styles.active : ''}`}
                    onClick={() => setActiveTafsirId(item.resource_id)}
                  >
                    {item.resource_name || getTafsirName(item.resource_id)}
                  </button>
                );
              })}
            </div>
            <button 
              className={styles.settingsIconBtn} 
              onClick={() => setShowSettings(true)} 
              title="Configure Tafsirs"
              aria-label="Configure Tafsirs"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
          </div>
        )}

        <div className={styles.content}>
          {showSettings ? (
            <div className={styles.settingsPanel}>
              <div className={styles.settingsHeader}>
                <h3>Configure Tafsirs</h3>
                <button className={styles.settingsCloseBtn} onClick={() => setShowSettings(false)}>
                  Done
                </button>
              </div>
              
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search 115 Tafsirs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className={styles.clearSearchBtn}>
                    Clear
                  </button>
                )}
              </div>

              <div className={styles.langFilters}>
                {languages.map(lang => {
                  const isActive = activeLangFilter === lang;
                  return (
                    <button
                      key={lang}
                      className={`${styles.langFilterBtn} ${isActive ? styles.activeFilter : ''}`}
                      onClick={() => setActiveLangFilter(lang)}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </button>
                  );
                })}
              </div>

              <div className={styles.tafsirGrid}>
                {filteredTafsirs.map(tafsir => {
                  const isChecked = selectedIds.includes(tafsir.id);
                  return (
                    <div 
                      key={tafsir.id} 
                      className={`${styles.tafsirCard} ${isChecked ? styles.selectedCard : ''}`}
                      onClick={() => toggleTafsir(tafsir.id)}
                    >
                      <div className={styles.tafsirCardHeader}>
                        <span className={styles.tafsirLanguageBadge}>{tafsir.language_name}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className={styles.tafsirCheckbox}
                        />
                      </div>
                      <div className={styles.tafsirCardBody}>
                        <h4 className={styles.tafsirCardName}>{tafsir.name}</h4>
                        {tafsir.author_name && (
                          <p className={styles.tafsirCardAuthor}>By {tafsir.author_name}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : loading ? (
            <div className={styles.skeletonContainer}>
              <div className={styles.skeletonLineShort}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineMedium}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineShort}></div>
            </div>
          ) : currentContent ? (
            <div 
              className={`${styles.tafsirText} ${isRTL(currentContent.language_name) ? styles.arabic : ''}`}
              dangerouslySetInnerHTML={{ __html: currentContent.text }}
            />
          ) : (
            <div className={styles.emptyState}>
              No Tafsir available for this verse. Please check your internet connection or configure active Tafsirs.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

