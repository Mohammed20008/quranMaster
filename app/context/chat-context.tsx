'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { Message, Conversation } from '@/types/chat';

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  isLoading: boolean;
  isOpen: boolean;
  
  // Actions
  openChat: (otherUserEmail?: string) => void;
  closeChat: () => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  markAsRead: (conversationId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  setActiveConversationId: (id: string | null) => void;
  unreadTotal: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const lastProcessedTimeRef = React.useRef<number>(Date.now());

  // Helper to normalize email
  const normalize = (email: string) => email.toLowerCase();

  // Load initial data
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setMessages([]);
      return;
    }

    const userEmail = normalize(user.email);

    const loadData = () => {
      try {
        const storedMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
        const storedConversations = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
        
        // Filter for current user
        const userMessages = storedMessages.filter((m: Message) => 
          normalize(m.senderId) === userEmail || normalize(m.receiverId) === userEmail
        );
        
        const userConversations = storedConversations.filter((c: Conversation) => 
          c.participants.map(normalize).includes(userEmail)
        );

        setMessages(userMessages);
        setConversations(userConversations);

        // Auto-open logic
        const incomingMessages = userMessages.filter((m: Message) => normalize(m.receiverId) === userEmail);
        if (incomingMessages.length > 0) {
            // Find latest message
            const sorted = [...incomingMessages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const latest = sorted[0];
            const latestTime = new Date(latest.timestamp).getTime();
            
            // If latest message is newer than our reference AND it's not read (optional, but good UX)
            // Actually, if it's new, we show it.
            if (latestTime > lastProcessedTimeRef.current) {
                 lastProcessedTimeRef.current = latestTime;
                 setIsOpen(true);
                 
                 // Browser Notification
                 if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                    // Only notify if window is hidden or chat is closed? 
                    // But here we just opened it (setIsOpen(true)). 
                    // Let's notify anyway so user knows WHY it opened if looking away.
                    try {
                      new Notification('New Message', {
                         body: latest.content || 'You have a new message',
                      });
                    } catch(e) { console.error('Notification failed', e); }
                 }
                 
                 // Email/WhatsApp Simulation
                 console.group('🔔 Notification Service');
                 console.log(`%c[Email Sent] To: ${userEmail} | Subject: New Message from ${latest.senderId}`, 'color: #d4af37; font-weight: bold;');
                 console.log(`%c[WhatsApp Sent] To: Registered Number | Body: New message received!`, 'color: #25D366; font-weight: bold;');
                 console.groupEnd();
            }
        }
      } catch (error) {
        console.error('Error loading chat data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Poll for changes (simulating real-time)
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Request Notification Permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const openChat = (otherUserEmail?: string) => {
    if (!user) return;
    
    setIsOpen(true);
    const userEmail = normalize(user.email);

    if (!otherUserEmail) {
       setActiveConversationId(null);
       return;
    }
    
    const targetEmail = normalize(otherUserEmail);

    // Find existing conversation
    const existing = conversations.find(c => 
      c.participants.map(normalize).includes(targetEmail) && 
      c.participants.map(normalize).includes(userEmail)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      markAsRead(existing.id);
    } else {
      // Create new conversation
      const newConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        participants: [userEmail, targetEmail],
        lastMessage: {} as Message, // Placeholder
        unreadCounts: { [userEmail]: 0, [targetEmail]: 0 },
        updatedAt: new Date().toISOString(),
      };
      
      // Save new conversation
      const allConversations = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
      const updatedConversations = [newConv, ...allConversations];
      localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));
      
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveConversationId(null);
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!user || !activeConversationId) return;

    const userEmail = normalize(user.email);
    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;

    const receiverId = conversation.participants.find(p => normalize(p) !== userEmail);
    if (!receiverId) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: activeConversationId,
      senderId: userEmail,
      receiverId: receiverId, // Keep original case for receiver ID storage if wanted, but better normalize
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type,
    };

    // Update Messages
    const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    setMessages(prev => [...prev, newMessage]);

    // Update Conversation with Unread Count for Receiver
    const allConversations = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
    const updatedConversations = allConversations.map((c: Conversation) => {
      if (c.id === activeConversationId) {
        const newUnreadCounts = { ...(c.unreadCounts || {}) };
        // Ensure keys exist
        if (newUnreadCounts[receiverId] === undefined) newUnreadCounts[receiverId] = 0;
        newUnreadCounts[receiverId] = newUnreadCounts[receiverId] + 1;
        
        return {
          ...c,
          lastMessage: newMessage,
          unreadCounts: newUnreadCounts,
          updatedAt: newMessage.timestamp,
        };
      }
      return c;
    });
    localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));
    setConversations(updatedConversations.filter((c: Conversation) => 
      c.participants.map(normalize).includes(userEmail)
    ));
  };

  const markAsRead = (conversationId: string) => {
    if (!user) return;
    const userEmail = normalize(user.email);

    // Update Messages read status locally
    const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    const updatedMessages = allMessages.map((m: Message) => {
      if (m.conversationId === conversationId && normalize(m.receiverId) === userEmail && !m.read) {
        return { ...m, read: true };
      }
      return m;
    });
    localStorage.setItem('chat_messages', JSON.stringify(updatedMessages));
    
    // Update Conversation Unread Count
    const allConversations = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
    const updatedConversations = allConversations.map((c: Conversation) => {
      if (c.id === conversationId) {
          const newCounts = { ...(c.unreadCounts || {}) };
          // Check both normalized and direct key to be safe
          const key = Object.keys(newCounts).find(k => normalize(k) === userEmail) || userEmail;
          
          if ((newCounts[key] || 0) > 0) {
             newCounts[key] = 0;
             return { ...c, unreadCounts: newCounts };
          }
      }
      return c;
    });
    localStorage.setItem('chat_conversations', JSON.stringify(updatedConversations));

    // Optimistic update
    setMessages(prev => prev.map(m => {
      if (m.conversationId === conversationId && normalize(m.receiverId) === userEmail && !m.read) {
        return { ...m, read: true };
      }
      return m;
    }));
    
    setConversations(prev => prev.map(c => {
         if (c.id === conversationId) {
             const newCounts = { ...(c.unreadCounts || {}) };
             const key = Object.keys(newCounts).find(k => normalize(k) === userEmail) || userEmail;
             newCounts[key] = 0;
             return { ...c, unreadCounts: newCounts };
         }
         return c;
    }));
  };

  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const unreadTotal = conversations.reduce((sum, c) => {
    if (!user) return sum;
    const userEmail = normalize(user.email);
    const key = Object.keys(c.unreadCounts || {}).find(k => normalize(k) === userEmail);
    return sum + (key ? (c.unreadCounts[key] || 0) : 0);
  }, 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        activeConversationId,
        isLoading,
        isOpen,
        openChat,
        closeChat,
        sendMessage,
        markAsRead,
        getConversationMessages,
        setActiveConversationId,
        unreadTotal
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
