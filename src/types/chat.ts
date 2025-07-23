export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  status: 'ONLINE' | 'OFFLINE' | 'AWAY';
  lastSeen?: string;
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  type: 'DIRECT' | 'GROUP';
  createdBy: number;
  createdAt: string;
  members: User[];
  lastMessage?: ChatMessage;
}

export interface ChatMessage {
  id?: number;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  senderId: number;
  senderUsername: string;
  senderDisplayName: string;
  roomId: number;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
}

export interface TypingIndicator {
  roomId: number;
  username: string;
  typing: boolean;
}