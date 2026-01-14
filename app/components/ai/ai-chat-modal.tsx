'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/auth-context';
import { useMessages } from '@/app/context/messages-context';
import MessageBubble from './message-bubble';
import styles from './ai-chat-modal.module.css';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const { user } = useAuth();
  const { currentConversation, createConversation, addMessage, markAsWaitingForAdmin } = useMessages();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create conversation when modal opens
  useEffect(() => {
    if (isOpen && !conversationId) {
      const id = createConversation();
      setConversationId(id);
    }
  }, [isOpen, conversationId, createConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({
      conversationId,
      sender: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      // Send to AI
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: currentConversation?.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })) || [],
        }),
      });

      const data = await response.json();

      // Check if the response contains a message (success or error)
      if (data.message) {
        // Add the message whether it's success or error - the message contains helpful info
        addMessage({
          conversationId,
          sender: 'ai',
          content: data.message,
        });
      } else if (data.error) {
        // Fallback for old-style error responses
        addMessage({
          conversationId,
          sender: 'ai',
          content: data.error,
        });
      } else {
        // Ultimate fallback
        addMessage({
          conversationId,
          sender: 'ai',
          content: 'Sorry, I encountered an error. Please try again or contact the admin.',
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        conversationId,
        sender: 'ai',
        content: 'Sorry, I encountered a network error. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTalkToAdmin = async () => {
    if (!conversationId || !user) return;

    const requestMessage = `User ${user.name} (${user.email}) has requested to talk to admin.`;
    
    // Add system message
    addMessage({
      conversationId,
      sender: 'ai',
      content: 'I\'ve notified the admin. They will respond to you here shortly. You can also reach them directly via WhatsApp.',
    });

    // Mark conversation as waiting for admin
    markAsWaitingForAdmin(conversationId);

    try {
      // Notify admin via WhatsApp
      const response = await fetch('/api/ai/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name,
          userEmail: user.email,
          message: currentConversation?.messages.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n') || requestMessage,
        }),
      });

      const data = await response.json();

      if (data.success && data.whatsappLink) {
        // Open WhatsApp in new tab
        window.open(data.whatsappLink, '_blank');
      }
    } catch (error) {
      console.error('Admin notification error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.backdrop}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={styles.modal}
          >
            {/* Header */}
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
              <button onClick={onClose} className={styles.closeBtn}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {currentConversation?.messages.length === 0 && (
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
                    <button onClick={() => setInput('What is the meaning of Surah Al-Fatiha?')}>
                      Surah Al-Fatiha meaning
                    </button>
                    <button onClick={() => setInput('Tell me about the importance of Salah')}>
                      Importance of Salah
                    </button>
                    <button onClick={() => setInput('What are the pillars of Islam?')}>
                      Pillars of Islam
                    </button>
                  </div>
                </div>
              )}

              {currentConversation?.messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className={styles.typingIndicator}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <button onClick={handleTalkToAdmin} className={styles.adminBtn} title="Talk to Admin">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className={styles.input}
                disabled={isLoading}
              />

              <button 
                onClick={handleSendMessage} 
                className={styles.sendBtn}
                disabled={!input.trim() || isLoading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
