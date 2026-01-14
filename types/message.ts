export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai' | 'admin';
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  messages: Message[];
  status: 'active' | 'waiting-for-admin' | 'admin-replied' | 'closed';
  createdAt: string;
  updatedAt: string;
  adminNotified: boolean;
}

export interface SupportRequest {
  conversationId: string;
  userEmail: string;
  userName: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'responded' | 'closed';
}
