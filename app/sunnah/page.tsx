'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './sunnah.module.css';

// Mock Data for Sunnah
const collections = [
  { id: 'bukhari', name: 'Sahih Al-Bukhari', arabic: 'صحيح البخاري', count: 7563, description: 'The most authentic book after the Quran' },
  { id: 'muslim', name: 'Sahih Muslim', arabic: 'صحيح مسلم', count: 7563, description: 'One of the Kutub al-Sittah' },
  { id: 'nasai', name: 'Sunan an-Nasai', arabic: 'سنن النسائي', count: 5758, description: 'Collection of Hadith by Imam An-Nasai' },
  { id: 'abudawud', name: 'Sunan Abu Dawud', arabic: 'سنن أبي داود', count: 5274, description: 'Collection of Hadith by Imam Abu Dawud' },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi', arabic: 'جامع الترمذي', count: 3956, description: 'Collection of Hadith by Imam At-Tirmidhi' },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabic: 'سنن ابن ماجه', count: 4341, description: 'Collection of Hadith by Imam Ibn Majah' },
];

const sampleHadiths = [
  {
    id: 1,
    book: 'Sahih Al-Bukhari',
    chapter: 'Revelation',
    narrator: 'Umar bin Al-Khattab',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.",
    grade: 'Sahih'
  },
  {
    id: 2,
    book: 'Sahih Muslim',
    chapter: 'Faith',
    narrator: 'Abu Huraira',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    english: "He who believes in Allah and the Last Day must either speak good or remain silent.",
    grade: 'Sahih'
  }
];

export default function SunnahPage() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.arabic.includes(searchQuery)
  );

  return (
    <div className={`${styles.sunnahContainer} min-h-screen`}>
       {/* Header */}
       <header className={`${styles.header} border-b sticky top-0 z-20`}>
         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Link href="/" className={styles.linkHover}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M19 12H5M12 19l-7-7 7-7"/>
               </svg>
             </Link>
             <h1 className="text-xl font-bold">Sunnah & Hadith</h1>
           </div>
           <div className="relative">
             <input 
               type="text" 
               placeholder="Search collections..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className={`${styles.searchBar} pl-10 pr-4 py-2 rounded-lg outline-none w-64`}
             />
             <svg className={`absolute left-3 top-2.5 w-4 h-4 ${styles.searchIcon}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
             </svg>
           </div>
         </div>
       </header>

       <main className="max-w-7xl mx-auto px-4 py-8">
         {!selectedCollection ? (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${styles.collectionGrid}`}
           >
             {filteredCollections.map((collection, i) => (
               <motion.div
                 key={collection.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 onClick={() => setSelectedCollection(collection.id)}
                 className={`${styles.collectionCard} group p-6 rounded-2xl cursor-pointer transition-all hover:shadow-lg`}
               >
                 <div className="flex justify-between items-start mb-4">
                   <div className={`${styles.collectionIcon} w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                       <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                     </svg>
                   </div>
                   <span className={`${styles.collectionCount} text-xs font-mono px-2 py-1 rounded`}>
                     {collection.count.toLocaleString()}
                   </span>
                 </div>
                 <h2 className={`${styles.cardTitle} text-xl font-bold mb-1 group-hover:text-primary transition-colors`}>{collection.name}</h2>
                 <h3 className={`${styles.arabicText} text-lg font-arabic mb-3`}>{collection.arabic}</h3>
                 <p className={`${styles.descriptionText} text-sm line-clamp-2`}>{collection.description}</p>
               </motion.div>
             ))}
           </motion.div>
         ) : (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
           >
             <button 
               onClick={() => setSelectedCollection(null)}
               className={`${styles.backButton} mb-6 flex items-center gap-2 transition-colors`}
             >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M19 12H5M12 19l-7-7 7-7"/>
               </svg>
               Back to Collections
             </button>

             <div className={`${styles.selectedCollectionHeader} rounded-2xl p-8 mb-8 text-center`}>
               <h2 className="text-3xl font-bold mb-2">
                 {collections.find(c => c.id === selectedCollection)?.name}
               </h2>
               <p className={`${styles.descriptionText}`}>Selected Hadiths</p>
             </div>

             <div className="space-y-6">
               {sampleHadiths.map((hadith) => (
                 <div key={hadith.id} className={`${styles.hadithCard} rounded-xl p-6 hover:shadow-md transition-shadow`}>
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <span className={`${styles.hadithGrade} text-xs font-bold px-2 py-1 rounded-full`}>{hadith.grade}</span>
                       <span className={`ml-3 text-sm ${styles.narratorText}`}>Narrated by {hadith.narrator}</span>
                     </div>
                     <button className={`${styles.bookmarkButton} hover:text-white`}>
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                         <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                       </svg>
                     </button>
                   </div>
                   <p className="text-2xl font-arabic text-right mb-4 leading-loose" dir="rtl">{hadith.arabic}</p>
                   <p className="text-lg leading-relaxed">{hadith.english}</p>
                 </div>
               ))}
             </div>
           </motion.div>
         )}
       </main>
    </div>
  );
}
