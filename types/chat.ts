export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  participants: string[]; // [userId, teacherId]
  lastMessage: Message;
  unreadCounts: { [userId: string]: number };
  updatedAt: string;
}
