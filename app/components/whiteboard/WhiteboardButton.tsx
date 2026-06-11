'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import WhiteboardModal from './WhiteboardModal';

export default function WhiteboardButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl flex items-center justify-center cursor-pointer group hover:border-[#d4af37]/50 transition-all overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Open Writing Practice Board"
      >
        <span className="text-2xl select-none" style={{ marginTop: '-2px' }}>🖋️</span>
        
        {/* Hover Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>

      <WhiteboardModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
