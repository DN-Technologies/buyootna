import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Property } from '@prisma/client';

import { PrismaService } from 'src/core/prisma/prisma.service';

import { ChatParticipantDisplayService } from './chat-participant-display.service';
import { SendMessageDto } from '../dto/send-message.dto';
import {
  ATTACHMENT_SELECT,
  ChatAttachmentsService,
  messageTypeFor,
} from './chat-attachments.service';
import {
  ChatProposalsService,
  presentProposal,
  PROPOSAL_SELECT,
} from './chat-proposals.service';

/**
 * Message reading and writing inside a conversation: the cursor-paginated
 * thread, sending (which bumps the conversation and marks it read for the
 * sender), and the read receipt.
 */
// What a reply shows of the message it quotes
const REPLY_SELECT = {
  id: true,
  type: true,
  content: true,
  imageUrl: true,
  senderIdentityId: true,
} as const;
const REPLY_PREVIEW_CHARS = 120;

type ReplySource = {
  id: string;
  type: string;
  content: string | null;
  imageUrl: string | null;
  senderIdentityId: string | null;
  hiddenFor?: { identityId: string }[];
};
type MessageWithReply = Prisma.MessageGetPayload<object> & {
  replyTo: ReplySource | null;
  attachments: Prisma.MessageAttachmentGetPayload<{
    select: typeof ATTACHMENT_SELECT;
  }>[];
  proposal: Prisma.ChatProposalGetPayload<{
    select: typeof PROPOSAL_SELECT;
  }> | null;
};

/** The ad card in a PROPERTY message; `unavailable` once it's off the market. */
export function propertyCard(prop: Property) {
  return {
    id: prop.id,
    imageUrl: prop.images[0] || '@/assets/images/no-image.png',
    price: prop.price,
    title: `${prop.category} ${prop.type}`,
    type: prop.type,
    area: prop.areaSize ?? undefined,
    bedrooms: prop.beds ?? undefined,
    bathrooms: prop.baths ?? undefined,
    location: prop.location,
    unavailable: prop.status !== 'ACTIVE',
  };
}

/** The pin of a LOCATION message. */
export function locationOf(msg: {
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
}) {
  return msg.latitude != null && msg.longitude != null
    ? {
        latitude: msg.latitude,
        longitude: msg.longitude,
        label: msg.locationLabel,
      }
    : undefined;
}

/**
 * The quoted message under a reply. A quoted message that's gone, or that
 * the viewer deleted on their side, shows as deleted.
 */
export function replyPreview(
  replyToId: string | null,
  source: ReplySource | null,
  viewerIdentityId?: string,
) {
  if (!replyToId) return null;
  if (!source || (source.hiddenFor?.length ?? 0) > 0) {
    return { id: replyToId, deleted: true as const };
  }
  const content = source.content ?? null;
  return {
    id: source.id,
    type: source.type,
    content:
      content && content.length > REPLY_PREVIEW_CHARS
        ? `${content.slice(0, REPLY_PREVIEW_CHARS)}…`
        : content,
    imageUrl: source.imageUrl,
    senderIdentityId: source.senderIdentityId,
    ...(viewerIdentityId
      ? { isMine: source.senderIdentityId === viewerIdentityId }
      : {}),
  };
}

