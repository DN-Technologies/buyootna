import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/core/prisma/prisma.service';

/**
 * How far a persona has received / read a conversation. The sender's ticks
 * come from the other participant's two timestamps: a message is delivered
 * when createdAt <= lastDeliveredAt and read when createdAt <= lastReadAt.
 */
export interface ConversationReceipt {
  conversationId: string;
  // Whose receipt this is (the reader), and who should hear about it
  identityId: string;
  lastDeliveredAt: Date | null;
  lastReadAt: Date | null;
  notifyIdentityIds: string[];
}

/** The other participant's receipt, as the app gets it. */
export function receiptOf(
  participant?: {
    lastDeliveredAt: Date | null;
    lastReadAt: Date | null;
  } | null,
) {
  if (!participant) return null;
  // Reading implies delivery
  const delivered =
    participant.lastReadAt &&
    (!participant.lastDeliveredAt ||
      participant.lastReadAt > participant.lastDeliveredAt)
      ? participant.lastReadAt
      : participant.lastDeliveredAt;
  return { lastDeliveredAt: delivered, lastReadAt: participant.lastReadAt };
}

@Injectable()
export class ChatReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  private async others(conversationId: string, identityId: string) {
    const rows = await this.prisma.conversationParticipant.findMany({
      where: { conversationId, identityId: { not: identityId } },
      select: { identityId: true },
    });
    return rows.map((r) => r.identityId);
  }

  /** The persona opened the conversation: everything so far is read. */
  async markRead(
    identityId: string,
    conversationId: string,
    now = new Date(),
  ): Promise<ConversationReceipt | null> {
    const { count } = await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, identityId },
      data: { lastReadAt: now, lastDeliveredAt: now },
    });
    if (!count) return null;
    return {
      conversationId,
      identityId,
      lastDeliveredAt: now,
      lastReadAt: now,
      notifyIdentityIds: await this.others(conversationId, identityId),
    };
  }

  /**
   * The persona's app is online (connected / loaded its chats): messages
   * waiting for it in any conversation are now delivered. Returns a receipt
   * per conversation that changed.
   */
  async markDelivered(
    identityId: string,
    now = new Date(),
  ): Promise<ConversationReceipt[]> {
    const waiting = await this.prisma.$queryRaw<{ conversationId: string }[]>`
      SELECT p."conversationId"
      FROM "ConversationParticipant" p
      WHERE p."identityId" = ${identityId}
        AND EXISTS (
          SELECT 1 FROM "Message" m
          WHERE m."conversationId" = p."conversationId"
            AND m."senderIdentityId" IS DISTINCT FROM ${identityId}
            AND (p."lastDeliveredAt" IS NULL OR m."createdAt" > p."lastDeliveredAt")
        )
    `;
    const conversationIds = waiting.map((w) => w.conversationId);
    return this.deliver(identityId, conversationIds, now);
  }

  /**
   * A message was just sent in this conversation: it's delivered to the
   * recipients whose app is connected right now.
   */
  async markDeliveredTo(
    connectedIdentityIds: string[],
    conversationId: string,
    now = new Date(),
  ): Promise<ConversationReceipt[]> {
    const receipts: ConversationReceipt[] = [];
    for (const identityId of connectedIdentityIds) {
      receipts.push(...(await this.deliver(identityId, [conversationId], now)));
    }
    return receipts;
  }

  private async deliver(
    identityId: string,
    conversationIds: string[],
    now: Date,
  ): Promise<ConversationReceipt[]> {
    if (conversationIds.length === 0) return [];
    await this.prisma.conversationParticipant.updateMany({
      where: { identityId, conversationId: { in: conversationIds } },
      data: { lastDeliveredAt: now },
    });
    const rows = await this.prisma.conversationParticipant.findMany({
      where: { conversationId: { in: conversationIds } },
      select: { conversationId: true, identityId: true, lastReadAt: true },
    });
    return conversationIds.map((conversationId) => {
      const inConversation = rows.filter(
        (r) => r.conversationId === conversationId,
      );
      return {
        conversationId,
        identityId,
        lastDeliveredAt: now,
        lastReadAt:
          inConversation.find((r) => r.identityId === identityId)?.lastReadAt ??
          null,
        notifyIdentityIds: inConversation
          .map((r) => r.identityId)
          .filter((id) => id !== identityId),
      };
    });
  }
}
