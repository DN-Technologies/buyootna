import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, Property } from '@prisma/client';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { SendMessageDto } from '../dto/send-message.dto';

/**
 * Message reading and writing inside a conversation: the cursor-paginated
 * thread, sending (which bumps the conversation and marks it read for the
 * sender), and the read receipt.
 */
@Injectable()
export class ChatMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly displayService: ChatParticipantDisplayService,
  ) {}

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
    const { name: otherUserName, avatarUrl: otherUserAvatar } =
      await this.displayService.resolve(otherPart);

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
