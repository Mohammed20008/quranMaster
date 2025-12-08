'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useUserData } from '@/app/hooks/use-user-data';
import { surahs } from '@/data/surah-data';

// Decorative Patterns
const GeometricPattern = () => (
    <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none overflow-hidden select-none">
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/50 to-[var(--background)]"></div>
    </div>
);

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
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-2xl shadow-[var(--primary)]/20 overflow-hidden group h-full flex flex-col justify-between">
             <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                 <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M10 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-2 0v-1a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1zM20 11h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-2 0v-1a4 4 0 0 1 4-4h1a4 4 0 0 1 4 4v1a2 2 0 0 0 2 2h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1z"/></svg>
             </div>
             <div>
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4 flex items-center gap-2">
                    <span className="w-8 h-0.5 bg-white/50 rounded-full"/> Daily Wisdom
                </h3>
                <p className="text-2xl font-serif font-medium leading-relaxed italic opacity-95 mb-6 text-shadow-sm">"{quote.text}"</p>
             </div>
             <p className="text-sm opacity-75 font-mono tracking-wider text-right border-t border-white/20 pt-4">— {quote.source}</p>
        </div>
    );
}

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="spinner-large" />
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
      { number: 56, name: 'Al-Waqi\'ah', arabic: 'الواقعة' },
  ];

  const handleSignOut = () => {
      signOut({ callbackUrl: '/' });
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good, Morning";
      if (hour < 18) return "Good, Afternoon";
      return "Good, Evening";
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white pb-20 relative">
      <GeometricPattern />
      
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-8 py-6 pointer-events-none">
          <div className="max-w-7xl mx-auto flex justify-end gap-4 pointer-events-auto">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-[var(--primary)] hover:text-white transition-all shadow-lg hover:shadow-[var(--primary)]/30 group backdrop-blur-md"
              >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  <span className="font-medium text-sm">Read Quran</span>
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-lg hover:shadow-red-500/30 group font-medium text-sm backdrop-blur-md text-red-500 border-red-200"
              >
                  <span className="group-hover:text-white">Sign Out</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
          </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 relative z-10">
         
         {/* Welcome Section */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="lg:col-span-2 flex flex-col justify-center"
             >
                <div className="flex items-start gap-8 mb-6">
                    <div className="relative w-28 h-28 shrink-0 rounded-3xl overflow-hidden border-4 border-[var(--background)] ring-2 ring-[var(--primary)] shadow-2xl">
                    {session.user?.image ? (
                        <Image src={session.user.image} alt="User" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[var(--card-bg)] flex items-center justify-center text-5xl font-bold text-[var(--primary)]">
                        {session.user?.name?.[0]}
                        </div>
                    )}
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase tracking-wider mb-2">
                            {getGreeting()}
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gradient mb-3 leading-tight">
                            {session.user?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-[var(--foreground-secondary)] text-xl font-medium leading-relaxed max-w-lg">
                            Your reading streak is on fire! <span className="inline-block animate-bounce">🔥</span> Continue your spiritual journey today.
                        </p>
                    </div>
                </div>
             </motion.div>
             
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="h-full"
             >
                 <DailyQuote />
             </motion.div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {[
              { label: 'Current Streak', value: stats.streak, unit: 'Days', icon: '🔥', color: 'from-orange-500 to-red-600', shadow: 'shadow-orange-500/20' },
              { label: 'Verses Read', value: stats.versesRead, unit: 'Ayat', icon: '📖', color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/20' },
              { label: 'Completion', value: `${(stats.versesRead / 6236 * 100).toFixed(1)}`, unit: '%', icon: '💎', color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`glass p-8 rounded-[2rem] border border-[var(--border-light)] hover:border-[var(--primary)] transition-all duration-300 relative overflow-hidden group shadow-xl ${stat.shadow}`}
              >
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full bg-gradient-to-br ${stat.color} opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl`} />
                
                <div className="flex justify-between items-start mb-6 relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center text-3xl shadow-lg ring-4 ring-[var(--background)]`}>
                        {stat.icon}
                    </div>
                </div>
                
                <div className="relative">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-bold tracking-tight text-[var(--foreground)]">{stat.value}</span>
                        <span className="text-lg font-medium text-[var(--foreground-secondary)]">{stat.unit}</span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider opacity-80">{stat.label}</div>
                </div>
              </motion.div>
            ))}
         </div>

         {/* Main Dashboard Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
           
           {/* Left Column: Reading & Essentials (8 cols) */}
           <div className="lg:col-span-8 space-y-10">
             
             {/* Continue Reading Card */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
             >
                 <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="w-1 h-8 bg-[var(--primary)] rounded-full"/>
                        Resume Reading
                    </h2>
                 </div>

                 {lastRead ? (
                  <div 
                    className="group relative p-1 rounded-[2.5rem] bg-gradient-to-br from-[var(--border)] to-[var(--background)] shadow-2xl hover:shadow-[var(--primary)]/20 transition-all duration-500"
                    onClick={() => router.push(`/?surah=${lastRead.surah}`)}
                  >
                     <div className="absolute inset-0 rounded-[2.5rem] bg-[var(--primary)] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"/>
                     
                     <div className="relative bg-[var(--card-bg)] rounded-[2.3rem] padding-box h-full p-8 lg:p-10 border border-[var(--border)] overflow-hidden cursor-pointer">
                        {/* Background Arabic Calligraphy Decoration */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 text-[12rem] text-[var(--foreground)] opacity-[0.03] font-amiri pointer-events-none select-none whitespace-nowrap">
                            {lastReadSurah?.name}
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-semibold mb-3">
                                    <span className={`w-2 h-2 rounded-full ${lastReadSurah?.revelationType === 'Meccan' ? 'bg-amber-500' : 'bg-green-500'}`}/>
                                    {lastReadSurah?.revelationType} Revelation
                                </div>
                                <h3 className="text-4xl lg:text-5xl font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">{lastReadSurah?.transliteration}</h3>
                                <p className="text-xl text-[var(--foreground-secondary)]">Ayah {lastRead.verse}</p>
                            </div>
                            
                            <div className="text-right">
                                <button className="px-8 py-4 bg-[var(--foreground)] text-[var(--background)] font-bold rounded-2xl group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-lg flex items-center gap-3">
                                    <span>Continue</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>
                            </div>
                        </div>

                        <div className="mt-10">
                            <div className="flex justify-between text-sm font-semibold mb-3 text-[var(--foreground-secondary)]">
                                <span>Progress</span>
                                <span>{Math.round((lastRead.verse / (lastReadSurah?.totalVerses || 1)) * 100)}%</span>
                            </div>
                            <div className="h-3 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(lastRead.verse / (lastReadSurah?.totalVerses || 1)) * 100}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full relative" 
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"/>
                                </motion.div>
                            </div>
                        </div>
                     </div>
                  </div>
                 ) : (
                    <div className="p-16 text-center rounded-[2.5rem] bg-[var(--card-bg)] border-2 border-dashed border-[var(--border)]">
                        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-6 text-[var(--foreground-secondary)]">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/></svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Start Your Journey</h3>
                        <p className="text-[var(--foreground-secondary)] mb-8 max-w-md mx-auto">Click below to open the Holy Quran and begin your first recitation.</p>
                        <button 
                             onClick={() => router.push('/')}
                             className="px-10 py-4 bg-[var(--primary)] text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-[var(--primary)]/30"
                        >
                             Open Reader
                        </button>
                    </div>
                 )}
             </motion.div>
            
            {/* Essentials Grid */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6 }}
            >
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-bold">Essential Surahs</h2>
                    <span className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--primary)] cursor-pointer">View All</span>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {recommendedSurahs.map((s, i) => (
                        <div 
                           key={i} 
                           onClick={() => router.push(`/?surah=${s.number}`)}
                           className="group relative p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                            </div>
                            <div className="text-[var(--primary)] text-4xl font-amiri mb-4 group-hover:scale-110 transition-transform origin-left">{s.arabic}</div>
                            <div className="font-bold text-lg mb-1">{s.name}</div>
                            <div className="text-xs text-[var(--foreground-secondary)] uppercase tracking-wider font-semibold">Surah {s.number}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

           </div>

           {/* Right Column: Preferences & Bookmarks (4 cols) */}
           <div className="lg:col-span-4 space-y-8">
               
               {/* Quick Settings */}
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.6 }}
                 className="glass p-8 rounded-[2rem] border border-[var(--border)]"
               >
                   <h2 className="text-xl font-bold mb-6">Quick Settings</h2>
                   <div className="space-y-6">
                       <div className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                               <div className="p-2 rounded-lg bg-[var(--bg-secondary)] group-hover:text-[var(--primary)] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></div>
                               <span className="font-medium">Dark Mode</span>
                           </div>
                           <button 
                             onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                             className={`w-14 h-8 rounded-full transition-all relative ${settings.theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                           >
                               <div className={`w-6 h-6 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${settings.theme === 'dark' ? 'left-7' : 'left-1'}`} />
                           </button>
                       </div>
                       <div className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                               <div className="p-2 rounded-lg bg-[var(--bg-secondary)] group-hover:text-[var(--primary)] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                               <span className="font-medium">Translation</span>
                           </div>
                           <button 
                             onClick={() => updateSettings({ showTranslation: !settings.showTranslation })}
                             className={`w-14 h-8 rounded-full transition-all relative ${settings.showTranslation ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                           >
                               <div className={`w-6 h-6 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${settings.showTranslation ? 'left-7' : 'left-1'}`} />
                           </button>
                       </div>
                       <div className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                               <div className="p-2 rounded-lg bg-[var(--bg-secondary)] group-hover:text-[var(--primary)] transition-colors"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg></div>
                               <span className="font-medium">Arabic Text Only</span>
                           </div>
                           <button 
                             onClick={() => updateSettings({ showTransliteration: !settings.showTransliteration })}
                             className={`w-14 h-8 rounded-full transition-all relative ${!settings.showTransliteration ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
                           >
                               <div className={`w-6 h-6 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${!settings.showTransliteration ? 'left-7' : 'left-1'}`} />
                           </button>
                       </div>
                       
                       <div className="pt-6 border-t border-[var(--border)]">
                           <div className="flex justify-between items-center mb-4">
                               <span className="text-sm font-semibold text-[var(--foreground-secondary)]">Text Size</span>
                               <span className="text-xs font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded">{settings.fontSize}px</span>
                           </div>
                           <input 
                              type="range" 
                              min="20" 
                              max="60" 
                              value={settings.fontSize}
                              onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                              className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)] hover:accent-[var(--primary-dark)] transition-all"
                           />
                       </div>
                   </div>
               </motion.div>

               {/* Bookmarks */}
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.7 }}
                 className="glass p-8 rounded-[2rem] border border-[var(--border)] max-h-[600px] flex flex-col"
               >
                  <div className="flex items-center justify-between mb-8">
                      <h2 className="text-xl font-bold">Bookmarks</h2>
                      <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-xs font-bold text-[var(--foreground)]">{bookmarkList.length}</span>
                  </div>
                  
                  <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 -mr-2">
                     {bookmarkList.length > 0 ? (
                       bookmarkList.map((bookmark, i) => (
                       <motion.div 
                         key={i}
                         initial={{ opacity: 0, x: 10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.1 * i }}
                         className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition-all hover:shadow-md group"
                         onClick={() => router.push(`/?surah=${bookmark.surahNum}`)}
                       >
                          <div className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--primary)] font-bold group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                            {bookmark.verseNum}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-base truncate mb-1 text-[var(--foreground)]">{bookmark.englishName}</div>
                            <div className="text-xs text-[var(--foreground-secondary)] font-mono truncate">{bookmark.surahName}</div>
                          </div>
                          <div className="text-[var(--border)] group-hover:text-[var(--primary)] transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </div>
                       </motion.div>
                     ))
                     ) : (
                       <div className="text-center py-12 flex flex-col items-center justify-center h-full text-[var(--foreground-secondary)]">
                         <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-4 opacity-50">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                         </div>
                         <p className="font-medium">No bookmarks saved yet</p>
                         <p className="text-sm mt-1 opacity-70">Verses you bookmark will appear here</p>
                       </div>
                     )}
                  </div>
               </motion.div>
           </div>
         </div>
      </div>
    </div>
  );
}
