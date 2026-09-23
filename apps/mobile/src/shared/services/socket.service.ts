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

  /** Whether the chat socket is currently connected and able to deliver. */
  isConnected(): boolean {
    return !!this.socket?.connected;
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

  /**
   * Emits a send attempt. Returns false (without emitting) when there is no
   * socket at all -- the caller is expected to treat that as a failed send
   * rather than showing an optimistic bubble that will never be confirmed.
   * `tempId` is echoed back by the server on a `message_error` so the
   * caller can roll back exactly the bubble that failed.
   */
  sendMessage(
    conversationId: string,
    payload: {
      content?: string;
      type?: string;
      imageUrl?: string;
      propertyId?: string;
      tempId?: string;
    },
  ): boolean {
    if (!this.socket) {
      return false;
    }
    this.socket.emit('send_message', { conversationId, ...payload });
    return true;
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

  /** Server could not persist a send_message (see ChatGateway). */
  onMessageError(
    callback: (data: {
      conversationId: string;
      tempId?: string;
      message?: string;
    }) => void,
  ) {
    this.socket?.on('message_error', callback);
    return () => {
      this.socket?.off('message_error', callback);
    };
  }
}

export const socketService = new SocketService();
