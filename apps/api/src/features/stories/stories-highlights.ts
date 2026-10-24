import type { Prisma } from '@prisma/client';

import { assertCleanContent } from '../../core/content-filter/content-filter';
import type { PrismaService } from '../../core/prisma/prisma.service';
import { assertApprovedProvider } from '../identities/persona-rules';
import type {
  AuthorStoryDto,
  StoryArchiveDto,
  StoryHighlightDto,
  StoryHighlightsDto,
} from './dto/story-response.dto';
import type {
  CreateStoryHighlightDto,
  UpdateStoryHighlightDto,
} from './dto/story-highlight.dto';
import type { StoriesMediaService } from './stories-media.service';
import {
  STORY_ARCHIVE_MS,
  STORY_ARCHIVE_PAGE,
  STORY_HIGHLIGHTS_MAX,
} from './stories.constants';
import {
  highlightLimitReached,
  highlightNotFound,
  highlightOrderInvalid,
  highlightStoriesInvalid,
  publisherOnly,
} from './stories.errors';
import {
  COUNTED_VIEW_WHERE,
  STORY_SELECT,
  type StoryRow,
  toViewerStoryDto,
  visibleAuthorFor,
} from './stories.mapper';

const HIGHLIGHT_SELECT = {
  id: true,
  title: true,
  coverStoryId: true,
  items: {
    // Deleted (or removed by a moderator) stories leave every highlight
    where: { story: { status: 'ACTIVE' } },
    orderBy: { position: 'asc' },
    select: { story: { select: STORY_SELECT } },
  },
} satisfies Prisma.StoryHighlightSelect;

type HighlightRow = Prisma.StoryHighlightGetPayload<{
  select: typeof HIGHLIGHT_SELECT;
}>;

/** An archive page's place: the last story's publish time and id. */
function encodeCursor(row: { publishedAt: Date | null; id: string }) {
  const at = (row.publishedAt ?? new Date(0)).toISOString();
  return Buffer.from(`${at}|${row.id}`).toString('base64url');
}

function decodeCursor(cursor?: string): { at: Date; id: string } | null {
  if (!cursor) return null;
  const [at, id] = Buffer.from(cursor, 'base64url').toString().split('|');
  const date = new Date(at);
  return id && !Number.isNaN(date.getTime()) ? { at: date, id } : null;
}

/**
 * The author's archive and highlights (المميزة). The archive is its own
 * stories of the last 30 days, live and past, for it alone; a highlight
 * keeps chosen ones on its profile beyond that, until taken out.
 */
