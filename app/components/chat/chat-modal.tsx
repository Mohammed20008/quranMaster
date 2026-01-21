'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/app/context/chat-context';
import { useAuth } from '@/app/context/auth-context';
import { X, Send, ChevronLeft, Search, Check, CheckCheck, MoreVertical } from 'lucide-react';
import { renderAvatar, getAvatarPreset } from '@/app/components/avatar/avatar-utils';
import styles from './chat-modal.module.css';

export default function ChatModal() {
  const { 
    isOpen, 
    closeChat, 
    conversations, 
    activeConversationId, 
    setActiveConversationId,
    sendMessage,
    markAsRead,
    unreadTotal,
    messages: allMessages
  } = useChat();
  
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConversationId && isOpen) {
      // Check if there are any unread messages from others
      const hasUnread = allMessages.some(m => 
        m.conversationId === activeConversationId && 
        !m.read && 
        m.senderId !== user?.email
      );

      if (hasUnread) {
        markAsRead(activeConversationId);
      }
      
      // Always scroll to bottom when messages update in active view
      scrollToBottom();
    }
  }, [activeConversationId, allMessages, isOpen]);

  // Filter conversations
  const filteredConversations = conversations
    .filter(c => {
       const other = c.participants.find(p => p !== user?.email);
       return other?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  // Get active conversation details
  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeMessages = allMessages.filter(m => m.conversationId === activeConversationId);
  
  // Get other participant details
  const getOtherParticipant = (conversation: any) => {
    const email = conversation?.participants.find((p: string) => p !== user?.email) || 'Unknown';
    // Ideally we would fetch name/avatar from user registry or Teacher context
    // For now we simulate
    const name = email.split('@')[0];
    const initial = name[0].toUpperCase();
    return { email, name, initial };
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeConversationId) return;
    
    sendMessage(activeConversationId, messageText);
    setMessageText('');
  };

  const currentParticipant = activeConversation ? getOtherParticipant(activeConversation) : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.modalWrapper}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {activeConversationId ? (
                <>
                  <button onClick={() => setActiveConversationId(null)} className={styles.iconButton}>
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-bold">
                      {currentParticipant?.initial}
                    </div>
                    <div>
                      <div className={styles.title}>{currentParticipant?.name}</div>
                      <span className={styles.status}>Online</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.iconButton}>
                    {/* App Logo or Chat Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className={styles.title}>Messages</div>
                    <span className={styles.status}>{unreadTotal} unseen messages</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2">
              <button onClick={closeChat} className={`${styles.iconButton} ${styles.closeButton}`}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {!activeConversationId ? (
              // Inbox View
              <div className={styles.view}>
                <div className={styles.searchBar}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search messages..." 
                      className={styles.searchInput}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.conversationList}>
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 opacity-60">
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    filteredConversations.map(conv => {
                      const other = getOtherParticipant(conv);
                      const lastMsg = allMessages
                        .filter(m => m.conversationId === conv.id)
                        .pop();
                        
                      // Logic for preset mapping could be improved by checking a global user registry map
                      // For now, we use initials
                      const isUnread = (conv.unreadCounts?.[user?.email || ''] || 0) > 0;

                      return (
                        <div 
                          key={conv.id} 
                          onClick={() => setActiveConversationId(conv.id)}
                          className={`${styles.conversationItem} ${isUnread ? styles.unread : ''}`}
                        >
                          <div className={styles.avatarWrapper}>
                             <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center text-gray-500 font-semibold shadow-sm text-lg">
                                {renderAvatar(getAvatarPreset('gradient-gold'), other.name, 46, "w-full h-full rounded-full")}
                             </div>
                             {isUnread && (
                               <div className={styles.badge}>
                                 {conv.unreadCounts[user?.email || '']}
                               </div>
                             )}
                          </div>
                          
                          <div className={styles.itemContent}>
                             <div className={styles.itemName}>
                               <span>{other.name}</span>
                               <span className={styles.itemTime}>
                                 {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                               </span>
                             </div>
                             <div className={`${styles.itemPreview} ${isUnread ? styles.bold : ''}`}>
                               {lastMsg?.content || 'Started a conversation'}
                             </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Active Chat View
              <div className={styles.view}>
                 <div className={styles.messagesArea}>
                    {activeMessages.map((msg, i) => {
                       const isMe = msg.senderId === user?.email;
                       const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(activeMessages[i-1].timestamp).toDateString();
                       
                       return (
                         <React.Fragment key={msg.id}>
                           {showDate && (
                             <div className={styles.dateSeparator}>
                               <span className={styles.dateLabel}>
                                 {new Date(msg.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                               </span>
                             </div>
                           )}
                           
                           <div className={`${styles.messageRow} ${isMe ? styles.me : styles.them}`}>
                             {!isMe && (
                               <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
                                  {renderAvatar(getAvatarPreset(), currentParticipant?.name || 'U', 32, "w-full h-full")}
                               </div>
                             )}
                             <div>
                               <div className={styles.messageBubble}>
                                 {msg.content}
                               </div>
                               <div className={styles.messageMeta}>
                                 <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 {isMe && (
                                    msg.read ? <CheckCheck size={14} className="text-white" /> : <Check size={14} className="text-white/70" />
                                 )}
                               </div>
                             </div>
                           </div>
                         </React.Fragment>
                       );
                    })}
                    <div ref={messagesEndRef} />
                 </div>
                 
                 <form onSubmit={handleSend} className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                       <textarea 
                         className={styles.textArea}
                         placeholder="Type a message..."
                         rows={1}
                         value={messageText}
                         onChange={e => setMessageText(e.target.value)}
                         onKeyDown={e => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSend();
                           }
                         }}
                       />
                       <button 
                         type="submit" 
                         disabled={!messageText.trim()}
                         className={styles.sendButton}
                       >
                         <Send size={18} />
                       </button>
                    </div>
                 </form>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
