import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * The number on the app icon: unread chat messages for the persona the
 * device is using, plus the account's unread notifications.
 */
@Injectable()
export class BadgeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Messages from others, after this persona last read, not deleted by it. */
  async unreadChatMessages(identityId: string): Promise<number> {
    const rows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "Message" m
      JOIN "ConversationParticipant" p
        ON p."conversationId" = m."conversationId"
      WHERE p."identityId" = ${identityId}
        AND m."senderIdentityId" IS DISTINCT FROM ${identityId}
        AND (p."lastReadAt" IS NULL OR m."createdAt" > p."lastReadAt")
        AND NOT EXISTS (
          SELECT 1 FROM "MessageHidden" h
          WHERE h."messageId" = m."id" AND h."identityId" = ${identityId}
        )
    `;
    return Number(rows[0]?.count ?? 0);
  }

  async countFor(
    userId: string,
    identityId?: string | null,
  ): Promise<{ count: number; chats: number; notifications: number }> {
    const [chats, notifications] = await Promise.all([
      identityId ? this.unreadChatMessages(identityId) : 0,
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { count: chats + notifications, chats, notifications };
  }
}
