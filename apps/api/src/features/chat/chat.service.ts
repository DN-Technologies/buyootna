import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma, Property } from '@prisma/client';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Find or create a 1:1 conversation between two users/identities
  async findOrCreateConversation(
    userId: string,
    recipientId: string,
    propertyId?: string,
  ) {
    if (userId === recipientId) {
      throw new ForbiddenException('لا يمكنك بدء محادثة مع نفسك');
    }

    // Verify recipient exists (User or Identity)
    const recipient =
      (await this.prisma.user.findUnique({ where: { id: recipientId } })) ||
      (await this.prisma.identity.findUnique({ where: { id: recipientId } }));
    if (!recipient) {
      throw new NotFoundException('المستلم غير موجود');
    }

    // Verify property exists if propertyId is provided
    let validPropertyId: string | null = null;
    if (propertyId) {
      const prop = await this.prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (prop) {
        validPropertyId = propertyId;
      }
    }

    // Find conversation with these exact two participants
    const existingConversations = await this.prisma.conversation.findMany({
      where: {
        AND: [
          {
            participants: {
              some: { OR: [{ userId }, { identityId: userId }] },
            },
          },
          {
            participants: {
              some: {
                OR: [{ userId: recipientId }, { identityId: recipientId }],
              },
            },
          },
        ],
      },
      include: {
        participants: true,
      },
    });

    let conversation = existingConversations.find(
      (c) => c.participants.length === 2,
    );

    if (conversation) {
      if (validPropertyId && conversation.propertyId !== validPropertyId) {
        conversation = await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { propertyId: validPropertyId, updatedAt: new Date() },
          include: { participants: true },
        });
      }
    } else {
      conversation = await this.prisma.conversation.create({
        data: {
          propertyId: validPropertyId,
          participants: {
            create: [
              { userId, identityId: userId },
              { userId: recipientId, identityId: recipientId },
            ],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    return conversation;
  }

  // List all conversations for the user/identity
  async getConversations(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { OR: [{ userId }, { identityId: userId }] },
        },
        messages: {
          some: {},
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
            areaSize: true,
            location: true,
          },
        },
        participants: {
          include: {
            identity: {
              include: {
                individualData: true,
                companyData: true,
                officeData: true,
                user: true,
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

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherPart = conv.participants.find(
          (p) => p.userId !== userId && p.identityId !== userId,
        );
        const ident = otherPart?.identity;

        const otherUserName =
          ident?.companyData?.name ||
          ident?.officeData?.name ||
          ident?.individualData?.name ||
          ident?.user?.name ||
          'مستخدم بيوتنا';

        const otherUserAvatar =
          ident?.companyData?.logoUrl ||
          ident?.officeData?.logoUrl ||
          ident?.individualData?.avatarUrl ||
          ident?.user?.avatarUrl ||
          '@/assets/images/no-image.png';

        const lastMessage = conv.messages[0];
        const myParticipantRecord = conv.participants.find(
          (p) => p.userId === userId || p.identityId === userId,
        );

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            NOT: {
              OR: [{ senderId: userId }, { senderIdentityId: userId }],
            },
            ...(myParticipantRecord?.lastReadAt
              ? { createdAt: { gt: myParticipantRecord.lastReadAt } }
              : {}),
          },
        });

        return {
          id: conv.id,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          otherUser: {
            id: ident?.id || otherPart?.userId || '',
            name: otherUserName,
            avatarUrl: otherUserAvatar,
          },
          propertyContext: conv.property
            ? {
                id: conv.property.id,
                type: conv.property.type,
                category: conv.property.category,
                imageUrl:
                  conv.property.images[0] || '@/assets/images/no-image.png',
                price: conv.property.price,
                area: conv.property.areaSize ?? undefined,
                location: conv.property.location,
              }
            : null,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                type: lastMessage.type,
                createdAt: lastMessage.createdAt,
                isMine:
                  lastMessage.senderId === userId ||
                  lastMessage.senderIdentityId === userId,
              }
            : null,
          unreadCount,
        };
      }),
    );

    const total = await this.prisma.conversation.count({
      where: {
        participants: {
          some: { OR: [{ userId }, { identityId: userId }] },
        },
        messages: {
          some: {},
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

  // Get messages for a single conversation
  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit = 20,
  ) {
    const isParticipant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        OR: [{ userId }, { identityId: userId }],
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('ليس لديك صلاحية لعرض هذه المحادثة');
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        property: true,
        participants: {
          include: {
            identity: {
              include: {
                individualData: true,
                companyData: true,
                officeData: true,
                user: true,
              },
            },
          },
        },
      },
    });

    const queryOptions: Prisma.MessageFindManyArgs = {
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const messages = await this.prisma.message.findMany(queryOptions);

    let nextCursor: string | undefined = undefined;
    const hasNextPage = messages.length > limit;

    if (hasNextPage) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    const prop = conversation?.property;
    const otherPart = conversation?.participants.find(
      (p) => p.userId !== userId && p.identityId !== userId,
    );
    const ident = otherPart?.identity;

    const otherUserName =
      ident?.companyData?.name ||
      ident?.officeData?.name ||
      ident?.individualData?.name ||
      ident?.user?.name ||
      'مستخدم بيوتنا';

    const otherUserAvatar =
      ident?.companyData?.logoUrl ||
      ident?.officeData?.logoUrl ||
      ident?.individualData?.avatarUrl ||
      ident?.user?.avatarUrl ||
      '@/assets/images/no-image.png';

    return {
      data: messages.reverse().map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        imageUrl: msg.imageUrl,
        propertyId: msg.propertyId,
        property:
          (msg.propertyId || msg.type === 'PROPERTY') && prop
            ? {
                id: prop.id,
                imageUrl: prop.images[0] || '@/assets/images/no-image.png',
                price: prop.price,
                title: `${prop.category} ${prop.type}`,
                type: prop.type,
                area: prop.areaSize ?? undefined,
                bedrooms: prop.beds ?? undefined,
                bathrooms: prop.baths ?? undefined,
                location: prop.location,
              }
            : undefined,
        isMine: msg.senderId === userId || msg.senderIdentityId === userId,
        timestamp: this.formatTime(msg.createdAt),
        createdAt: msg.createdAt,
      })),
      meta: {
        nextCursor,
        hasNextPage,
        propertyContext: prop
          ? {
              id: prop.id,
              type: prop.type,
              category: prop.category,
              imageUrl: prop.images[0] || '@/assets/images/no-image.png',
              price: prop.price,
              area: prop.areaSize ?? undefined,
              location: prop.location,
            }
          : null,
        otherUser:
          ident || otherPart
            ? {
                id: ident?.id || otherPart?.userId || '',
                name: otherUserName,
                avatarUrl: otherUserAvatar,
              }
            : null,
      },
    };
  }

  // Send a message
  async sendMessage(
    senderId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const isParticipant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        OR: [{ userId: senderId }, { identityId: senderId }],
      },
    });

    if (!isParticipant) {
      throw new ForbiddenException('ليس لديك صلاحية للإرسال في هذه المحادثة');
    }

    return await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId,
          senderIdentityId: senderId,
          type: dto.type || 'TEXT',
          content: dto.content || null,
          imageUrl: dto.imageUrl || null,
          propertyId: dto.propertyId || null,
        },
      });

      let prop: Property | null = null;
      if (dto.propertyId || message.type === 'PROPERTY') {
        const conv = await tx.conversation.findUnique({
          where: { id: conversationId },
          include: { property: true },
        });
        prop = conv?.property ?? null;
      }

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      await tx.conversationParticipant.updateMany({
        where: {
          conversationId,
          OR: [{ userId: senderId }, { identityId: senderId }],
        },
        data: { lastReadAt: new Date() },
      });

      return {
        id: message.id,
        type: message.type,
        content: message.content,
        imageUrl: message.imageUrl,
        propertyId: message.propertyId,
        property: prop
          ? {
              id: prop.id,
              imageUrl: prop.images[0] || '@/assets/images/no-image.png',
              price: prop.price,
              title: `${prop.category} ${prop.type}`,
              type: prop.type,
              area: prop.areaSize ?? undefined,
              bedrooms: prop.beds ?? undefined,
              bathrooms: prop.baths ?? undefined,
              location: prop.location,
            }
          : undefined,
        senderId,
        timestamp: this.formatTime(message.createdAt),
        createdAt: message.createdAt,
      };
    });
  }

  // Mark conversation messages as read
  async markAsRead(userId: string, conversationId: string) {
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        OR: [{ userId }, { identityId: userId }],
      },
      data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('ar-KW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}