export class StoriesHighlights {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: StoriesMediaService,
  ) {}

  /** The author's stories of the last 30 days, newest first, paged. */
  async archive(
    identityId: string,
    cursor: string | undefined,
    now: Date,
  ): Promise<StoryArchiveDto> {
    const after = decodeCursor(cursor);
    const rows = await this.prisma.story.findMany({
      where: {
        identityId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date(now.getTime() - STORY_ARCHIVE_MS) },
        ...(after
          ? {
              OR: [
                { publishedAt: { lt: after.at } },
                { publishedAt: after.at, id: { lt: after.id } },
              ],
            }
          : {}),
      },
      select: STORY_SELECT,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: STORY_ARCHIVE_PAGE + 1,
    });
    const page = rows.slice(0, STORY_ARCHIVE_PAGE);
    const counts = page.length
      ? await this.prisma.storyView.groupBy({
          by: ['storyId'],
          where: {
            storyId: { in: page.map((r) => r.id) },
            ...COUNTED_VIEW_WHERE,
          },
          _count: { _all: true },
        })
      : [];
    const countOf = new Map(counts.map((c) => [c.storyId, c._count._all]));
    const stories: AuthorStoryDto[] = await Promise.all(
      page.map(async (row) => ({
        ...toViewerStoryDto(row, await this.linksFor(row, now), true),
        viewCount: countOf.get(row.id) ?? 0,
      })),
    );
    return {
      stories,
      nextCursor:
        rows.length > STORY_ARCHIVE_PAGE
          ? encodeCursor(page[page.length - 1])
          : null,
    };
  }

  /** The author's own highlights, empty ones included (to fill them). */
  async mine(identityId: string, now: Date): Promise<StoryHighlightsDto> {
    const rows = await this.prisma.storyHighlight.findMany({
      where: { identityId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: HIGHLIGHT_SELECT,
    });
    return {
      highlights: await Promise.all(rows.map((r) => this.toDto(r, now))),
    };
  }

  /**
   * A company's or office's highlights as a viewer sees them: none for an
   * author that isn't visible to it (blocked either way, disabled), and
   * none that are empty.
   */
  async byAuthor(
    viewerUserId: string,
    authorId: string,
    now: Date,
  ): Promise<StoryHighlightsDto> {
    const author = await this.prisma.identity.findFirst({
      where: { id: authorId, ...visibleAuthorFor(viewerUserId) },
      select: { id: true },
    });
    if (!author) return { highlights: [] };
    const rows = await this.prisma.storyHighlight.findMany({
      where: { identityId: authorId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: HIGHLIGHT_SELECT,
    });
    const shown = rows.filter((r) => r.items.length > 0);
    return {
      highlights: await Promise.all(shown.map((r) => this.toDto(r, now))),
    };
  }

  async create(
    identityId: string,
    dto: CreateStoryHighlightDto,
    now: Date,
  ): Promise<StoryHighlightDto> {
    await this.assertCanCurate(identityId);
    assertCleanContent(dto.title);
    const count = await this.prisma.storyHighlight.count({
      where: { identityId },
    });
    if (count >= STORY_HIGHLIGHTS_MAX) throw highlightLimitReached();
    await this.assertOwnStories(identityId, dto.storyIds, now);

    const created = await this.prisma.storyHighlight.create({
      data: {
        identityId,
        title: dto.title,
        // At the end of the row
        position: count,
        items: {
          create: dto.storyIds.map((storyId, position) => ({
            storyId,
            position,
          })),
        },
      },
      select: HIGHLIGHT_SELECT,
    });
    return this.toDto(created, now);
  }

  async update(
    identityId: string,
    id: string,
    dto: UpdateStoryHighlightDto,
    now: Date,
  ): Promise<StoryHighlightDto> {
    await this.assertCanCurate(identityId);
    const highlight = await this.findOwn(identityId, id);
    if (dto.title !== undefined) assertCleanContent(dto.title);
    if (dto.storyIds) {
      await this.assertOwnStories(identityId, dto.storyIds, now);
    }
    const storyIds =
      dto.storyIds ?? highlight.items.map((item) => item.storyId);
    if (dto.coverStoryId && !storyIds.includes(dto.coverStoryId)) {
      throw highlightStoriesInvalid();
    }
    // A cover that left the highlight goes back to its first story
    const coverStoryId =
      dto.coverStoryId !== undefined
        ? dto.coverStoryId
        : highlight.coverStoryId && storyIds.includes(highlight.coverStoryId)
          ? highlight.coverStoryId
          : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.storyIds) {
        await tx.storyHighlightItem.deleteMany({ where: { highlightId: id } });
        await tx.storyHighlightItem.createMany({
          data: dto.storyIds.map((storyId, position) => ({
            highlightId: id,
            storyId,
            position,
          })),
        });
      }
      return tx.storyHighlight.update({
        where: { id },
        data: {
          ...(dto.title !== undefined ? { title: dto.title } : {}),
          coverStoryId,
        },
        select: HIGHLIGHT_SELECT,
      });
    });
    return this.toDto(updated, now);
  }

  async remove(identityId: string, id: string): Promise<void> {
    await this.findOwn(identityId, id);
    await this.prisma.storyHighlight.delete({ where: { id } });
  }

  /** `ids` is every one of the author's highlights, in their new order. */
  async reorder(identityId: string, ids: string[]): Promise<void> {
    const own = await this.prisma.storyHighlight.findMany({
      where: { identityId },
      select: { id: true },
    });
    const ownIds = new Set(own.map((h) => h.id));
    if (ids.length !== ownIds.size || ids.some((id) => !ownIds.has(id))) {
      throw highlightOrderInvalid();
    }
    await this.prisma.$transaction(
      ids.map((id, position) =>
        this.prisma.storyHighlight.update({
          where: { id },
          data: { position },
        }),
      ),
    );
  }

  /** Approved companies and offices; no running plan needed to curate. */
  private async assertCanCurate(identityId: string) {
    const identity = await this.prisma.identity.findUnique({
      where: { id: identityId },
      select: { type: true },
    });
    if (identity?.type !== 'COMPANY' && identity?.type !== 'OFFICE') {
      throw publisherOnly();
    }
    await assertApprovedProvider(this.prisma, identityId);
  }

  private async findOwn(identityId: string, id: string) {
    const highlight = await this.prisma.storyHighlight.findFirst({
      where: { id, identityId },
      select: {
        id: true,
        coverStoryId: true,
        items: { select: { storyId: true } },
      },
    });
    if (!highlight) throw highlightNotFound();
    return highlight;
  }

  /**
   * Every story is the author's own and published, and still in its
   * archive (the last 30 days) or already kept in one of its highlights.
   */
  private async assertOwnStories(
    identityId: string,
    storyIds: string[],
    now: Date,
  ) {
    const found = await this.prisma.story.count({
      where: {
        id: { in: storyIds },
        identityId,
        status: 'ACTIVE',
        OR: [
          { expiresAt: { gt: new Date(now.getTime() - STORY_ARCHIVE_MS) } },
          { highlightItems: { some: { highlight: { identityId } } } },
        ],
      },
    });
    if (found !== storyIds.length) throw highlightStoriesInvalid();
  }

  /** Live stories as today; past ones (archive, highlight) 15 minutes. */
  private linksFor(row: StoryRow, now: Date) {
    return this.media.linksFor(row, now, {
      afterExpiry: row.expiresAt <= now,
    });
  }

  private async toDto(
    row: HighlightRow,
    now: Date,
  ): Promise<StoryHighlightDto> {
    const stories = await Promise.all(
      row.items.map(async ({ story }) => ({
        row: story,
        dto: toViewerStoryDto(story, await this.linksFor(story, now), true),
      })),
    );
    const cover =
      stories.find((s) => s.row.id === row.coverStoryId) ?? stories[0];
    return {
      id: row.id,
      title: row.title,
      coverStoryId: cover?.row.id ?? null,
      coverUrl: cover
        ? (cover.dto.posterUrl ??
          (cover.dto.mediaType === 'IMAGE' ? cover.dto.mediaUrl : null))
        : null,
      stories: stories.map((s) => s.dto),
    };
  }
}
