import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { ChatMessage, TypingIndicator } from '@/types/chat';

class WebSocketService {
  private stompClient: any = null;
  private connected: boolean = false;

  connect(_onMessageReceived: (message: ChatMessage) => void, _onTyping: (typing: TypingIndicator) => void) {
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected: ' + frame);
      this.connected = true;
    }, (error: any) => {
      console.error('WebSocket connection error:', error);
      this.connected = false;
    });
  }

  subscribeToRoom(roomId: number, onMessageReceived: (message: ChatMessage) => void) {
    if (this.stompClient && this.connected) {
      this.stompClient.subscribe(`/topic/room/${roomId}`, (message: any) => {
        const chatMessage = JSON.parse(message.body);
        onMessageReceived(chatMessage);
      });

      this.stompClient.subscribe(`/topic/room/${roomId}/typing`, (message: any) => {
        const typingData = JSON.parse(message.body);
        console.log('Typing indicator:', typingData);
      });
    }
  }

  sendMessage(message: Partial<ChatMessage>) {
    if (this.stompClient && this.connected) {
      this.stompClient.send('/app/chat.send', {}, JSON.stringify(message));
    }
  }

  sendTyping(roomId: number, username: string, typing: boolean) {
    if (this.stompClient && this.connected) {
      this.stompClient.send('/app/chat.typing', {}, JSON.stringify({
        roomId,
        username,
        typing
      }));
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();