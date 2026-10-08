import { AppState } from 'react-native';
import { io, Socket } from 'socket.io-client';

import { validateApiUrl } from '@/shared/api/api';
import type { ChatProposal, ProposalInput } from '@/shared/api/chat.service';

const API_URL = validateApiUrl();

class SocketService {
  private socket: Socket | null = null;
  // Conversation rooms this device should be in. A room belongs to one
  // socket connection on the server, so every (re)connect -- e.g. after the
  // OS dropped the socket while the app was in the background -- must join
  // them again, or the open chat stops receiving messages (QA)
  private rooms = new Set<string>();
  private reconnectListeners = new Set<() => void>();
  private hasConnected = false;

  constructor() {
    // Back in the foreground: don't wait for the next backoff tick
    AppState.addEventListener('change', (state) => {
      if (state === 'active' && this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    });
  }

  connect(token: string) {
    // Reuse the socket that dropped: a new one would lose every listener
    // the screens registered on it. The token is used on its next connect
    if (this.socket) {
      this.socket.auth = { token };
      if (!this.socket.connected) this.socket.connect();
      return;
    }

    // Connect to the 'chat' namespace
    this.socket = io(`${API_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Keep trying: a long stay in the background used to exhaust 10 tries
      reconnectionAttempts: Infinity,
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully to namespace /chat');
      this.rooms.forEach((id) => this.socket?.emit('join_conversation', id));
      if (this.hasConnected) {
        // A reconnect: messages may have arrived while disconnected
        this.reconnectListeners.forEach((cb) => cb());
      }
      this.hasConnected = true;
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
    this.rooms.clear();
    this.hasConnected = false;
  }

  /** Called after the socket comes back (not on the first connection). */
  onReconnect(callback: () => void) {
    this.reconnectListeners.add(callback);
    return () => {
      this.reconnectListeners.delete(callback);
    };
  }

  getSocket() {
    return this.socket;
  }

  /** Whether the chat socket is currently connected and able to deliver. */
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  joinConversation(conversationId: string) {
    this.rooms.add(conversationId);
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string) {
    this.rooms.delete(conversationId);
    if (this.socket?.connected) {
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
      replyToId?: string;
      attachmentIds?: string[];
      latitude?: number;
      longitude?: number;
      locationLabel?: string;
      proposal?: ProposalInput;
    },
  ): boolean {
    if (!this.socket) {
      return false;
    }
    this.socket.emit('send_message', { conversationId, ...payload });
    return true;
  }

  /** The other person received / read a conversation (my ticks). */
  onConversationReceipt(
    callback: (receipt: {
      conversationId: string;
      identityId: string;
      lastDeliveredAt?: string | null;
      lastReadAt?: string | null;
    }) => void,
  ) {
    this.socket?.on('conversation_receipt', callback);
    return () => {
      this.socket?.off('conversation_receipt', callback);
    };
  }

  /** An offer / appointment was answered: patch that message in place. */
  onMessageUpdated(
    callback: (update: {
      conversationId: string;
      messageId: string;
      proposal?: ChatProposal;
    }) => void,
  ) {
    this.socket?.on('message_updated', callback);
    return () => {
      this.socket?.off('message_updated', callback);
    };
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
