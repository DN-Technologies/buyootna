import { NotFoundException } from '@nestjs/common';

import type { PrismaService } from '../../core/prisma/prisma.service';
import type {
  AuthorStoryDto,
  MyStoriesDto,
  StoryAuthorStoriesDto,
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
