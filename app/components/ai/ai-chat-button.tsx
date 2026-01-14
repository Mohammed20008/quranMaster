'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMessages } from '@/app/context/messages-context';
import AIChatModal from './ai-chat-modal';
import styles from './ai-chat-button.module.css';

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { hasUnreadAdminMessages } = useMessages();

  return (
    <>
      <motion.button
        className={styles.chatButton}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {hasUnreadAdminMessages && (
            <motion.div
              className={styles.badge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </AnimatePresence>

        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </motion.button>

      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
