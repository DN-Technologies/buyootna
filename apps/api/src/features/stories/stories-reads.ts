import { NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../../core/prisma/prisma.service';
import type {
  AuthorStoryDto,
  MyStoriesDto,
  StoryAuthorStoriesDto,
  StoryRingsDto,
} from './dto/story-response.dto';
import type { StoriesMediaService } from './stories-media.service';
import {
  AUTHOR_SELECT,
  COUNTED_VIEW_WHERE,
  firstUnseenIndex,
  liveStoryWhere,
  STORY_SELECT,
  toAuthorDto,
  toViewerStoryDto,
  visibleAuthorFor,
} from './stories.mapper';

/** Reading stories: the author's own, one author's, one as its author sees it. */
export class StoriesReads {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: StoriesMediaService,
  ) {}

  /** The profile's own live stories, oldest first, with their view counts. */
  async findMine(identityId: string, now: Date): Promise<MyStoriesDto> {
    const rows = await this.prisma.story.findMany({
      where: { identityId, ...liveStoryWhere(now) },
      select: STORY_SELECT,
      orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }],
    });
    const counts = rows.length
      ? await this.prisma.storyView.groupBy({
          by: ['storyId'],
          where: {
            storyId: { in: rows.map((r) => r.id) },
            ...COUNTED_VIEW_WHERE,
          },
          _count: { _all: true },
        })
      : [];
    const countOf = new Map(counts.map((c) => [c.storyId, c._count._all]));

    const stories = await Promise.all(
      rows.map(async (row) => ({
        ...toViewerStoryDto(row, await this.media.linksFor(row, now), true),
        viewCount: countOf.get(row.id) ?? 0,
      })),
    );
    return { stories };
  }

  /**
   * The rings to draw around these profiles' logos in a list. Two queries
   * however many profiles, and no signed media links: nothing here is played.
   * Hidden or blocked authors simply have no ring, as they have no stories.
   */
  async findRings(
    viewer: { identityId: string; userId: string },
    authorIds: string[],
    now: Date,
  ): Promise<StoryRingsDto> {
    const rows = await this.prisma.story.findMany({
      where: {
        identityId: { in: authorIds },
        ...liveStoryWhere(now),
        identity: visibleAuthorFor(viewer.userId),
      },
      select: { id: true, identityId: true },
    });
    if (rows.length === 0) return { rings: [] };

    const views = await this.prisma.storyView.findMany({
      where: {
        viewerIdentityId: viewer.identityId,
        storyId: { in: rows.map((r) => r.id) },
      },
      select: { storyId: true },
    });
    const seen = new Set(views.map((v) => v.storyId));

    const byAuthor = new Map<string, { seen: number; unseen: number }>();
    for (const row of rows) {
      const counts = byAuthor.get(row.identityId) ?? { seen: 0, unseen: 0 };
      if (seen.has(row.id)) counts.seen += 1;
      else counts.unseen += 1;
      byAuthor.set(row.identityId, counts);
    }
    return {
      rings: [...byAuthor].map(([identityId, counts]) => ({
        identityId,
        hasUnseen: counts.unseen > 0,
        partial: counts.unseen > 0 && counts.seen > 0,
      })),
    };
  }

  /**
   * One author's live stories, as the viewing profile sees them. An author
   * whose account blocked the viewer's, or that it blocked, is 404.
   */
  async findByAuthor(
    viewer: { identityId: string; userId: string },
    authorId: string,
    now: Date,
  ): Promise<StoryAuthorStoriesDto> {
    const viewerIdentityId = viewer.identityId;
    const author = await this.prisma.identity.findFirst({
      where: { id: authorId, ...visibleAuthorFor(viewer.userId) },
      select: AUTHOR_SELECT,
    });
    const authorDto = author ? toAuthorDto(author) : null;
    if (!authorDto) throw new NotFoundException('الحساب غير موجود');

    const rows = await this.prisma.story.findMany({
      where: { identityId: authorId, ...liveStoryWhere(now) },
      select: STORY_SELECT,
      orderBy: [{ publishedAt: 'asc' }, { id: 'asc' }],
    });
    const [views, follow] = await Promise.all([
      rows.length
        ? this.prisma.storyView.findMany({
            where: {
              viewerIdentityId,
              storyId: { in: rows.map((r) => r.id) },
            },
            select: { storyId: true },
          })
        : Promise.resolve<{ storyId: string }[]>([]),
      this.prisma.providerFavorite.findUnique({
        where: {
          identityId_providerId: {
            identityId: viewerIdentityId,
            providerId: authorId,
          },
        },
        select: { id: true },
      }),
    ]);
    const seen = new Set(views.map((v) => v.storyId));

    const stories = await Promise.all(
      rows.map(async (row) =>
        toViewerStoryDto(
          row,
          await this.media.linksFor(row, now),
          seen.has(row.id),
        ),
      ),
    );
    return {
      author: authorDto,
      followed: !!follow,
      hasUnseen: stories.some((s) => !s.viewed),
      firstUnseenIndex: firstUnseenIndex(stories),
      stories,
    };
  }

  /** The author's view of one of its stories. */
  async authorView(id: string, now: Date): Promise<AuthorStoryDto> {
    const row = await this.prisma.story.findUniqueOrThrow({
      where: { id },
      select: STORY_SELECT,
    });
    const viewCount = await this.prisma.storyView.count({
      where: { storyId: id, ...COUNTED_VIEW_WHERE },
    });
    return {
      ...toViewerStoryDto(row, await this.media.linksFor(row, now), true),
      viewCount,
    };
  }
}
