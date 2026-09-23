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
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-fallback-key',
      });

      // Save user ID to client session
      client.data.userId = payload.sub;

      // Join personal room to receive direct events (like conversation updates)
      client.join(`user:${payload.sub}`);
      console.log(`Client connected: user:${payload.sub} (${client.id})`);
    } catch (error) {
      console.error('Socket connection authentication failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: (${client.id})`);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(client: Socket, conversationId: string) {
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
    const senderId = client.data.userId;
    if (!senderId) {
      client.disconnect();
      return;
    }

    try {
      const message = await this.chatService.sendMessage(
        senderId,
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
          if (participant.userId !== senderId) {
            this.server
              .to(`user:${participant.userId}`)
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
