'use client';

import { useAuth } from '@/app/context/auth-context';
import { useMessages } from '@/app/context/messages-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MessageBubble from '@/app/components/ai/message-bubble';
import styles from '../../admin.module.css';

export default function MessageThreadPage({ params }: { params: { conversationId: string } }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { getConversation, addAdminReply, markAsResponded, closeConversation } = useMessages();
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = getConversation(params.conversationId);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated || !isAdmin) {
        router.push('/');
      }
    }
  }, [isLoadingAuth, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  if (!conversation) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/admin/messages" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <h1>Conversation Not Found</h1>
          </div>
        </header>
      </div>
    );
  }

  const handleSendReply = async () => {
    if (!reply.trim() || isSending) return;

    setIsSending(true);
    const replyText = reply.trim();
    setReply('');

    try {
      addAdminReply(params.conversationId, replyText);
      markAsResponded(params.conversationId);
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to close this conversation?')) {
      closeConversation(params.conversationId);
      router.push('/admin/messages');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/admin/messages" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </Link>
            <div>
              <h1>Conversation with {conversation.userName}</h1>
              <p>{conversation.userEmail}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                background: conversation.status === 'waiting-for-admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                color: conversation.status === 'waiting-for-admin' ? '#ef4444' : '#22c55e',
              }}
            >
              {conversation.status === 'waiting-for-admin' ? 'Pending' : conversation.status === 'admin-replied' ? 'Responded' : conversation.status}
            </span>
            <button
              onClick={handleClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Close Conversation
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main} style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--background)',
            borderRadius: '1rem',
            padding: '2rem',
            minHeight: '500px',
            maxHeight: '600px',
            overflowY: 'auto',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
          }}
        >
          {conversation.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            background: 'var(--surface)',
            borderRadius: '1rem',
            border: '1px solid var(--border)',
          }}
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your response..."
            rows={3}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: '0.95rem',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleSendReply}
            disabled={!reply.trim() || isSending}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              cursor: reply.trim() && !isSending ? 'pointer' : 'not-allowed',
              opacity: reply.trim() && !isSending ? 1 : 0.5,
              transition: 'all 0.2s',
              alignSelf: 'flex-end',
            }}
          >
            {isSending ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </main>
    </div>
  );
}
