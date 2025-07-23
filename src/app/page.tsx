"use client";
import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import UserList from '@/components/UserList';
import ChatWindow from '@/components/ChatWindow';
import { User, ChatRoom } from '@/types/chat';
import { userApi, chatRoomApi } from '@/services/api';
import { webSocketService } from '@/services/websocket';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadUsers();
      // Connect to WebSocket
      webSocketService.connect(
        (message) => console.log('New message:', message),
        (typing) => console.log('Typing:', typing)
      );
    }

    return () => {
      if (currentUser) {
        userApi.updateUserStatus(currentUser.id, 'OFFLINE');
        webSocketService.disconnect();
      }
    };
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleUserSelect = async (user: User) => {
    if (!currentUser) return;
    
    setSelectedUser(user);
    
    try {
      // Create or get direct chat room
      const response = await chatRoomApi.createDirectRoom(currentUser.id, user.id);
      setCurrentRoom(response.data);
    } catch (error) {
      console.error('Failed to create/get chat room:', error);
    }
  };

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex">
      <UserList
        users={users}
        currentUser={currentUser}
        onUserSelect={handleUserSelect}
        selectedUser={selectedUser}
      />
      <ChatWindow
        selectedUser={selectedUser}
        currentUser={currentUser}
        roomId={currentRoom?.id || null}
      />
    </div>
  );
}