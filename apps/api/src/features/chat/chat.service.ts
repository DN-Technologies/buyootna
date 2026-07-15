import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Find or create a 1:1 conversation between two users
  async findOrCreateConversation(
    userId: string,
    recipientId: string,
    propertyId?: string,
  ) {
    if (userId === recipientId) {
      throw new ForbiddenException('لا يمكنك بدء محادثة مع نفسك');
    }

    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      throw new NotFoundException('المستلم غير موجود');
    }

    // Find conversation with these exact two participants (and same optional property context)
    const existingConversations = await this.prisma.conversation.findMany({
      where: {
        propertyId: propertyId || null,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
      include: {
        participants: true,
      },
    });

    // Check if there is one that has exactly 2 participants
    const conversation = existingConversations.find(
      (c) => c.participants.length === 2,
    );

    if (conversation) {
      return conversation;
    }

    // Otherwise, create a new conversation
    return this.prisma.conversation.create({
      data: {
        propertyId: propertyId || null,
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      include: {
        participants: true,
      },
    });
  }

  // List all conversations for the user
  async getConversations(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        property: {
          select: {
            id: true,
            type: true,
            category: true,
            images: true,
            price: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                companyProfile: {
                  select: {
                    name: true,
                    logoUrl: true,
                  },
                },
                officeProfile: {
                  select: {
                    name: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    const formattedConversations = conversations.map((conv) => {
      // Find the participant that is NOT the current user
      const otherPart = conv.participants.find((p) => p.userId !== userId);
      const otherUser = otherPart?.user;

      const otherUserName = otherUser?.officeProfile
        ? otherUser.officeProfile.name
        : otherUser?.companyProfile
          ? otherUser.companyProfile.name
          : otherUser?.email
            ? otherUser.email.split('@')[0]
            : 'مستخدم بيوتنا';

      const otherUserAvatar =
        otherUser?.officeProfile?.logoUrl ||
        otherUser?.companyProfile?.logoUrl ||
        'https://via.placeholder.com/150';

      const lastMessage = conv.messages[0];
      const myParticipantRecord = conv.participants.find(
        (p) => p.userId === userId,
      );

      // Unread count is count of messages sent by someone else after our lastReadAt
      const unreadCount = conv.messages.filter(
        (msg) =>
          msg.senderId !== userId &&
          (!myParticipantRecord?.lastReadAt ||
            msg.createdAt > myParticipantRecord.lastReadAt),
      ).length;

      return {
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        otherUser: {
          id: otherUser?.id || '',
          name: otherUserName,
          avatarUrl: otherUserAvatar,
        },
        propertyContext: conv.property
          ? {
              id: conv.property.id,
              type: conv.property.type,
              category: conv.property.category,
              imageUrl:
                conv.property.images[0] || 'https://via.placeholder.com/150',
              price: conv.property.price,
            }
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              isMine: lastMessage.senderId === userId,
            }
          : null,
        unreadCount,
      };
    });

    const total = await this.prisma.conversation.count({
      where: {
        participants: {
          some: { userId },
        },
      },
    });

    return {
      data: formattedConversations,
      meta: {
        total,
        page,
        limit,
        hasNextPage: skip + limit < total,
      },
    };
  }

  // Get messages for a single conversation (cursor-based pagination for infinite scroll)
  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ) {
    // Verify user is participant
    const isParticipant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('ليس لديك صلاحية لعرض هذه المحادثة');
    }

    const queryOptions: any = {
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one extra to check if there is a next page
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor itself
    }

    const messages = await this.prisma.message.findMany(queryOptions);

    let nextCursor: string | undefined = undefined;
    const hasNextPage = messages.length > limit;

    if (hasNextPage) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    return {
      data: messages.reverse().map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        imageUrl: msg.imageUrl,
        propertyId: msg.propertyId,
        isMine: msg.senderId === userId,
        timestamp: this.formatTime(msg.createdAt),
        createdAt: msg.createdAt,
      })),
      meta: {
        nextCursor,
        hasNextPage,
      },
    };
  }

  // Send a message (called via REST or WS)
  async sendMessage(
    senderId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    // Verify sender is participant
    const isParticipant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: senderId,
        },
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('ليس لديك صلاحية للإرسال في هذه المحادثة');
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create message
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          type: dto.type || 'TEXT',
          content: dto.content || null,
          imageUrl: dto.imageUrl || null,
          propertyId: dto.propertyId || null,
        },
      });

      // 2. Update conversation updatedAt so it floats to top
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // 3. Auto mark as read for sender
      await tx.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: senderId,
          },
        },
        data: { lastReadAt: new Date() },
      });

      return {
        id: message.id,
        type: message.type,
        content: message.content,
        imageUrl: message.imageUrl,
        propertyId: message.propertyId,
        senderId,
        timestamp: this.formatTime(message.createdAt),
        createdAt: message.createdAt,
      };
    });
  }

  // Mark conversation messages as read
  async markAsRead(userId: string, conversationId: string) {
    await this.prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  // Helper: Format date/time
  private formatTime(date: Date): string {
    return date.toLocaleTimeString('ar-KW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
