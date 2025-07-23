import { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '@/types/chat';
import { messageApi } from '@/services/api';
import { webSocketService } from '@/services/websocket';

interface ChatWindowProps {
  selectedUser: User | null;
  currentUser: User | null;
  roomId: number | null;
}

export default function ChatWindow({ selectedUser, currentUser, roomId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomId) {
      loadMessages();
      webSocketService.subscribeToRoom(roomId, handleNewMessage);
    }
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      const response = await messageApi.getRecentMessages(roomId, 50);
      setMessages(response.data.reverse()); // Reverse to show chronological order
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !currentUser) return;

    const messageData: Partial<ChatMessage> = {
      content: newMessage,
      senderId: currentUser.id,
      roomId: roomId,
      type: 'TEXT'
    };

    try {
      // Send via WebSocket for real-time delivery
      webSocketService.sendMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Select a user to start chatting</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            selectedUser.status === 'ONLINE' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
          <div>
            <div className="font-semibold">{selectedUser.displayName}</div>
            <div className="text-sm text-gray-600">
              {selectedUser.status === 'ONLINE' ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-gray-500">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${
                message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === currentUser?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <div className="text-sm mb-1">{message.content}</div>
                <div className={`text-xs ${
                  message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                  {message.edited && ' (edited)'}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}