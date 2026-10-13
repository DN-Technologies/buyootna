import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingType, Prisma, PropertyCategory } from '@prisma/client';

import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
} from '../../properties/services/property-formatting.util';
import { PrismaService } from 'src/core/prisma/prisma.service';

import {
  ChatParticipantDisplayService,
  isOtherAvailable,
} from './chat-participant-display.service';
import { presentProposal, PROPOSAL_SELECT } from './chat-proposals.service';
import { receiptOf } from './chat-receipts.service';
import {
  presentRequestContext,
  REQUEST_CONTEXT_SELECT,
} from './chat-request-context';
import { findDefaultPersonaId } from '../../identities/persona-rules';

/**
 * Conversation lifecycle and listing: finding-or-creating the 1:1
 * conversation between two participants, and the paginated inbox list.
 */
/**
 * Chats list search: the other person's name, the ad's Arabic title
 * ("عمارة", "للبيع"), or text in any message this persona can still see.
 */
export function conversationSearchWhere(
  identityId: string,
  rawQuery: string,
): Prisma.ConversationWhereInput {
  const q = rawQuery.trim();
  const contains = { contains: q, mode: 'insensitive' as const };
  const labelMatches = (label: string) =>
    label.includes(q) || q.includes(label);
  const categories = Object.entries(PROPERTY_CATEGORY_LABELS)
    .filter(([, label]) => labelMatches(label))
    .map(([key]) => key as PropertyCategory);
  const listingTypes = Object.entries(LISTING_TYPE_LABELS)
    .filter(([, label]) => labelMatches(label))
    .map(([key]) => key as ListingType);

  return {
    OR: [
      {
        participants: {
          some: {
            identityId: { not: identityId },
            identity: {
              OR: [
                { individualData: { name: contains } },
                { companyData: { name: contains } },
                { officeData: { name: contains } },
                { user: { name: contains } },
              ],
            },
          },
        },
      },
      ...(categories.length
        ? [{ property: { category: { in: categories } } }]
        : []),
      ...(listingTypes.length
        ? [{ property: { type: { in: listingTypes } } }]
        : []),
      {
        messages: {
          some: {
            content: contains,
            hiddenFor: { none: { identityId } },
          },
        },
      },
    ],
  };
}

