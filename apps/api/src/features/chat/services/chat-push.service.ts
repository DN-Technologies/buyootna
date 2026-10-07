import { Injectable, Logger } from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PushService } from 'src/core/push/push.service';
import { ChatParticipantDisplayService } from './chat-participant-display.service';

const PREVIEW_MAX_CHARS = 100;

export interface ChatPushInput {
  conversationId: string;
  senderIdentityId: string;
  message: { type: MessageType | string; content?: string | null };
  // Personas with the conversation open right now: they see it live, so no push
  viewingIdentityIds: Set<string>;
}

/** What the notification says about a message. */
export function chatPushBody(message: ChatPushInput['message']): string {
  if (message.type === 'IMAGE') return '📷 صورة';
  if (message.type === 'PROPERTY') return '🏠 عقار';
  const text = (message.content ?? '').trim();
  return text.length > PREVIEW_MAX_CHARS
    ? `${text.slice(0, PREVIEW_MAX_CHARS)}…`
    : text;
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

      await this.push.sendToTokens(tokens, {
        title: name,
        body: chatPushBody(input.message),
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
