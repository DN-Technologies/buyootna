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
      if (payload.ident) this.presence.socketConnected(payload.ident);
      console.log(`Client connected: identity:${payload.ident} (${client.id})`);
    } catch (error) {
      console.error('Socket connection authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { identityId } = (client.data ?? {}) as SocketIdentity;
    if (identityId) this.presence.socketDisconnected(identityId);
    console.log(`Client disconnected: (${client.id})`);
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
      const message = await this.chatService.sendMessage(
        { userId, identityId },
        payload.conversationId,
        payload,
      );

      // Broadcast the message to all participants in this conversation
      this.server
        .to(`conversation:${payload.conversationId}`)
        .emit('new_message', message);

      // Broadcast an update to all other participants' user rooms (for updating their inbox list)
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: payload.conversationId },
        include: { participants: true },
      });

      if (conversation) {
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
