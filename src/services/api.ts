import axios from 'axios';
import { User, ChatRoom, ChatMessage } from '@/types/chat';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = {
  createUser: (userData: Partial<User>) => api.post<User>('/users', userData),
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  getAllUsers: () => api.get<User[]>('/users'),
  searchUsers: (query: string) => api.get<User[]>(`/users/search?query=${query}`),
  getOnlineUsers: () => api.get<User[]>('/users/online'),
  updateUserStatus: (id: number, status: string) => 
    api.put(`/users/${id}/status?status=${status}`),
};

export const chatRoomApi = {
  createDirectRoom: (user1Id: number, user2Id: number) =>
    api.post<ChatRoom>('/chat-rooms/direct', { user1Id, user2Id }),
  createGroupRoom: (name: string, createdBy: number, memberIds: number[]) =>
    api.post<ChatRoom>('/chat-rooms/group', { name, createdBy, memberIds }),
  getRoomById: (id: number) => api.get<ChatRoom>(`/chat-rooms/${id}`),
  getUserRooms: (userId: number) => api.get<ChatRoom[]>(`/chat-rooms/user/${userId}`),
  getUserByUsername: (username: string) => api.get<User>(`/users/username/${username}`), 
};

export const messageApi = {
  sendMessage: (message: Partial<ChatMessage>) =>
    api.post<ChatMessage>('/messages', message),
  getChatHistory: (roomId: number, page = 0, size = 50) =>
    api.get<ChatMessage[]>(`/messages/room/${roomId}?page=${page}&size=${size}`),
  getRecentMessages: (roomId: number, limit = 20) =>
    api.get<ChatMessage[]>(`/messages/room/${roomId}/recent?limit=${limit}`),
  editMessage: (messageId: number, content: string) =>
    api.put<ChatMessage>(`/messages/${messageId}`, { content }),
};