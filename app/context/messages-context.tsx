'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message, SupportRequest } from '@/types/message';
import { useAuth } from './auth-context';

interface MessagesContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  createConversation: () => string;
  getConversation: (id: string) => Conversation | undefined;
  markAsWaitingForAdmin: (conversationId: string) => void;
  addAdminReply: (conversationId: string, content: string) => void;
  getSupportRequests: () => SupportRequest[];
  markAsResponded: (conversationId: string) => void;
  closeConversation: (conversationId: string) => void;
  hasUnreadAdminMessages: boolean;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [hasUnreadAdminMessages, setHasUnreadAdminMessages] = useState(false);

  // Load conversations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('quran_app_conversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
        
        // Check for unread admin messages
        const hasUnread = parsed.some((conv: Conversation) => 
          conv.messages.some((msg: Message) => msg.sender === 'admin' && !msg.isRead)
        );
        setHasUnreadAdminMessages(hasUnread);
      } catch (e) {
        console.error('Failed to parse conversations', e);
      }
    }
  }, []);

  // Save to localStorage when conversations change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('quran_app_conversations', JSON.stringify(conversations));
      
      // Update unread status
      const hasUnread = conversations.some(conv => 
        conv.messages.some(msg => msg.sender === 'admin' && !msg.isRead)
      );
      setHasUnreadAdminMessages(hasUnread);
    }
  }, [conversations]);

  const createConversation = (): string => {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newConversation: Conversation = {
      id: conversationId,
      userId: user?.email || 'anonymous',
      userEmail: user?.email || 'anonymous@example.com',
      userName: user?.name || 'Anonymous User',
      messages: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminNotified: false,
    };

    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation);
    return conversationId;
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const newMessage: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: messageData.sender === 'user', // User's own messages are always read
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === messageData.conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    }));

    // Update current conversation
    if (currentConversation?.id === messageData.conversationId) {
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage],
        updatedAt: new Date().toISOString(),
      } : null);
    }
  };

  const getConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      // Mark admin messages as read when viewing
      setConversations(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            messages: c.messages.map(msg => ({
              ...msg,
              isRead: true,
            })),
          };
        }
        return c;
      }));
    }
    return conv;
  };

  const markAsWaitingForAdmin = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          status: 'waiting-for-admin' as const,
          adminNotified: true,
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    }));
  };

  const addAdminReply = (conversationId: string, content: string) => {
    const adminMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      sender: 'admin',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, adminMessage],
          status: 'admin-replied' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    }));
  };

  const getSupportRequests = (): SupportRequest[] => {
    return conversations
      .filter(conv => conv.status === 'waiting-for-admin' || conv.status === 'admin-replied')
      .map(conv => {
        const lastUserMessage = [...conv.messages]
          .reverse()
          .find(msg => msg.sender === 'user');

        return {
          conversationId: conv.id,
          userEmail: conv.userEmail,
          userName: conv.userName,
          message: lastUserMessage?.content || 'No message',
          timestamp: conv.updatedAt,
          status: conv.status === 'waiting-for-admin' ? 'pending' : 'responded',
        };
      });
  };

  const markAsResponded = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          status: 'admin-replied' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    }));
  };

  const closeConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          status: 'closed' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return conv;
    }));
  };

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        currentConversation,
        addMessage,
        createConversation,
        getConversation,
        markAsWaitingForAdmin,
        addAdminReply,
        getSupportRequests,
        markAsResponded,
        closeConversation,
        hasUnreadAdminMessages,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
