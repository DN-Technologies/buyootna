import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { assertCleanContent } from '../../core/content-filter/content-filter';
import { PrismaService } from '../../core/prisma/prisma.service';
import { notBlockedUserWhere } from '../blocks/block.rules';
import { lockKeys } from '../identities/persona-rules';
import { NotificationsService } from '../notifications/notifications.service';
import { toViewerDto, VIEWER_SELECT } from '../stories/stories.mapper';
import type { ReelCommentDto, ReelCommentsDto } from './dto/reel-comment.dto';
import type { ReelViewer } from './reels-feed.service';
import {
  REEL_COMMENT_HOURLY_LIMIT,
  REEL_COMMENTS_PAGE,
} from './reels.constants';
import {
  commentLimitReached,
  commentNotFound,
  commentsOff,
  reelNotFound,
} from './reels.errors';
import { visibleReelAuthor } from './reels.mapper';
import { removeReelComment } from './reels.rules';
import { decodeReelCursor, encodeReelCursor } from './utils/reel-cursor';

const HOUR_MS = 60 * 60 * 1000;

const COMMENT_SELECT = {
  id: true,
  body: true,
  createdAt: true,
  identityId: true,
  identity: { select: VIEWER_SELECT },
} satisfies Prisma.ReelCommentSelect;

type CommentRow = Prisma.ReelCommentGetPayload<{
  select: typeof COMMENT_SELECT;
}>;

/**
 * Comments on reels. Public text, so (App Store Guideline 1.2) new ones pass
 * the content filter, each can be reported (ReportsService), and anything from
 * a disabled account or across a block in either direction stays hidden.
 */
@Injectable()
export class ReelsCommentsService {
  private readonly logger = new Logger(ReelsCommentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** A reel this caller may see, or 404. */
  private async visibleReel(id: string, viewer: ReelViewer | null) {
    const reel = await this.prisma.reel.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        identity: visibleReelAuthor(viewer?.userId),
      },
      select: {
        id: true,
        identityId: true,
        commentsEnabled: true,
        identity: { select: { userId: true } },
      },
    });
    if (!reel) throw reelNotFound();
    return reel;
  }

  /** Newest first. Comments turned off show none, and aren't lost. */
  async list(
    reelId: string,
    viewer: ReelViewer | null,
    cursorRaw: string | undefined,
    now = new Date(),
  ): Promise<ReelCommentsDto> {
    const reel = await this.visibleReel(reelId, viewer);
    if (!reel.commentsEnabled) return { comments: [], nextCursor: null };

    const cursor = cursorRaw ? decodeReelCursor(cursorRaw, now) : null;
    const rows = await this.prisma.reelComment.findMany({
      where: {
        reelId,
        identity: {
          user: {
            isDisabled: false,
            isBlocked: false,
            ...(viewer ? notBlockedUserWhere(viewer.userId) : {}),
          },
        },
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: cursor.publishedAt } },
                { createdAt: cursor.publishedAt, id: { lt: cursor.id } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: REEL_COMMENTS_PAGE + 1,
      select: COMMENT_SELECT,
    });
    const page = rows.slice(0, REEL_COMMENTS_PAGE);
    const last = page[page.length - 1];
    return {
      comments: page.map((row) => this.toDto(row, reel.identityId, viewer)),
      nextCursor:
        rows.length > REEL_COMMENTS_PAGE && last
          ? encodeReelCursor({
              snapshotAt: cursor?.snapshotAt ?? now,
              tier: 0,
              publishedAt: last.createdAt,
              id: last.id,
            })
          : null,
    };
  }

  /**
   * Adds a comment, within 20 an hour per profile. The count and the insert
   * happen under the profile's lock, so simultaneous requests can't pass it.
   */
  async create(
    reelId: string,
    viewer: ReelViewer,
    body: string,
    now = new Date(),
  ): Promise<ReelCommentDto> {
    const reel = await this.visibleReel(reelId, viewer);
    if (!reel.commentsEnabled) throw commentsOff();
    assertCleanContent(body);

    const row = await this.prisma.$transaction(async (tx) => {
      await lockKeys(tx, `reel-comment:${viewer.identityId}`);
      const recent = await tx.reelComment.count({
        where: {
          identityId: viewer.identityId,
          createdAt: { gt: new Date(now.getTime() - HOUR_MS) },
        },
      });
      if (recent >= REEL_COMMENT_HOURLY_LIMIT) throw commentLimitReached();
      const created = await tx.reelComment.create({
        data: {
          reelId,
          identityId: viewer.identityId,
          body,
          createdAt: now,
        },
        select: COMMENT_SELECT,
      });
      await tx.reel.update({
        where: { id: reelId },
        data: { commentCount: { increment: 1 } },
      });
      return created;
    });

    if (reel.identity.userId !== viewer.userId) {
      void this.notifyAuthor(reel, row);
    }
    return this.toDto(row, reel.identityId, viewer);
  }

  /** The commenter's own, or any on the caller's reel. Repeating is harmless. */
  async remove(commentId: string, viewer: ReelViewer): Promise<void> {
    const comment = await this.prisma.reelComment.findUnique({
      where: { id: commentId },
      select: {
        reelId: true,
        identityId: true,
        reel: { select: { identityId: true } },
      },
    });
    if (!comment) return;
    const allowed =
      comment.identityId === viewer.identityId ||
      comment.reel.identityId === viewer.identityId;
    if (!allowed) throw commentNotFound();
    await removeReelComment(this.prisma, commentId, comment.reelId);
  }

  /** The author turns comments on or off for one of its reels. */
  async setEnabled(
    reelId: string,
    identityId: string,
    commentsEnabled: boolean,
  ): Promise<{ commentsEnabled: boolean }> {
    const { count } = await this.prisma.reel.updateMany({
      where: { id: reelId, identityId, status: 'ACTIVE' },
      data: { commentsEnabled },
    });
    if (count === 0) throw reelNotFound();
    return { commentsEnabled };
  }

  private toDto(
    row: CommentRow,
    reelAuthorId: string,
    viewer: ReelViewer | null,
  ): ReelCommentDto {
    const person = toViewerDto(row.identity, row.createdAt);
    const mine = !!viewer && row.identityId === viewer.identityId;
    return {
      id: row.id,
      body: row.body,
      createdAt: row.createdAt.toISOString(),
      author: {
        identityId: person.identityId,
        type: person.type,
        name: person.name,
        avatarUrl: person.avatarUrl,
        isVerified: person.isVerified,
      },
      mine,
      canDelete: mine || viewer?.identityId === reelAuthorId,
    };
  }

  /** Best effort: a comment must not fail because its notification did. */
  private async notifyAuthor(
    reel: { id: string; identityId: string; identity: { userId: string } },
    comment: CommentRow,
  ): Promise<void> {
    try {
      const name = toViewerDto(comment.identity, comment.createdAt).name;
      await this.notifications.create({
        userId: reel.identity.userId,
        identityId: reel.identityId,
        type: 'REEL_COMMENT',
        title: 'تعليق جديد على الفيديو',
        body: `${name}: ${comment.body.slice(0, 80)}`,
        data: { reelId: reel.id, commentId: comment.id },
      });
    } catch (error) {
      this.logger.warn(`Comment notification failed: ${String(error)}`);
    }
  }
}
