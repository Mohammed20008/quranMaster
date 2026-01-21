'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { surahs } from '@/data/surah-data';
import { getVerse } from '@/data/quran-verses';
import styles from './left-menu.module.css';
import { useAuth } from '@/app/context/auth-context';
import { useChat } from '@/app/context/chat-context';
import { User, Settings, LogOut, MessageCircle } from 'lucide-react';
import { renderAvatar, getAvatarPreset } from '@/app/components/avatar/avatar-utils';


interface LeftMenuProps {
  currentSurah: number;
  onSurahSelect: (surahNumber: number) => void;
  bookmarkedVerses?: Set<string>;
  onToggleBookmark?: (verseId: string) => void;
}

type MenuSection = 'search' | 'surahs' | 'bookmarks' | 'progress' | 'settings';

// Helper function to normalize Arabic text (remove diacritics)
function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670]/g, '') // Remove Arabic diacritics
    .replace(/[\u0653-\u065F]/g, '') // Remove additional marks
    .trim();
}

interface SearchResult {
  surahNum: number;
  verseNum: number;
  arabicText: string;
  englishText: string;
  key: string;
}

export default function LeftMenu({ 
  currentSurah, 
  onSurahSelect, 
  bookmarkedVerses = new Set(),
  onToggleBookmark
}: LeftMenuProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<MenuSection | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { unreadTotal, openChat } = useChat();
  const secondarySidebarRef = useRef<HTMLDivElement>(null);
  const primarySidebarRef = useRef<HTMLDivElement>(null);
  
  // Search state
  const [advancedSearchQuery, setAdvancedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside both sidebars
      if (
        activeSection &&
        secondarySidebarRef.current &&
        !secondarySidebarRef.current.contains(target) &&
        primarySidebarRef.current &&
        !primarySidebarRef.current.contains(target)
      ) {
        setActiveSection(null);
      }
      
      // Close user menu if clicking outside
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeSection, showUserMenu]);

  // Search Quran
  useEffect(() => {
    if (!advancedSearchQuery || advancedSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [quranData, translationData] = await Promise.all([
          import('@/data/quran.json').then(m => m.default),
          import('@/data/translation/en-maarif-ul-quran-simple.json').then(m => m.default),
        ]);

        const quranResults: SearchResult[] = [];
        const queryLower = advancedSearchQuery.toLowerCase();
        let matchCount = 0;

        // Search both Arabic and English
        for (const [surahKey, verses] of Object.entries(quranData)) {
          if (matchCount >= 50) break;
          for (const verse of verses as Array<{ chapter: number; verse: number; text: string }>) {
            if (matchCount >= 50) break;
            const key = `${verse.chapter}:${verse.verse}`;
            const translationEntry = (translationData as Record<string, { t: string }>)[key];
            const englishText = translationEntry?.t || '';
            
            // Normalize Arabic text for better matching
            const normalizedVerseText = normalizeArabic(verse.text);
            const normalizedQuery = normalizeArabic(advancedSearchQuery);
            
            // Check Arabic (normalized) OR English (case-insensitive)
            if (normalizedVerseText.includes(normalizedQuery) || englishText.toLowerCase().includes(queryLower)) {
              quranResults.push({
                surahNum: verse.chapter,
                verseNum: verse.verse,
                arabicText: verse.text,
                englishText,
                key,
              });
              matchCount++;
            }
          }
        }

        setSearchResults(quranResults);
      } catch (error) {
        console.error('Quran search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [advancedSearchQuery]);

  // Filter surahs based on search query
  const filteredSurahs = useMemo(() => {
    if (!searchQuery) return surahs;
    
    const query = searchQuery.toLowerCase();
    return surahs.filter(surah => 
      surah.name.includes(searchQuery) ||
      surah.transliteration.toLowerCase().includes(query) ||
      surah.translation.toLowerCase().includes(query) ||
      surah.number.toString().includes(query)
    );
  }, [searchQuery]);

  const handleSectionClick = (section: MenuSection) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleAccountClick = () => {
    if (user) {
      // Navigate to dashboard when clicking the account button
      router.push('/dashboard');
    } else {
      openAuthModal();
    }
  };

  const handleAccountHover = () => {
    if (user) {
      setShowUserMenu(true);
    }
  };

  return (
    <>
      {/* Overlay to close menu when clicking outside */}
      {activeSection && (
        <div 
          className={styles.overlay}
          onClick={() => setActiveSection(null)}
        />
      )}
      <div ref={primarySidebarRef} className={styles.primarySidebar}>
         <div className={styles.primaryLogo}>
          <div className={styles.primaryLogoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.3"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className={styles.primaryNav}>
           <button 
            className={`${styles.primaryNavItem} ${activeSection === 'search' ? styles.active : ''}`}
            onClick={() => handleSectionClick('search')}
            title="Advanced Search"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

           <button 
            className={`${styles.primaryNavItem} ${activeSection === 'surahs' ? styles.active : ''}`}
            onClick={() => handleSectionClick('surahs')}
            title="Surahs"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </button>
          
          <button 
            className={`${styles.primaryNavItem} ${activeSection === 'bookmarks' ? styles.active : ''}`}
            onClick={() => handleSectionClick('bookmarks')}
            title="Bookmarks"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            {bookmarkedVerses.size > 0 && (
              <span className={styles.badge}>{bookmarkedVerses.size}</span>
            )}
          </button>

          <button 
            className={`${styles.primaryNavItem} ${activeSection === 'progress' ? styles.active : ''}`}
            onClick={() => handleSectionClick('progress')}
            title="Progress"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </button>

          <Link 
            href="/learn"
            className={styles.primaryNavItem}
            title="Learn Quran"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </Link>

          <Link 
            href="/articles"
            className={styles.primaryNavItem}
            title="Islamic Articles"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </Link>

          <button 
            className={styles.primaryNavItem}
            onClick={() => openChat()}
            title="Messages"
          >
            <MessageCircle size={22} />
            {unreadTotal > 0 && (
              <span className={styles.badge}>{unreadTotal}</span>
            )}
          </button>

          <button 
            className={`${styles.primaryNavItem} ${activeSection === 'settings' ? styles.active : ''}`}
            onClick={() => handleSectionClick('settings')}
            title="Settings"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m15.66-4.24l-4.24-4.24m-4.24-4.24l-4.24-4.24"></path>
            </svg>
          </button>
          
          <div 
            className={styles.authContainer}
            onMouseEnter={handleAccountHover}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <button 
              className={`${styles.authBtn} ${user ? styles.loggedIn : ''}`}
              onClick={handleAccountClick}
              title={user ? "Go to Dashboard" : "Sign In"}
            >
              {user ? (
                 (user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))) ? (
                  <img src={user.avatar} alt={user.name} className={styles.avatar} />
                ) : (
                  renderAvatar(getAvatarPreset(user.avatar), user.name, 32, styles.avatar)
                )
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </button>

            {user && showUserMenu && (
              <div className={`${styles.userMenu} ${styles.visible}`}>
                <div className={styles.menuHeader}>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                  {isAdmin && <span className={styles.adminBadge}>Admin</span>}
                </div>
                <Link href="/dashboard" className={styles.menuItem} onClick={() => setShowUserMenu(false)}>
                  <User size={16} /> Profile
                </Link>
                {user.role === 'teacher' && (
                    <Link href="/teacher/dashboard" className={`${styles.menuItem}`} style={{color: '#d4af37'}} onClick={() => setShowUserMenu(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Teacher Dash
                    </Link>
                )}
                {isAdmin && (
                  <Link href="/admin" className={`${styles.menuItem} ${styles.adminItem}`} onClick={() => setShowUserMenu(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Admin Dashboard
                  </Link>
                )}
                <button className={styles.menuItem} onClick={() => { setActiveSection('settings'); setShowUserMenu(false); }}>
                  <Settings size={16} /> Settings
                </button>
                <button 
                  className={`${styles.menuItem} ${styles.logoutBtn}`}
                  onClick={() => { logout(); setShowUserMenu(false); }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.primaryFooter}>
          {isAdmin && (
            <Link 
              href="/admin"
              className={`${styles.primaryNavItem} ${styles.adminBtn}`}
              title="Admin Dashboard"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </Link>
          )}
          <Link 
            href="/test"
            className={`${styles.primaryNavItem} ${styles.testModeBtn}`}
            title="Test Mode"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </Link>


        </div>
      </div>

      <div ref={secondarySidebarRef} className={`${styles.secondarySidebar} ${activeSection ? styles.open : ''}`}>
        {activeSection && (
          <div className={styles.secondaryContent}>
            {activeSection === 'search' && (
              <>
                <div className={styles.secondaryHeader}>
                  <h2>Search Quran</h2>
                  <p>Find verses in Arabic & English</p>
                </div>

                <div className={styles.searchBox}>
                  <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search verses in Arabic or English..."
                    value={advancedSearchQuery}
                    onChange={(e) => setAdvancedSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {advancedSearchQuery && (
                    <button 
                      className={styles.clearBtn}
                      onClick={() => setAdvancedSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>

                <div className={styles.searchPanelContent}>
                  {isSearching ? (
                    <div className={styles.searchResultsPlaceholder}>
                      <div className={styles.loadingSpinner}></div>
                      <p>Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className={styles.searchResultsList}>
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.key}-${index}`}
                          className={styles.searchResultItem}
                          onClick={() => {
                            onSurahSelect(result.surahNum);
                            setTimeout(() => {
                              const verseElement = document.getElementById(`verse-${result.surahNum}-${result.verseNum}`);
                              if (verseElement) verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 500);
                            if (window.innerWidth < 768) setActiveSection(null);
                          }}
                        >
                          <div className={styles.searchResultRef}>
                            {surahs[result.surahNum - 1]?.transliteration} {result.key}
                          </div>
                          <p className={`${styles.searchResultText} ${styles.searchResultArabic} arabic-text`}>
                            {result.arabicText}
                          </p>
                          {result.englishText && (
                            <p className={styles.searchResultText}>{result.englishText}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : advancedSearchQuery.length >= 2 ? (
                    <div className={styles.searchResultsPlaceholder}>
                      <p>No results found</p>
                    </div>
                  ) : (
                    <div className={styles.searchResultsPlaceholder}>
                      <p>Type at least 2 characters to search</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'surahs' && (
              <>
                <div className={styles.secondaryHeader}>
                  <h2>Surahs</h2>
                  <p>114 Chapters</p>
                </div>
                 <div className={styles.searchBox}>
                  <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search Surahs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button 
                      className={styles.clearBtn}
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>

                <div className={styles.surahList}>
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      className={`${styles.surahItem} ${currentSurah === surah.number ? styles.active : ''}`}
                      onClick={() => onSurahSelect(surah.number)}
                    >
                      <div className={styles.surahNumber}>
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                          <path d="M18 3L23 13L34 13L25 20L29 31L18 24L7 31L11 20L2 13L13 13L18 3Z" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="1"/>
                          <text x="18" y="22" textAnchor="middle" fontSize="12" fontWeight="600" fill="currentColor">
                            {surah.number}
                          </text>
                        </svg>
                      </div>
                      
                      <div className={styles.surahInfo}>
                        <div className={styles.surahNames}>
                          <span className={`${styles.surahNameArabic} arabic-heading`}>{surah.name}</span>
                          <span className={styles.surahNameEn}>{surah.transliteration}</span>
                        </div>
                        <div className={styles.surahMeta}>
                          <span className={styles.verses}>{surah.totalVerses} verses</span>
                          <span className={styles.dot}>•</span>
                          <span className={styles.type}>{surah.revelationType}</span>
                        </div>
                      </div>

                      {currentSurah === surah.number && (
                        <div className={styles.activeIndicator}>
                          <svg width="6" height="6" viewBox="0 0 6 6">
                            <circle cx="3" cy="3" r="3" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}

                  {filteredSurahs.length === 0 && (
                    <div className={styles.noResults}>
                      <p>No surahs found</p>
                      <p className={styles.noResultsHint}>Try a different search term</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === 'bookmarks' && (
              <>
                <div className={styles.secondaryHeader}>
                  <h2>Bookmarks</h2>
                  <p>{bookmarkedVerses.size} Saved</p>
                </div>

                {bookmarkedVerses && bookmarkedVerses.size > 0 ? (
                  <div className={styles.bookmarksList}>
                    {Array.from(bookmarkedVerses).map(id => {
                      const [surahNum, verseNum] = id.split('-').map(Number);
                      const verse = getVerse(surahNum, verseNum);
                      const surah = surahs.find(s => s.number === surahNum);
                      
                      if (!verse || !surah) return null;

                      return (
                        <div key={id} className={styles.bookmarkWrapper}>
                          <button 
                            className={styles.bookmarkItem}
                            onClick={() => onSurahSelect(surahNum)}
                          >
                            <div className={styles.bookmarkHeader}>
                              <span className={styles.bookmarkRef}>
                                {surah.transliteration} {surahNum}:{verseNum}
                              </span>
                            </div>
                            <p className={`arabic-text ${styles.bookmarkText}`}>
                              {verse.text}
                            </p>
                          </button>
                          <button 
                            className={styles.deleteBookmarkBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark?.(id);
                            }}
                            aria-label="Remove bookmark"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <h3>No Bookmarks Yet</h3>
                    <p>Bookmark verses while reading to save them here</p>
                  </div>
                )}
              </>
            )}

            {activeSection === 'progress' && (
              <>
                <div className={styles.secondaryHeader}>
                  <h2>Progress</h2>
                  <p>Track Your Journey</p>
                </div>
                <div className={styles.emptyState}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  <h3>Track Your Progress</h3>
                  <p>Your reading progress will appear here</p>
                </div>
              </>
            )}

            {activeSection === 'settings' && (
              <>
                <div className={styles.secondaryHeader}>
                  <h2>Settings</h2>
                  <p>Customize Your Experience</p>
                </div>
                
                <div className={styles.settingsPanel}>
                  <div className={styles.settingGroup}>
                    <label>Theme</label>
                    <select className={styles.settingSelect}>
                      <option value="auto">Auto</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div className={styles.settingGroup}>
                    <label>Font Size</label>
                    <select className={styles.settingSelect}>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className={styles.settingGroup}>
                     <label className={styles.checkboxLabel}>
                      <input type="checkbox" defaultChecked />
                      <span>Show Transliteration</span>
                    </label>
                  </div>

                  <div className={styles.settingGroup}>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" defaultChecked />
                      <span>Show Translation</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}