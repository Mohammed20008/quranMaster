'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/auth-context';
import { useMessages } from '@/app/context/messages-context';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Message as AppMessage } from '@/types/message';
import MessageBubble from './message-bubble';
import styles from './ai-chat-modal.module.css';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const { user } = useAuth();
  const { currentConversation, createConversation, addMessage, markAsWaitingForAdmin } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [input, setInput] = useState('');

  // Keep Ref in sync with context
  useEffect(() => {
    if (currentConversation?.id) {
      conversationIdRef.current = currentConversation.id;
    }
  }, [currentConversation?.id]);
  
  const { 
    messages, 
    sendMessage,
    status,
    regenerate,
    error
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
    }),
 
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Ensure conversation exists when modal opens
  useEffect(() => {
    if (isOpen && !currentConversation) {
      createConversation();
    }
  }, [isOpen, currentConversation, createConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const onSendMessage = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !conversationIdRef.current || isLoading) {
      return;
    }

    const messageText = input.trim();
    
    // Save to context/persistence
    addMessage({
      conversationId: conversationIdRef.current,
      sender: 'user',
      content: messageText,
    });

    // Send to AI
    sendMessage({ text: messageText });
    
    // Clear input
    setInput('');
  }, [input, addMessage, sendMessage, isLoading]);

  const handleTalkToAdmin = useCallback(async () => {
    if (!conversationIdRef.current || !user) return;

    const requestMessage = `User ${user.name} (${user.email}) has requested to talk to admin.`;
    
    addMessage({
      conversationId: conversationIdRef.current,
      sender: 'ai',
      content: 'I\'ve notified the admin. They will respond to you here shortly. You can also reach them directly via WhatsApp.',
    });

    markAsWaitingForAdmin(conversationIdRef.current);

    try {
      await fetch('/api/ai/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name,
          userEmail: user.email,
          message: messages.slice(-3).map(m => {
            const content = m.parts
              .filter(p => p.type === 'text')
              .map(p => (p as any).text)
              .join('');
            return `${m.role}: ${content}`;
          }).join('\n') || requestMessage,
        }),
      });
    } catch (error) {
      console.error('Admin notification error:', error);
    }
  }, [user, messages, addMessage, markAsWaitingForAdmin]);

  const setSuggestion = useCallback((text: string) => {
    setInput(text);
  }, []);

  // Convert UIMessages for display using AppMessage interface
  const displayMessages: AppMessage[] = messages.map(m => {
    const content = m.parts
      .filter(p => p.type === 'text')
      .map(p => (p as any).text)
      .join('');

    return {
      id: m.id,
      conversationId: conversationIdRef.current || '',
      sender: m.role === 'user' ? 'user' : 'ai',
      content: content,
      timestamp: m.createdAt instanceof Date ? m.createdAt.toISOString() : new Date().toISOString(),
      isRead: true
    };
  });

  // Interweave admin messages from history
  if (currentConversation) {
    const adminMessages = currentConversation.messages.filter(m => m.sender === 'admin');
    adminMessages.forEach(am => {
      if (!displayMessages.some(dm => dm.id === am.id)) {
        displayMessages.push(am);
      }
    });
    displayMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            key="ai-chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />

          <motion.div
            key="ai-chat-modal"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={styles.modal}
          >
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.aiIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h3>AI Assistant</h3>
                  <p>Ask anything about Quran & Hadith</p>
                </div>
              </div>
              <button onClick={onClose} className={styles.closeBtn} type="button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className={styles.messages}>
              {displayMessages.length === 0 && (
                <div className={styles.welcomeMessage}>
                  <div className={styles.welcomeIcon}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </div>
                  <h4>Welcome to QuranMaster AI</h4>
                  <p>Ask me anything about the Quran, Hadith, or Islamic teachings. I'm here to help!</p>
                  <div className={styles.suggestions}>
                    <button type="button" onClick={() => setSuggestion('What is the meaning of Surah Al-Fatiha?')}>
                      Surah Al-Fatiha meaning
                    </button>
                    <button type="button" onClick={() => setSuggestion('Tell me about the importance of Salah')}>
                      Importance of Salah
                    </button>
                    <button type="button" onClick={() => setSuggestion('What are the pillars of Islam?')}>
                      Pillars of Islam
                    </button>
                  </div>
                </div>
              )}

              {displayMessages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className={styles.typingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              )}

              {error && (
                <div className={styles.errorContainer}>
                  <p>An error occurred. Please try again.</p>
                  <button onClick={() => regenerate()} className={styles.retryBtn}>Retry</button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={onSendMessage} className={styles.inputArea}>
              <button type="button" onClick={handleTalkToAdmin} className={styles.adminBtn} title="Talk to Admin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className={styles.input}
                disabled={isLoading}
              />

              <button 
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
