import type { Prisma, StoryMediaType } from '@prisma/client';

import type { StoriesMediaService } from '../../stories/stories-media.service';

// What a story reply shows of the story it quotes
export const STORY_REPLY_SELECT = {
  id: true,
  identityId: true,
  status: true,
  mediaType: true,
  mediaKey: true,
  posterKey: true,
  expiresAt: true,
  mediaDeletedAt: true,
} satisfies Prisma.StorySelect;

export type StoryReplySource = Prisma.StoryGetPayload<{
  select: typeof STORY_REPLY_SELECT;
}>;

export interface StoryReplyPreview {
  mediaType: StoryMediaType;
  // A photo itself, or a video's poster: never a playable video, so a chat
  // can't replay a story after its 24 hours. Short-lived
  thumbnailUrl: string | null;
  // Still within its 24 hours: tapping the quote can open it
  isLive: boolean;
  // Each side works out «قصتك» from this (one payload goes to both phones)
  authorIdentityId: string | null;
  // Deleted, purged or hidden by a block: the quote stays, without the clip
  unavailable: boolean;
}

/**
 * The story under a reply, or null for an ordinary message. A story its
 * author deleted disappears at once; an expired one keeps its thumbnail while
 * its row and files last (the 30-day archive).
 */
export async function presentStoryReply(
  media: Pick<StoriesMediaService, 'linksFor'>,
  message: {
    storyMediaType: StoryMediaType | null;
    story: StoryReplySource | null;
  },
  now: Date,
  { hidden = false }: { hidden?: boolean } = {},
): Promise<StoryReplyPreview | null> {
  const { storyMediaType, story } = message;
  if (!storyMediaType) return null;

  const gone =
    !story || story.status !== 'ACTIVE' || !!story.mediaDeletedAt || hidden;
  if (gone) {
    return {
      mediaType: storyMediaType,
      thumbnailUrl: null,
      isLive: false,
      authorIdentityId: story?.identityId ?? null,
      unavailable: true,
    };
  }

  const links = await media.linksFor(story, now, { afterExpiry: true });
  return {
    mediaType: storyMediaType,
    thumbnailUrl:
      story.mediaType === 'VIDEO' ? links.posterUrl : links.mediaUrl,
    isLive: story.expiresAt > now,
    authorIdentityId: story.identityId,
    unavailable: false,
  };
}