@Injectable()
export class ChatMessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly displayService: ChatParticipantDisplayService,
    private readonly attachments: ChatAttachmentsService,
    private readonly proposals: ChatProposalsService,
  ) {}

  // Get messages for a single conversation
  async getMessages(
    conversationId: string,
    identityId: string,
    cursor?: string,
    limit = 20,
  ) {
    const isParticipant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, identityId },
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

    const messages: MessageWithReply[] = await this.prisma.message.findMany({
      // Not the ones this persona deleted on its side (حذف لدي)
      where: { conversationId, hiddenFor: { none: { identityId } } },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        replyTo: {
          select: {
            ...REPLY_SELECT,
            hiddenFor: { where: { identityId }, select: { identityId: true } },
          },
        },
        attachments: {
          select: ATTACHMENT_SELECT,
          orderBy: { createdAt: 'asc' },
        },
        proposal: { select: PROPOSAL_SELECT },
      },
    });

    let nextCursor: string | undefined = undefined;
    const hasNextPage = messages.length > limit;

    if (hasNextPage) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    const prop = conversation?.property;
    const otherPart = conversation?.participants.find(
      (p) => p.identityId !== identityId,
    );
    const ident = otherPart?.identity;
    const { name: otherUserName, avatarUrl: otherUserAvatar } =
      await this.displayService.resolve(otherPart);

    // Ads shared in these messages (other than the chat's own ad)
    const sharedIds = [
      ...new Set(
        messages
          .map((m) => m.propertyId)
          .filter((id): id is string => !!id && id !== prop?.id),
      ),
    ];
    const shared = new Map(
      (sharedIds.length
        ? await this.prisma.property.findMany({
            where: { id: { in: sharedIds } },
          })
        : []
      ).map((p) => [p.id, p]),
    );
    const cardFor = (msg: MessageWithReply) => {
      const p = msg.propertyId
        ? msg.propertyId === prop?.id
          ? prop
          : shared.get(msg.propertyId)
        : msg.type === 'PROPERTY'
          ? prop
          : null;
      return p ? propertyCard(p) : undefined;
    };

    return {
      data: await Promise.all(
        messages.reverse().map(async (msg) => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          imageUrl: msg.imageUrl,
          propertyId: msg.propertyId,
          property: cardFor(msg),
          location: locationOf(msg),
          proposal: msg.proposal ? presentProposal(msg.proposal) : undefined,
          replyTo: replyPreview(msg.replyToId, msg.replyTo, identityId),
          // Private files: fresh signed links for this participant
          attachments: msg.attachments.length
            ? await this.attachments.present(msg.attachments)
            : undefined,
          isMine: msg.senderIdentityId === identityId,
          timestamp: this.formatTime(msg.createdAt),
          createdAt: msg.createdAt,
        })),
      ),
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

  // Send a message as the sender's persona
  async sendMessage(
    sender: { userId: string; identityId: string },
    conversationId: string,
    dto: SendMessageDto,
  ) {
    const isParticipant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, identityId: sender.identityId },
    });

    if (!isParticipant) {
      throw new ForbiddenException('ليس لديك صلاحية للإرسال في هذه المحادثة');
    }

    // The other side suspended their account (or was blocked): no new
    // messages until they're back
    const others = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, identityId: { not: sender.identityId } },
      select: {
        identity: {
          select: { user: { select: { isDisabled: true, isBlocked: true } } },
        },
      },
    });
    const unavailable = others.some(
      (p) => p.identity.user.isDisabled || p.identity.user.isBlocked,
    );
    if (unavailable) {
      throw new ForbiddenException('هذا الحساب غير متاح حالياً');
    }

    const type = dto.type || 'TEXT';

    // A map pin needs valid coordinates
    if (type === 'LOCATION') {
      const { latitude: lat, longitude: lng } = dto;
      if (
        typeof lat !== 'number' ||
        typeof lng !== 'number' ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180
      ) {
        throw new BadRequestException('الموقع غير صحيح');
      }
    }

    // A shared ad must be live (the chat's own ad is always fine)
    let sharedProperty: Property | null = null;
    if (dto.propertyId) {
      const conversationProperty = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { propertyId: true },
      });
      sharedProperty = await this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      });
      if (
        !sharedProperty ||
        (sharedProperty.status !== 'ACTIVE' &&
          sharedProperty.id !== conversationProperty?.propertyId)
      ) {
        throw new BadRequestException('الإعلان غير متاح');
      }
    }

    // Appointment / offer details
    const proposalInput =
      type === 'APPOINTMENT' || type === 'OFFER'
        ? this.proposals.parse(type, dto.proposal)
        : null;

    // A reply only to a message of this same conversation; anything else is
    // sent as a plain message
    const replyTo = dto.replyToId
      ? await this.prisma.message.findFirst({
          where: { id: dto.replyToId, conversationId },
          select: REPLY_SELECT,
        })
      : null;

    return await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: sender.userId,
          senderIdentityId: sender.identityId,
          type,
          content: dto.content || null,
          imageUrl: dto.imageUrl || null,
          propertyId: dto.propertyId || null,
          replyToId: replyTo?.id ?? null,
          ...(type === 'LOCATION'
            ? {
                latitude: dto.latitude,
                longitude: dto.longitude,
                locationLabel: dto.locationLabel?.trim().slice(0, 200) || null,
              }
            : {}),
        },
      });

      const proposal = proposalInput
        ? await this.proposals.createFor(tx, {
            identityId: sender.identityId,
            conversationId,
            messageId: message.id,
            proposal: proposalInput,
          })
        : null;

      // Files uploaded for this message: all photos -> IMAGE, a video ->
      // VIDEO, a voice note -> VOICE, otherwise FILE
      const claimed = dto.attachmentIds?.length
        ? await this.attachments.claim(
            tx,
            sender.identityId,
            conversationId,
            dto.attachmentIds,
            message.id,
          )
        : [];
      if (claimed.length) {
        const type = messageTypeFor(claimed.map((a) => a.kind));
        if (type !== message.type) {
          await tx.message.update({
            where: { id: message.id },
            data: { type },
          });
          message.type = type;
        }
      }

      let prop: Property | null = sharedProperty;
      if (!prop && message.type === 'PROPERTY') {
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
        where: { conversationId, identityId: sender.identityId },
        data: { lastReadAt: new Date() },
      });

      return {
        id: message.id,
        type: message.type,
        content: message.content,
        imageUrl: message.imageUrl,
        propertyId: message.propertyId,
        property: prop ? propertyCard(prop) : undefined,
        location: locationOf(message),
        proposal: proposal ? presentProposal(proposal.proposal) : undefined,
        // The offer this one counters (now COUNTERED): the gateway updates
        // its card on both phones
        countered: proposal?.countered
          ? {
              messageId: proposal.countered.messageId,
              proposal: presentProposal(proposal.countered.proposal),
            }
          : undefined,
        // Broadcast to both sides: each app works out "you" from
        // replyTo.senderIdentityId
        replyTo: replyPreview(replyTo?.id ?? null, replyTo),
        attachments: claimed.length
          ? await this.attachments.present(claimed)
          : undefined,
        // The app compares senderId with the signed-in account's id
        senderId: sender.userId,
        senderIdentityId: sender.identityId,
        timestamp: this.formatTime(message.createdAt),
        createdAt: message.createdAt,
      };
    });
  }

  /**
   * Search inside one conversation: message text and attachment file
   * names, skipping what this persona deleted. Newest first; the app jumps
   * between the matches.
   */
  async searchMessages(
    identityId: string,
    conversationId: string,
    rawQuery: string,
    page = 1,
    limit = 50,
  ) {
    if (!(await this.isParticipant(identityId, conversationId))) {
      throw new ForbiddenException('ليس لديك صلاحية لعرض هذه المحادثة');
    }
    const q = rawQuery?.trim() ?? '';
    if (!q) return { data: [], meta: { total: 0, page, limit } };

    const contains = { contains: q, mode: 'insensitive' as const };
    const where: Prisma.MessageWhereInput = {
      conversationId,
      hiddenFor: { none: { identityId } },
      OR: [
        { content: contains },
        { attachments: { some: { fileName: contains } } },
      ],
    };
    const [matches, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, createdAt: true },
      }),
      this.prisma.message.count({ where }),
    ]);
    return { data: matches, meta: { total, page, limit } };
  }

  /** "حذف لدي": hide a message for this persona only. */
  async hideMessage(identityId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      select: { conversationId: true },
    });
    if (
      !message ||
      !(await this.isParticipant(identityId, message.conversationId))
    ) {
      throw new NotFoundException('الرسالة غير موجودة');
    }
    await this.prisma.messageHidden.upsert({
      where: { messageId_identityId: { messageId, identityId } },
      create: { messageId, identityId },
      update: {},
    });
    return { success: true };
  }

  // Mark conversation messages as read
  async markAsRead(identityId: string, conversationId: string) {
    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, identityId },
      data: { lastReadAt: new Date() },
    });
    return { success: true };
  }

  async isParticipant(identityId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, identityId },
      select: { id: true },
    });
    return !!participant;
  }

  // Kept for older app builds that show this string as-is; current builds
  // format createdAt on the device. 12-hour with ص/م, western digits, Kuwait
  // time (the server itself may run in UTC)
  formatTime(date: Date): string {
    return date.toLocaleTimeString('ar-KW-u-nu-latn', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kuwait',
    });
  }
}
