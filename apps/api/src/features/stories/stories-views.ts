import type { PrismaService } from '../../core/prisma/prisma.service';
import { RecordStoryViewsDto } from './dto/record-story-views.dto';
import type { StoryViewersDto } from './dto/story-response.dto';
import { StoryViewersQueryDto } from './dto/story-viewers-query.dto';
import { STORY_VIEWERS_DEFAULT_LIMIT } from './stories.constants';
import { storyNotFound } from './stories.errors';
import {
  COUNTED_VIEW_WHERE,
  liveStoryWhere,
  toViewerDto,
  VIEWER_SELECT,
  visibleAuthorFor,
} from './stories.mapper';
import {
  decodeViewersCursor,
  encodeViewersCursor,
} from './utils/viewers-cursor';

/** Views: recording them, and the author's list of who viewed. */
export class StoriesViews {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records that the viewing profile watched these stories. One view per
   * profile and story (the first is kept), so repeating it changes nothing.
   * Only live stories of authors the viewer may see count, and never the
   * viewer's own account's stories (any of its profiles). Anything else in
   * the batch is skipped without an error.
   */
  async record(
    viewer: { identityId: string; userId: string },
    dto: RecordStoryViewsDto,
    now: Date,
  ): Promise<void> {
    const stories = await this.prisma.story.findMany({
      where: {
        id: { in: dto.storyIds },
        ...liveStoryWhere(now),
        identity: {
          ...visibleAuthorFor(viewer.userId),
          userId: { not: viewer.userId },
        },
      },
      select: { id: true },
    });
    if (stories.length === 0) return;
    await this.prisma.storyView.createMany({
      data: stories.map((s) => ({
        storyId: s.id,
        viewerIdentityId: viewer.identityId,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Who viewed one of the author's stories, newest first. The author only
   * (anyone else gets 404); viewers whose account is disabled or blocked
   * are left out of the list and the total. Kept while the story's row
   * exists, then deleted with it.
   */
  async viewers(
    id: string,
    identityId: string,
    query: StoryViewersQueryDto,
  ): Promise<StoryViewersDto> {
    const story = await this.prisma.story.findUnique({
      where: { id },
      select: { identityId: true, status: true },
    });
    if (
      !story ||
      story.identityId !== identityId ||
      story.status !== 'ACTIVE'
    ) {
      throw storyNotFound();
    }

    const limit = query.limit ?? STORY_VIEWERS_DEFAULT_LIMIT;
    const cursor = query.cursor ? decodeViewersCursor(query.cursor) : null;
    const [rows, total] = await Promise.all([
      this.prisma.storyView.findMany({
        where: {
          storyId: id,
          ...COUNTED_VIEW_WHERE,
          ...(cursor
            ? {
                OR: [
                  { viewedAt: { lt: cursor.viewedAt } },
                  {
                    viewedAt: cursor.viewedAt,
                    viewerIdentityId: { gt: cursor.viewerIdentityId },
                  },
                ],
              }
            : {}),
        },
        orderBy: [{ viewedAt: 'desc' }, { viewerIdentityId: 'asc' }],
        take: limit + 1,
        select: { viewedAt: true, viewer: { select: VIEWER_SELECT } },
      }),
      this.prisma.storyView.count({
        where: { storyId: id, ...COUNTED_VIEW_WHERE },
      }),
    ]);
    const page = rows.slice(0, limit);
    const last = page[page.length - 1];
    return {
      total,
      viewers: page.map((r) => toViewerDto(r.viewer, r.viewedAt)),
      nextCursor:
        rows.length > limit && last
          ? encodeViewersCursor({
              viewedAt: last.viewedAt,
              viewerIdentityId: last.viewer.id,
            })
          : null,
    };
  }
}
