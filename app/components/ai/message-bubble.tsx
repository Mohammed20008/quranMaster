'use client';

import { Message } from '@/types/message';
import { motion } from 'framer-motion';
import styles from './message-bubble.module.css';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isAdmin = message.sender === 'admin';
  const isAI = message.sender === 'ai';

  const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.messageWrapper} ${isUser ? styles.userMessage : styles.otherMessage}`}
    >
      <div className={`${styles.bubble} ${isUser ? styles.userBubble : isAdmin ? styles.adminBubble : styles.aiBubble}`}>
        {isAdmin && (
          <div className={styles.senderLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Admin
          </div>
        )}
        {isAI && (
          <div className={styles.senderLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            AI Assistant
          </div>
        )}
        <p className={styles.content}>{message.content}</p>
        <span className={styles.timestamp}>{formattedTime}</span>
      </div>
    </motion.div>
  );
}
