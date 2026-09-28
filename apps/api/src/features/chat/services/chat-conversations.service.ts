import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { ChatParticipantDisplayService } from './chat-participant-display.service';

/**
 * Conversation lifecycle and listing: finding-or-creating the 1:1
 * conversation between two participants, and the paginated inbox list.
 */
@Injectable()
export class ChatConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly displayService: ChatParticipantDisplayService,
  ) {}

  // Find or create a 1:1 conversation between two users/identities
  async findOrCreateConversation(
    userId: string,
    identityId: string,
    recipientId: string,
    propertyId?: string,
  ) {
    if (userId === recipientId || identityId === recipientId) {
      throw new ForbiddenException('لا يمكنك بدء محادثة مع نفسك');
    }

    // Verify recipient exists (User or Identity), and remember which FK
    // column their id actually belongs to — recipientId may be either a
    // User.id or an Identity.id depending on the caller, but never both.
    const recipientUser = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });
    const recipientIdentity = recipientUser
      ? null
      : await this.prisma.identity.findUnique({ where: { id: recipientId } });

    if (!recipientUser && !recipientIdentity) {
      throw new NotFoundException('المستلم غير موجود');
    }

    // A suspended (تعطيل مؤقت) or blocked account can't be contacted
    const recipientStatus = recipientUser
      ? recipientUser
      : await this.prisma.user.findUnique({
          where: { id: recipientIdentity!.userId },
          select: { isDisabled: true, isBlocked: true },
        });
    if (recipientStatus?.isDisabled || recipientStatus?.isBlocked) {
      throw new ForbiddenException('هذا الحساب غير متاح حالياً');
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

    // Find or create a 1:1 conversation between two users/identities.
    //
    // The find-then-create below is serialized per participant pair with a
    // transaction-scoped Postgres advisory lock: a rapid double-tap on the
    // chat button fires two concurrent requests, and without the lock both
    // ran the find (finding nothing) and both created, producing duplicate
    // conversations (and, on the client, two stacked chat screens since each
    // duplicate has a different id). A pair-unique constraint is not
    // practical here -- participants are two rows referencing either
    // identityId or the legacy userId -- so the lock + re-find inside one
    // transaction is the guarantee. The key is symmetric (sorted) so both
    // concurrent callers contend on the same lock regardless of who is
    // "first".
    const lockKey = [userId, recipientId].sort().join(':');

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const existingConversations = await tx.conversation.findMany({
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
          conversation = await tx.conversation.update({
            where: { id: conversation.id },
            data: { propertyId: validPropertyId, updatedAt: new Date() },
            include: { participants: true },
          });
        }
      } else {
        conversation = await tx.conversation.create({
          data: {
            propertyId: validPropertyId,
            participants: {
              create: [
                { userId, identityId },
                recipientUser
                  ? { userId: recipientId, identityId: null }
                  : { userId: null, identityId: recipientId },
              ],
            },
          },
          include: {
            participants: true,
          },
        });
      }

      return conversation;
    });
  }

  // List all conversations for the user/identity
  async getConversations(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { OR: [{ userId }, { identityId: userId }] },
        },
        // NOTE: deliberately no `messages: { some: {} }` filter here. A
        // conversation starts empty (created by "contact" taps before any
        // message is sent), and filtering it out made newly initiated chats
        // invisible in the inbox until the first message persisted -- the
        // clients already render a "بدء المحادثة" placeholder for empty
        // rooms, so they are meant to be listed.
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
        const { name: otherUserName, avatarUrl: otherUserAvatar } =
          await this.displayService.resolve(otherPart);

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
        // Keep in sync with the list query above: empty (newly initiated)
        // conversations count too.
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
}
