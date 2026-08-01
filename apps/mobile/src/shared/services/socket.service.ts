import { io, Socket } from 'socket.io-client';

import { validateApiUrl } from '@/shared/api/api';

const API_URL = validateApiUrl();

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    // Connect to the 'chat' namespace
    this.socket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully to namespace /chat');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  sendMessage(
    conversationId: string,
    payload: {
      content?: string;
      type?: string;
      imageUrl?: string;
      propertyId?: string;
    },
  ) {
    if (this.socket) {
      this.socket.emit('send_message', { conversationId, ...payload });
    }
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
    return () => {
      this.socket?.off('new_message', callback);
    };
  }

  onConversationUpdated(callback: (data: any) => void) {
    this.socket?.on('conversation_updated', callback);
    return () => {
      this.socket?.off('conversation_updated', callback);
    };
  }
}

export const socketService = new SocketService();