@Injectable()
export class ChatConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly displayService: ChatParticipantDisplayService,
  ) {}

  // Find or create the 1:1 conversation between the caller's persona and a
  // recipient persona
  async findOrCreateConversation(
    userId: string,
    identityId: string,
    recipientId: string,
    propertyId?: string,
    requestId?: string,
  ) {
    // recipientId is normally a persona id (ad host, company, office card);
    // an account id still works and means that account's default persona
    const recipientIdentityId =
      (
        await this.prisma.identity.findUnique({
          where: { id: recipientId },
          select: { id: true },
        })
      )?.id ?? (await findDefaultPersonaId(this.prisma, recipientId));
    const recipient = recipientIdentityId
      ? await this.prisma.identity.findUnique({
          where: { id: recipientIdentityId },
          select: {
            id: true,
            userId: true,
            user: { select: { isDisabled: true, isBlocked: true } },
          },
        })
      : null;

    if (!recipient) {
      throw new NotFoundException('المستلم غير موجود');
    }
    // Your own personas can't message each other
    if (recipient.userId === userId) {
      throw new ForbiddenException('لا يمكنك بدء محادثة مع نفسك');
    }

    // A suspended (تعطيل مؤقت) or blocked account can't be contacted
    if (recipient.user.isDisabled || recipient.user.isBlocked) {
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

    // A request only counts when one of the two personas is its requester
    let validRequestId: string | null = null;
    if (requestId) {
      const request = await this.prisma.companyRequest.findUnique({
        where: { id: requestId },
        select: { id: true, clientIdentityId: true },
      });
      if (
        request &&
        [identityId, recipient.id].includes(request.clientIdentityId)
      ) {
        validRequestId = request.id;
        // A chat is about one thing: the request takes the ad's place
        validPropertyId = null;
      }
    }

    // The find-then-create below is serialized per persona pair with a
    // transaction-scoped Postgres advisory lock: a rapid double-tap on the
    // chat button fires two concurrent requests, and without the lock both
    // ran the find (finding nothing) and both created, producing duplicate
    // conversations (and, on the client, two stacked chat screens since each
    // duplicate has a different id). The key is symmetric (sorted) so both
    // concurrent callers contend on the same lock regardless of who is
    // "first".
    const lockKey = [identityId, recipient.id].sort().join(':');

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

      const existingConversations = await tx.conversation.findMany({
        where: {
          AND: [
            { participants: { some: { identityId } } },
            { participants: { some: { identityId: recipient.id } } },
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
        // The ad banner follows how the chat was opened: from an ad it shows
        // that ad; from a list or profile (no ad) it is cleared for both
        // sides, so an old ad doesn't look like the topic of a new chat
        const nextPropertyId = validPropertyId ?? null;
        const nextRequestId = validRequestId ?? null;
        if (
          conversation.propertyId !== nextPropertyId ||
          (conversation.requestId ?? null) !== nextRequestId
        ) {
          conversation = await tx.conversation.update({
            where: { id: conversation.id },
            data: {
              propertyId: nextPropertyId,
              requestId: nextRequestId,
              updatedAt: new Date(),
            },
            include: { participants: true },
          });
        }
      } else {
        conversation = await tx.conversation.create({
          data: {
            propertyId: validPropertyId,
            requestId: validRequestId,
            participants: {
              create: [
                { userId, identityId },
                { userId: recipient.userId, identityId: recipient.id },
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

  // The persona's inbox: other personas of the same account have their own
  async getConversations(
    identityId: string,
    page = 1,
    limit = 10,
    query?: string,
  ) {
    const skip = (page - 1) * limit;

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: { some: { identityId } },
        ...(query?.trim() ? conversationSearchWhere(identityId, query) : {}),
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
        request: { select: REQUEST_CONTEXT_SELECT },
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
          // The latest message this persona hasn't deleted on its side
          where: { hiddenFor: { none: { identityId } } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            // For the preview: "📷 3 صور" / "📎 عقد.pdf"
            attachments: {
              select: { fileName: true, kind: true, durationMs: true },
            },
            // "📅 موعد معاينة: …" / "💰 عرض سعر: …"
            proposal: { select: PROPOSAL_SELECT },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherPart = conv.participants.find(
          (p) => p.identityId !== identityId,
        );
        const ident = otherPart?.identity;
        const { name: otherUserName, avatarUrl: otherUserAvatar } =
          await this.displayService.resolve(otherPart);

        const lastMessage = conv.messages[0];
        const myParticipantRecord = conv.participants.find(
          (p) => p.identityId === identityId,
        );

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            NOT: { senderIdentityId: identityId },
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
            // For "متصل" (ChatService adds isOnline from it)
            lastSeenAt: ident?.lastSeenAt ?? null,
            // False once they are deleted, suspended or blocked
            isAvailable: isOtherAvailable(otherPart),
          },
          requestContext: presentRequestContext(conv.request),
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
                attachmentsCount: lastMessage.attachments.length,
                attachmentName: lastMessage.attachments[0]?.fileName ?? null,
                attachmentDurationMs:
                  lastMessage.attachments[0]?.durationMs ?? null,
                locationLabel: lastMessage.locationLabel,
                proposal: lastMessage.proposal
                  ? presentProposal(lastMessage.proposal)
                  : null,
                createdAt: lastMessage.createdAt,
                isMine: lastMessage.senderIdentityId === identityId,
              }
            : null,
          unreadCount,
          // How far the other person has received / read (the tick on my
          // last message)
          otherReceipt: receiptOf(otherPart),
        };
      }),
    );

    const total = await this.prisma.conversation.count({
      where: {
        participants: { some: { identityId } },
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
