'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useUserData } from '@/app/context/user-data-context';

export default function ThemeToggle() {
  const { settings, updateSettings } = useUserData();
  const theme = settings.theme;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer group hover:border-[#d4af37]/50 transition-all overflow-hidden"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className="w-6 h-6 text-[#d4af37]" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -180 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -40, opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className="w-6 h-6 text-[#d4af37]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}
