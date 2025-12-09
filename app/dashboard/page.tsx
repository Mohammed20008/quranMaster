'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useUserData } from '@/app/hooks/use-user-data';
import { surahs } from '@/data/surah-data';
import styles from './dashboard.module.css';
import Link from 'next/link';

// Decorative Pattern
const GeometricPattern = () => (
    <div className={styles.patternBg}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="islamic-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M0 40 L40 0 L80 40 L40 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.5"/>
                    <rect x="38" y="38" width="4" height="4" transform="rotate(45 40 40)" fill="currentColor"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
        <div className={styles.patternOverlay}></div>
    </div>
);

// Daily Quote Component
const DailyQuote = () => {
    const quotes = [
        { text: "The best of you are those who learn the Quran and teach it.", source: "Sahih Al-Bukhari" },
        { text: "Read the Quran, for it will come as an intercessor for its reciters on the Day of Resurrection.", source: "Sahih Muslim" },
        { text: "Verily, in the remembrance of Allah do hearts find rest.", source: "Quran 13:28" },
        { text: "Call upon Me; I will respond to you.", source: "Quran 40:60" },
        { text: "Allah does not burden a soul beyond that it can bear.", source: "Quran 2:286" }
    ];
    const [quote, setQuote] = useState(quotes[0]);

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    return (
        <div className={styles.quoteCard}>
            <div className={styles.quoteDecor}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-2 0v-1a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1z"/>
                </svg>
            </div>
            <div>
                <div className={styles.quoteLabel}>
                    <span className={styles.quoteLabelLine}/>
                    Daily Wisdom
                </div>
                <p className={styles.quoteText}>"{quote.text}"</p>
            </div>
            <p className={styles.quoteSource}>— {quote.source}</p>
        </div>
    );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { bookmarks, lastRead, stats, settings, updateSettings, isLoading: dataLoading } = useUserData();

  useEffect(() => {
    if (status === 'unauthenticated') {
       router.push('/');
    }
  }, [status, router]);

  if (status === 'loading' || dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!session) return null;

  const lastReadSurah = lastRead ? surahs.find(s => s.number === lastRead.surah) : null;
  const bookmarkList = Array.from(bookmarks).map(id => {
      const [surahNum, verseNum] = id.split('-');
      const surah = surahs.find(s => s.number === parseInt(surahNum));
      return {
          id,
          surahNum,
          verseNum,
          surahName: surah?.name || `Surah ${surahNum}`,
          englishName: surah?.transliteration || ''
      };
  });
  
  const recommendedSurahs = [
      { number: 36, name: 'Ya-Sin', arabic: 'يس' },
      { number: 67, name: 'Al-Mulk', arabic: 'الملك' },
      { number: 18, name: 'Al-Kahf', arabic: 'الكهف' },
      { number: 56, name: "Al-Waqi'ah", arabic: 'الواقعة' },
  ];

  const handleSignOut = () => {
      signOut({ callbackUrl: '/' });
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
  };

  const statCards = [
    { label: 'Current Streak', value: stats.streak, unit: 'Days', icon: '🔥', color: 'linear-gradient(135deg, #f97316, #dc2626)' },
    { label: 'Verses Read', value: stats.versesRead, unit: 'Ayat', icon: '📖', color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
    { label: 'Completion', value: `${(stats.versesRead / 6236 * 100).toFixed(1)}`, unit: '%', icon: '💎', color: 'linear-gradient(135deg, #10b981, #22c55e)' },
    { label: 'Bookmarks', value: bookmarks.size, unit: 'Saved', icon: '🔖', color: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  ];

  const achievements = [
    { icon: '🌟', name: 'First Steps', desc: 'Read your first verse', unlocked: stats.versesRead > 0 },
    { icon: '🔥', name: 'Consistency', desc: '7 day reading streak', unlocked: stats.streak >= 7 },
    { icon: '📚', name: 'Bookworm', desc: 'Read 100 verses', unlocked: stats.versesRead >= 100 },
    { icon: '💫', name: 'Dedicated', desc: '30 day reading streak', unlocked: stats.streak >= 30 },
    { icon: '🏆', name: 'Champion', desc: 'Complete a Juz', unlocked: stats.versesRead >= 200 },
    { icon: '🎯', name: 'Collector', desc: 'Save 10 bookmarks', unlocked: bookmarks.size >= 10 },
    { icon: '💎', name: 'Scholar', desc: 'Read 1000 verses', unlocked: stats.versesRead >= 1000 },
    { icon: '👑', name: 'Hafiz Journey', desc: 'Complete 10% Quran', unlocked: stats.versesRead >= 624 },
  ];

  return (
    <div className={styles.container}>
      <GeometricPattern />
      
      {/* Top Navigation */}
      <nav className={styles.topNav}>
        <div className={styles.navContent}>
          <button onClick={() => router.push('/')} className={styles.navBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Read Quran</span>
          </button>
          <button onClick={handleSignOut} className={`${styles.navBtn} ${styles.signOutBtn}`}>
            <span>Sign Out</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </nav>
      
      <main className={styles.main}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.welcomeContent}
          >
            <div className={styles.userHeader}>
              <div className={styles.avatarContainer}>
                {session.user?.image ? (
                  <Image src={session.user.image} alt="User" fill className="object-cover" />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {session.user?.name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <div className={styles.greetingBadge}>{getGreeting()}</div>
                <h1 className={styles.userName}>{session.user?.name?.split(' ')[0]}</h1>
                <p className={styles.welcomeMessage}>
                  Your reading streak is on fire! 🔥 Continue your spiritual journey today.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DailyQuote />
          </motion.div>
        </section>

        {/* Stats Grid */}
        <section className={styles.statsGrid}>
          {statCards.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={styles.statCard}
            >
              <div className={styles.statCardBg} style={{ background: stat.color }} />
              <div className={styles.statIcon} style={{ background: stat.color, color: 'white' }}>
                {stat.icon}
              </div>
              <div>
                <div>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statUnit}>{stat.unit}</span>
                </div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Weekly Activity */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={styles.activitySection}
        >
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.titleAccent}/>
              This Week's Activity
            </h2>
            <span className={styles.sectionSubtitle}>Last 7 days</span>
          </div>
          <div className={styles.activityChart}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const today = new Date().getDay();
              const isToday = i === (today === 0 ? 6 : today - 1);
              const heights = [40, 65, 30, 80, 95, 55, 70];
              const hasActivity = heights[i] > 20;
              
              return (
                <div key={day} className={styles.activityBar}>
                  <div className={styles.barContainer}>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heights[i]}%` }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                      className={`${styles.bar} ${
                        isToday ? styles.barToday : hasActivity ? styles.barActive : styles.barInactive
                      }`}
                    />
                    {isToday && <div className={styles.todayIndicator} />}
                  </div>
                  <span className={`${styles.dayLabel} ${isToday ? styles.dayLabelToday : ''}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Main Grid Layout */}
        <div className={styles.dashboardGrid}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Continue Reading */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.titleAccent}/>
                  Resume Reading
                </h2>
              </div>

              {lastRead ? (
                <div className={styles.continueCard} onClick={() => router.push(`/?surah=${lastRead.surah}`)}>
                  <div className={styles.continueCardInner}>
                    <div className={styles.continueDecor}>{lastReadSurah?.name}</div>
                    
                    <div className={styles.continueContent}>
                      <div>
                        <div className={styles.revelationBadge}>
                          <span className={`${styles.badgeDot} ${lastReadSurah?.revelationType === 'Meccan' ? styles.badgeDotMeccan : styles.badgeDotMadinan}`}/>
                          {lastReadSurah?.revelationType} Revelation
                        </div>
                        <h3 className={styles.surahName}>{lastReadSurah?.transliteration}</h3>
                        <p className={styles.ayahText}>Ayah {lastRead.verse}</p>
                      </div>
                      
                      <button className={styles.continueBtn}>
                        <span>Continue</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressHeader}>
                        <span>Progress</span>
                        <span>{Math.round((lastRead.verse / (lastReadSurah?.totalVerses || 1)) * 100)}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(lastRead.verse / (lastReadSurah?.totalVerses || 1)) * 100}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={styles.progressFill}
                        >
                          <div className={styles.progressShimmer}/>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  <h3 className={styles.emptyTitle}>Start Your Journey</h3>
                  <p className={styles.emptyText}>Click below to open the Holy Quran and begin your first recitation.</p>
                  <button onClick={() => router.push('/')} className={styles.emptyBtn}>
                    Open Reader
                  </button>
                </div>
              )}
            </motion.div>

            {/* Essential Surahs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Essential Surahs</h2>
                <span className={styles.sectionSubtitle}>View All</span>
              </div>
              
              <div className={styles.essentialsGrid}>
                {recommendedSurahs.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => router.push(`/?surah=${s.number}`)}
                    className={styles.surahCard}
                  >
                    <div className={styles.surahCardDecor}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                    <div className={styles.surahArabic}>{s.arabic}</div>
                    <div className={styles.surahEnglish}>{s.name}</div>
                    <div className={styles.surahNumber}>Surah {s.number}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.titleAccent}/>
                  Achievements
                </h2>
              </div>
              
              <div className={styles.achievementsGrid}>
                {achievements.map((achievement, i) => (
                  <div 
                    key={i} 
                    className={`${styles.achievementCard} ${achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked}`}
                  >
                    <div className={`${styles.achievementIcon} ${!achievement.unlocked ? styles.achievementIconLocked : ''}`}>
                      {achievement.icon}
                    </div>
                    <div className={styles.achievementName}>{achievement.name}</div>
                    <div className={styles.achievementDesc}>{achievement.desc}</div>
                    {achievement.unlocked && (
                      <div className={styles.achievementCheck}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="white" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Resources / Quick Links */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
              className={styles.resourcesCard}
              style={{ marginBottom: '1.5rem', background: 'var(--card-bg)', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid var(--border)' }}
            >
              <h2 className={styles.settingsTitle} style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Resources</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Link href="/sunnah" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '1rem', background: 'var(--secondary)', borderRadius: '1rem',
                  textDecoration: 'none', color: 'var(--text)', transition: 'transform 0.2s'
                }} className="hover:scale-105">
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🕌</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Sunnah</span>
                </Link>
                <Link href="/learn" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '1rem', background: 'var(--secondary)', borderRadius: '1rem',
                  textDecoration: 'none', color: 'var(--text)', transition: 'transform 0.2s'
                }} className="hover:scale-105">
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎓</div>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Learn</span>
                </Link>
              </div>
            </motion.div>

            {/* Quick Settings */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className={styles.settingsCard}
            >
              <h2 className={styles.settingsTitle}>Quick Settings</h2>
              <div className={styles.settingsList}>
                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                      </svg>
                    </div>
                    <span className={styles.settingLabel}>Dark Mode</span>
                  </div>
                  <button 
                    onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                    className={`${styles.toggle} ${settings.theme === 'dark' ? styles.toggleOn : styles.toggleOff}`}
                  >
                    <div className={`${styles.toggleThumb} ${settings.theme === 'dark' ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
                  </button>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <span className={styles.settingLabel}>Translation</span>
                  </div>
                  <button 
                    onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
                    className={`${styles.toggle} ${settings.showTranslation ? styles.toggleOn : styles.toggleOff}`}
                  >
                    <div className={`${styles.toggleThumb} ${settings.showTranslation ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
                  </button>
                </div>

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="4 7 4 4 20 4 20 7"/>
                        <line x1="9" y1="20" x2="15" y2="20"/>
                        <line x1="12" y1="4" x2="12" y2="20"/>
                      </svg>
                    </div>
                    <span className={styles.settingLabel}>Arabic Only</span>
                  </div>
                  <button 
                    onClick={() => updateSettings({ showTransliteration: !settings.showTransliteration })}
                    className={`${styles.toggle} ${!settings.showTransliteration ? styles.toggleOn : styles.toggleOff}`}
                  >
                    <div className={`${styles.toggleThumb} ${!settings.showTransliteration ? styles.toggleThumbOn : styles.toggleThumbOff}`} />
                  </button>
                </div>

                <div className={styles.settingsDivider} />

                <div>
                  <div className={styles.rangeHeader}>
                    <span className={styles.rangeLabel}>Text Size</span>
                    <span className={styles.rangeValue}>{settings.fontSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="60" 
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            </motion.div>

            {/* Bookmarks */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className={styles.bookmarksCard}
            >
              <div className={styles.bookmarksHeader}>
                <h2 className={styles.bookmarksTitle}>Bookmarks</h2>
                <span className={styles.bookmarksCount}>{bookmarkList.length}</span>
              </div>
              
              <div className={styles.bookmarksList}>
                {bookmarkList.length > 0 ? (
                  bookmarkList.map((bookmark, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={styles.bookmarkItem}
                      onClick={() => router.push(`/?surah=${bookmark.surahNum}`)}
                    >
                      <div className={styles.bookmarkNumber}>
                        {bookmark.verseNum}
                      </div>
                      <div className={styles.bookmarkInfo}>
                        <div className={styles.bookmarkSurah}>{bookmark.englishName}</div>
                        <div className={styles.bookmarkArabic}>{bookmark.surahName}</div>
                      </div>
                      <div className={styles.bookmarkArrow}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={styles.bookmarksEmpty}>
                    <div className={styles.bookmarksEmptyIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <p className={styles.bookmarksEmptyTitle}>No bookmarks saved yet</p>
                    <p className={styles.bookmarksEmptyText}>Verses you bookmark will appear here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
