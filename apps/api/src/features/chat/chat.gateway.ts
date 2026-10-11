import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PresenceService } from '../../core/trust-signals/presence.service';
import { ChatPushService } from './services/chat-push.service';
import {
  ChatReceiptsService,
  ConversationReceipt,
} from './services/chat-receipts.service';

// What a connected socket speaks as (set on connect)
interface SocketIdentity {
  userId?: string;
  identityId?: string;
}

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
    private readonly prisma: PrismaService,
    private readonly presence: PresenceService,
    private readonly chatPush: ChatPushService,
    private readonly receipts: ChatReceiptsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Get token from auth payload or headers
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        console.warn('Socket connection rejected: No token provided');
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
      });

      // The account and the persona this socket speaks as. The app
      // reconnects with the new token when the persona is switched.
      const socketIdentity: SocketIdentity = {
        userId: payload.sub,
        identityId: payload.ident,
      };
      client.data = socketIdentity;

      // The persona's room: inbox updates for this persona only
      client.join(`identity:${payload.ident}`);
      if (payload.ident) {
        const wasOnline = this.presence.isConnected(payload.ident);
        this.presence.socketConnected(payload.ident);
        if (!wasOnline) void this.emitPresence(payload.ident, true);
      }
      // The app is online: messages waiting for this persona are delivered
      if (payload.ident) void this.deliverWaiting(payload.ident);
      console.log(`Client connected: identity:${payload.ident} (${client.id})`);
    } catch (error) {
      console.error('Socket connection authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { identityId } = (client.data ?? {}) as SocketIdentity;
    if (identityId) {
      this.presence.socketDisconnected(identityId);
      // The persona's last socket closed: its app is no longer open
      if (!this.presence.isConnected(identityId)) {
        void this.emitPresence(identityId, false);
      }
    }
    console.log(`Client disconnected: (${client.id})`);
  }

  /**
   * Tells everyone this persona chats with that its app opened or closed
   * ("متصل" in their chat header and the dot on their chats list).
   */
  async emitPresence(identityId: string, isOnline: boolean) {
    try {
      const partners = await this.prisma.conversationParticipant.findMany({
        where: {
          identityId: { not: identityId },
          conversation: { participants: { some: { identityId } } },
        },
        select: { identityId: true },
        distinct: ['identityId'],
      });
      if (partners.length === 0) return;
      let target = this.server.to(`identity:${partners[0].identityId}`);
      for (const partner of partners.slice(1)) {
        target = target.to(`identity:${partner.identityId}`);
      }
      target.emit('presence_changed', {
        identityId,
        isOnline,
        lastSeenAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to broadcast presence:', error);
    }
  }

  /**
   * "يكتب الان...": relayed to the other participants, in the open chat
   * and on their chats list. Nothing is stored; the receiver clears it on
   * its own if the "stopped" event never arrives.
   */
  @SubscribeMessage('typing')
  async handleTyping(
    client: Socket,
    payload: { conversationId?: string; isTyping?: boolean },
  ) {
    const { identityId } = (client.data ?? {}) as SocketIdentity;
    const conversationId = payload?.conversationId;
    if (!identityId || typeof conversationId !== 'string') return;

    const participants = await this.prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { identityId: true },
    });
    // Only the conversation's own personas may signal in it
    if (!participants.some((p) => p.identityId === identityId)) return;

    let target = client.to(`conversation:${conversationId}`);
    for (const participant of participants) {
      if (participant.identityId !== identityId) {
        target = target.to(`identity:${participant.identityId}`);
      }
    }
    target.emit('typing', {
      conversationId,
      identityId,
      isTyping: payload.isTyping === true,
    });
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(client: Socket, conversationId: string) {
    // Only the conversation's own personas may listen in on it
    const { identityId } = client.data as SocketIdentity;
    if (
      !identityId ||
      !(await this.chatService.isParticipant(identityId, conversationId))
    ) {
      return;
    }
    client.join(`conversation:${conversationId}`);
    console.log(`Socket ${client.id} joined conversation:${conversationId}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(`conversation:${conversationId}`);
    console.log(`Socket ${client.id} left conversation:${conversationId}`);
  }

  /**
   * Tells the senders how far a persona has received / read a conversation
   * (their ticks): the open chat and the other participants' chats lists.
   */
  emitReceipt(receipt: ConversationReceipt) {
    const { notifyIdentityIds, ...payload } = receipt;
    let target = this.server.to(`conversation:${receipt.conversationId}`);
    for (const id of notifyIdentityIds) target = target.to(`identity:${id}`);
    target.emit('conversation_receipt', payload);
  }

  /** Marks what was waiting for this persona as delivered and says so. */
  async deliverWaiting(identityId: string) {
    try {
      const receipts = await this.receipts.markDelivered(identityId);
      receipts.forEach((r) => this.emitReceipt(r));
    } catch (error) {
      console.error('Failed to mark messages delivered:', error);
    }
  }

  /**
   * A message changed after it was sent (an offer / appointment answered):
   * both phones patch it in place.
   */
  emitMessageUpdated(
    conversationId: string,
    update: { messageId: string; proposal: unknown },
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('message_updated', { conversationId, ...update });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    client: Socket,
    payload: { conversationId: string; tempId?: string } & SendMessageDto,
  ) {
    const { userId, identityId } = client.data as SocketIdentity;
    if (!userId || !identityId) {
      client.disconnect();
      return;
    }

    try {
      const { countered, ...message } = await this.chatService.sendMessage(
        { userId, identityId },
        payload.conversationId,
        payload,
      );

      // Broadcast the message to all participants in this conversation
      const room = `conversation:${payload.conversationId}`;
      this.server.to(room).emit('new_message', message);
      // A counter-offer: the offer it answers is now COUNTERED
      if (countered) this.emitMessageUpdated(payload.conversationId, countered);

      // Push to recipients who aren't looking at this conversation right now
      // (fire-and-forget: a push problem never fails the send)
      void this.server
        .in(room)
        .fetchSockets()
        .then((sockets) =>
          this.chatPush.notifyRecipients({
            conversationId: payload.conversationId,
            senderIdentityId: identityId,
            message: {
              type: message.type,
              content: message.content,
              attachments: message.attachments,
              location: message.location,
              proposal: message.proposal,
            },
            viewingIdentityIds: new Set(
              sockets
                .map((s) => (s.data as SocketIdentity)?.identityId)
                .filter((id): id is string => !!id),
            ),
          }),
        )
        .catch(() => undefined);

      // Broadcast an update to all other participants' user rooms (for updating their inbox list)
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: payload.conversationId },
        include: { participants: true },
      });

      if (conversation) {
        // Delivered at once to recipients whose app is connected
        const recipients = conversation.participants
          .map((p) => p.identityId)
          .filter((id) => id !== identityId);
        const connected: string[] = [];
        for (const id of recipients) {
          const sockets = await this.server.in(`identity:${id}`).fetchSockets();
          if (sockets.length > 0) connected.push(id);
        }
        const delivered = await this.receipts.markDeliveredTo(
          connected,
          payload.conversationId,
        );
        delivered.forEach((r) => this.emitReceipt(r));

        for (const participant of conversation.participants) {
          if (participant.identityId !== identityId) {
            this.server
              .to(`identity:${participant.identityId}`)
              .emit('conversation_updated', {
                conversationId: payload.conversationId,
                lastMessage: message,
              });
          }
        }
      }
    } catch (error) {
      console.error(
        'Failed to handle send_message socket event:',
        error.message,
      );
      // Echo the caller's tempId back so the client can roll back exactly
      // the optimistic bubble that failed to persist.
      client.emit('message_error', {
        conversationId: payload.conversationId,
        tempId: payload.tempId,
        message: 'تعذر إرسال الرسالة عبر الخادم',
      });
    }
  }
}
