import { Injectable, Logger } from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PushService } from 'src/core/push/push.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';
import {
  LISTING_TYPE_LABELS,
  PROPERTY_CATEGORY_LABELS,
} from '../../properties/services/property-formatting.util';

const PREVIEW_MAX_CHARS = 100;
// The custom Buyootna tone and its Android channel (created by the app);
// builds without them fall back to the default sound / channel
export const CHAT_PUSH_SOUND = 'buyootna_message.wav';
export const CHAT_PUSH_CHANNEL = 'chat-messages';

export interface ChatPushInput {
  conversationId: string;
  senderIdentityId: string;
  message: {
    type: MessageType | string;
    content?: string | null;
    attachments?: { kind: string; fileName: string }[];
  };
  // Personas with the conversation open right now: they see it live, so no push
  viewingIdentityIds: Set<string>;
}

/** "عمارة للبيع" for the ad a conversation started from. */
export function propertyTitle(
  property?: {
    category: string;
    type: string;
  } | null,
): string | null {
  if (!property) return null;
  const category =
    PROPERTY_CATEGORY_LABELS[
      property.category as keyof typeof PROPERTY_CATEGORY_LABELS
    ] || 'عقار';
  const type = LISTING_TYPE_LABELS[property.type];
  return type ? `${category} ${type}` : category;
}

/**
 * What the notification says about a message, led by the ad's title when
 * the chat came from one: "عمارة للبيع · هاي".
 */
export function chatPushBody(
  message: ChatPushInput['message'],
  property?: string | null,
): string {
  let preview: string;
  const files = message.attachments ?? [];
  const document = files.find((a) => a.kind === 'FILE');
  if (document) preview = `📎 ${document.fileName}`;
  else if (files.length > 1) preview = `📷 ${files.length} صور`;
  else if (message.type === 'IMAGE') preview = '📷 صورة';
  else if (message.type === 'PROPERTY') preview = '🏠 عقار';
  else {
    const text = (message.content ?? '').trim();
    preview =
      text.length > PREVIEW_MAX_CHARS
        ? `${text.slice(0, PREVIEW_MAX_CHARS)}…`
        : text;
  }
  return property ? `${property} · ${preview}` : preview;
}

/**
 * Pushes a new chat message to the other participants' devices. Only devices
 * currently using the recipient persona get it (a device on another persona
 * of the same account doesn't, like the inbox), an account that turned app
 * notifications off is skipped, and so is anyone already looking at the
 * conversation. Best-effort: never throws.
 */
@Injectable()
export class ChatPushService {
  private readonly logger = new Logger(ChatPushService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: PushService,
    private readonly display: ChatParticipantDisplayService,
  ) {}

  async notifyRecipients(input: ChatPushInput): Promise<void> {
    try {
      const participants = await this.prisma.conversationParticipant.findMany({
        where: { conversationId: input.conversationId },
        select: { identityId: true },
      });
      const recipientIds = participants
        .map((p) => p.identityId)
        .filter(
          (id) =>
            id !== input.senderIdentityId && !input.viewingIdentityIds.has(id),
        );
      if (recipientIds.length === 0) return;

      const sessions = await this.prisma.session.findMany({
        where: {
          activeIdentityId: { in: recipientIds },
          isActive: true,
          pushToken: { not: null },
          user: {
            OR: [
              { notifPreferences: { is: null } },
              { notifPreferences: { is: { appEnabled: true } } },
            ],
          },
        },
        select: { pushToken: true },
      });
      const tokens = sessions
        .map((s) => s.pushToken)
        .filter((t): t is string => !!t);
      if (tokens.length === 0) return;

      const sender = await this.prisma.identity.findUnique({
        where: { id: input.senderIdentityId },
        select: {
          userId: true,
          individualData: { select: { name: true, avatarUrl: true } },
          companyData: { select: { name: true, logoUrl: true } },
          officeData: { select: { name: true, logoUrl: true } },
          user: { select: { name: true, avatarUrl: true } },
        },
      });
      const { name } = await this.display.resolve(
        sender ? { userId: sender.userId, identity: sender } : undefined,
      );

      // Name the ad when the chat came from one
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: input.conversationId },
        select: { property: { select: { category: true, type: true } } },
      });

      await this.push.sendToTokens(tokens, {
        title: name,
        body: chatPushBody(
          input.message,
          propertyTitle(conversation?.property),
        ),
        sound: CHAT_PUSH_SOUND,
        channelId: CHAT_PUSH_CHANNEL,
        data: {
          type: 'CHAT_MESSAGE',
          conversationId: input.conversationId,
          route: `/chat/${input.conversationId}`,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Chat push failed for conversation ${input.conversationId}: ${String(error)}`,
      );
    }
  }
}
