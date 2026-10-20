import { useCallback, useMemo } from 'react';

import { useIdentity } from '@/shared/hooks/auth/useIdentity';

import type { StoryAuthorStories } from '../types';
import { useAuthorStories, useMyStories, useStoriesFeed } from './useStoriesQueries';

export type StoryViewerSourceKind = 'feed' | 'author' | 'mine';

export interface StoryViewerSource {
  // The authors to page through, each with at least one story
  authors: StoryAuthorStories[];
  counts: number[];
  loading: boolean;
  fetched: boolean;
  // Fresh links (and the latest list) from wherever the stories came from
  refetch: () => void;
  // The author's own stories: how many saw each one
  viewCountOf: (storyId: string) => number;
  refetchMine: () => Promise<unknown>;
}

/**
 * Where the viewer's stories come from: the tray's feed (swiping on to the
 * next authors), one author's profile, or the author's own stories
 * («قصتك», shown under its own name and logo).
 */
export function useStoryViewerSource(
  authorId: string,
  source: StoryViewerSourceKind,
): StoryViewerSource {
  const isMine = source === 'mine';
  const me = useIdentity();
  const mine = useMyStories(isMine);
  const feed = useStoriesFeed();
  const inFeed =
    source === 'feed' &&
    feed.authors.some((a) => a.author.identityId === authorId);
  const single = useAuthorStories(authorId, !inFeed && !isMine);

  const authors = useMemo<StoryAuthorStories[]>(() => {
    if (isMine) {
      const stories = mine.data?.stories ?? [];
      const type = me.activeIdentity?.type;
      if (stories.length === 0 || (type !== 'COMPANY' && type !== 'OFFICE')) {
        return [];
      }
      return [
        {
          author: {
            identityId: me.activeIdentity?.id ?? authorId,
            type,
            name: me.displayName,
            logoUrl: me.avatarUrl ?? null,
            isVerified: !!me.isVerified,
          },
          followed: false,
          hasUnseen: false,
          firstUnseenIndex: 0,
          stories,
        },
      ];
    }
    if (inFeed) return feed.authors.filter((a) => a.stories.length > 0);
    return single.data && single.data.stories.length > 0 ? [single.data] : [];
  }, [isMine, mine.data, me.activeIdentity, me.displayName, me.avatarUrl, me.isVerified, authorId, inFeed, feed.authors, single.data]);

  const counts = useMemo(() => authors.map((a) => a.stories.length), [authors]);

  const { refetch: refetchMine } = mine;
  const { refetch: refetchFeed } = feed;
  const { refetch: refetchSingle } = single;
  const refetch = useCallback(() => {
    void (isMine ? refetchMine() : inFeed ? refetchFeed() : refetchSingle());
  }, [isMine, inFeed, refetchMine, refetchFeed, refetchSingle]);

  return {
    authors,
    counts,
    loading: isMine ? mine.isLoading : inFeed ? false : single.isLoading,
    fetched: isMine ? mine.isFetched : inFeed || single.isFetched,
    refetch,
    viewCountOf: (storyId) =>
      mine.data?.stories.find((s) => s.id === storyId)?.viewCount ?? 0,
    refetchMine,
  };
}
