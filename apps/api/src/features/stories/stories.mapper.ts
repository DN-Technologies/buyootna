import { Prisma } from '@prisma/client';

import type {
  StoryAuthorDto,
  StoryViewerDto,
  StoryPropertyLinkDto,
  ViewerStoryDto,
} from './dto/story-response.dto';
import type { StoryLinks } from './stories-media.service';

/** What a story response needs from the row. */
export const STORY_SELECT = {
  id: true,
  identityId: true,
  mediaType: true,
  mediaKey: true,
  posterKey: true,
  width: true,
  height: true,
  durationMs: true,
  caption: true,
  publishedAt: true,
  expiresAt: true,
  property: {
    select: {
      id: true,
      type: true,
      category: true,
      location: true,
      images: true,
      status: true,
      identityId: true,
    },
  },
} satisfies Prisma.StorySelect;

export type StoryRow = Prisma.StoryGetPayload<{ select: typeof STORY_SELECT }>;

export const AUTHOR_SELECT = {
  id: true,
  type: true,
  companyData: {
    select: {
      name: true,
      logoUrl: true,
      isVerified: true,
      specialty: true,
      servicesHidden: true,
    },
  },
  officeData: { select: { name: true, logoUrl: true, isVerified: true } },
} satisfies Prisma.IdentitySelect;

/** What the «القصص» list shows under an author's name. */
const OFFICE_SUBTITLE = 'مكتب عقاري';

export type AuthorRow = Prisma.IdentityGetPayload<{
  select: typeof AUTHOR_SELECT;
}>;

/**
 * Who may appear as a story author: an approved company or office whose
 * account is neither disabled nor blocked (the same owner rule the other
 * feeds use).
 */
export const VISIBLE_AUTHOR_WHERE = {
  user: { isDisabled: false, isBlocked: false },
  OR: [
    { type: 'COMPANY', companyData: { status: 'APPROVED' } },
    { type: 'OFFICE', officeData: { status: 'APPROVED' } },
  ],
} satisfies Prisma.IdentityWhereInput;

/**
 * A visible author, as one account sees it: also not blocked by it, nor
 * blocking it (Guideline 1.2: a block hides the other's stories).
 */
export function visibleAuthorFor(
  viewerUserId: string,
): Prisma.IdentityWhereInput {
  return {
    ...VISIBLE_AUTHOR_WHERE,
    user: {
      ...VISIBLE_AUTHOR_WHERE.user,
      blocksMade: { none: { blockedUserId: viewerUserId } },
      blocksReceived: { none: { blockerUserId: viewerUserId } },
    },
  };
}

/** Published and not expired. Every read filters on this, cleanup or not. */
export function liveStoryWhere(now: Date): Prisma.StoryWhereInput {
  return { status: 'ACTIVE', expiresAt: { gt: now } };
}

export function toAuthorDto(author: AuthorRow): StoryAuthorDto | null {
  const data = author.companyData ?? author.officeData;
  if (!data || (author.type !== 'COMPANY' && author.type !== 'OFFICE')) {
    return null;
  }
  return {
    identityId: author.id,
    type: author.type,
    name: data.name,
    logoUrl: data.logoUrl ?? null,
    isVerified: data.isVerified,
    subtitle: authorSubtitle(author),
  };
}

/** A company's specialty (unless it hid its services), or «مكتب عقاري». */
function authorSubtitle(author: AuthorRow): string | null {
  if (author.type === 'OFFICE') return OFFICE_SUBTITLE;
  const company = author.companyData;
  if (!company || company.servicesHidden) return null;
  return company.specialty?.trim() || null;
}

/** The linked listing, only while it is still the author's and active. */
function toPropertyLink(story: StoryRow): StoryPropertyLinkDto | null {
  const p = story.property;
  if (!p || p.status !== 'ACTIVE' || p.identityId !== story.identityId) {
    return null;
  }
  return {
    id: p.id,
    type: p.type,
    category: p.category,
    location: p.location,
    coverUrl: p.images[0] ?? null,
  };
}

export function toViewerStoryDto(
  story: StoryRow,
  links: StoryLinks,
  viewed: boolean,
): ViewerStoryDto {
  return {
    id: story.id,
    mediaType: story.mediaType,
    mediaUrl: links.mediaUrl,
    posterUrl: links.posterUrl,
    urlExpiresAt: links.urlExpiresAt.toISOString(),
    width: story.width,
    height: story.height,
    durationMs: story.durationMs,
    caption: story.caption,
    property: toPropertyLink(story),
    // Only published stories are mapped
    publishedAt: (story.publishedAt ?? story.expiresAt).toISOString(),
    expiresAt: story.expiresAt.toISOString(),
    viewed,
  };
}

/** Where the viewer opens an author: the first unseen story, else the start. */
export function firstUnseenIndex(stories: { viewed: boolean }[]): number {
  const index = stories.findIndex((s) => !s.viewed);
  return index === -1 ? 0 : index;
}

/**
 * Views that count: from profiles whose account is neither disabled nor
 * blocked. The viewer list and every view count use this, so they agree.
 */
export const COUNTED_VIEW_WHERE = {
  viewer: { user: { isDisabled: false, isBlocked: false } },
} satisfies Prisma.StoryViewWhereInput;

export const VIEWER_SELECT = {
  id: true,
  type: true,
  individualData: { select: { name: true, avatarUrl: true } },
  companyData: { select: { name: true, logoUrl: true, isVerified: true } },
  officeData: { select: { name: true, logoUrl: true, isVerified: true } },
} satisfies Prisma.IdentitySelect;

export type ViewerRow = Prisma.IdentityGetPayload<{
  select: typeof VIEWER_SELECT;
}>;

export function toViewerDto(viewer: ViewerRow, viewedAt: Date): StoryViewerDto {
  const provider = viewer.companyData ?? viewer.officeData;
  return {
    identityId: viewer.id,
    type: viewer.type,
    name: provider?.name ?? viewer.individualData?.name ?? 'مستخدم',
    avatarUrl: provider?.logoUrl ?? viewer.individualData?.avatarUrl ?? null,
    isVerified: provider?.isVerified ?? false,
    viewedAt: viewedAt.toISOString(),
  };
}
