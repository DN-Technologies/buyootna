import { useCallback, useMemo } from 'react';

import { useIdentity } from '@/shared/hooks/auth/useIdentity';

import type {
  StoryAuthor,
  StoryAuthorStories,
  StoryAuthorType,
  ViewerStory,
} from '../types';
import { useAuthorStories, useMyStories, useStoriesFeed } from './useStoriesQueries';
import {
  useAuthorHighlights,
  useMyHighlights,
  useStoryArchive,
} from './useStoryHighlights';

export type StoryViewerSourceKind =
  | 'feed'
  | 'author'
  | 'mine'
  // The author's own 30-day archive, from the studio
  | 'archive'
  // One highlight (المميزة): the author's own, or on a profile
  | 'highlight';

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
  // A highlight being played, and whether it is the viewer's own
  highlightId?: string;
  ownHighlight: boolean;
}

interface SourceOptions {
  // «القصص» segment it was opened from: swipes stay in it
  feedType?: StoryAuthorType;
  // archive: the story to open at
  storyId?: string;
  // highlight: which one
  highlightId?: string;
}

/**
 * Where the viewer's stories come from: the tray's feed (swiping on to the
 * next authors), one author's profile, the author's own stories («قصتك»,
 * shown under its own name and logo), its archive, or a highlight.
 */
export function useStoryViewerSource(
  authorId: string,
  source: StoryViewerSourceKind,
  { feedType, storyId, highlightId }: SourceOptions = {},
): StoryViewerSource {
  const me = useIdentity();
  const isMine = source === 'mine';
  const isArchive = source === 'archive';
  const isHighlight = source === 'highlight';
  const ownHighlight = isHighlight && authorId === me.activeIdentity?.id;
  // The viewer's own stories, shown under its own name and logo
  const own = isMine || isArchive || ownHighlight;

  const mine = useMyStories(isMine);
  const archive = useStoryArchive(isArchive);
  const myHighlights = useMyHighlights(ownHighlight);
  const theirHighlights = useAuthorHighlights(
    isHighlight && !ownHighlight ? authorId : undefined,
  );
  const feed = useStoriesFeed(feedType);
  const inFeed =
    source === 'feed' &&
    feed.authors.some((a) => a.author.identityId === authorId);
  // One author's stories; for someone else's highlight, its name and logo
  const single = useAuthorStories(authorId, !inFeed && !own);

  const meAuthor = useMemo<StoryAuthor | null>(() => {
    const type = me.activeIdentity?.type;
    if (type !== 'COMPANY' && type !== 'OFFICE') return null;
    return {
      identityId: me.activeIdentity?.id ?? authorId,
      type,
      name: me.displayName,
      logoUrl: me.avatarUrl ?? null,
      isVerified: !!me.isVerified,
    } as StoryAuthor;
  }, [me.activeIdentity, me.displayName, me.avatarUrl, me.isVerified, authorId]);

  const highlight = (ownHighlight ? myHighlights : theirHighlights).data?.highlights.find(
    (h) => h.id === highlightId,
  );

  const authors = useMemo<StoryAuthorStories[]>(() => {
    const one = (
      author: StoryAuthor | null | undefined,
      stories: ViewerStory[],
      start = 0,
    ): StoryAuthorStories[] =>
      author && stories.length
        ? [
            {
              author,
              followed: false,
              hasUnseen: false,
              firstUnseenIndex: Math.max(0, start),
              stories,
            },
          ]
        : [];
    if (isMine) return one(meAuthor, mine.data?.stories ?? []);
    if (isArchive) {
      const stories = archive.stories;
      return one(meAuthor, stories, stories.findIndex((s) => s.id === storyId));
    }
    if (isHighlight) {
      return one(
        ownHighlight ? meAuthor : single.data?.author,
        highlight?.stories ?? [],
      );
    }
    if (inFeed) return feed.authors.filter((a) => a.stories.length > 0);
    return single.data && single.data.stories.length > 0 ? [single.data] : [];
  }, [isMine, isArchive, isHighlight, ownHighlight, meAuthor, mine.data, archive.stories, storyId, highlight, inFeed, feed.authors, single.data]);

  const counts = useMemo(() => authors.map((a) => a.stories.length), [authors]);

  const { refetch: refetchMine } = mine;
  const { refetch: refetchFeed } = feed;
  const { refetch: refetchSingle } = single;
  const { refetch: refetchArchive } = archive;
  const { refetch: refetchMyHighlights } = myHighlights;
  const { refetch: refetchTheirHighlights } = theirHighlights;
  const refetch = useCallback(() => {
    if (isMine) void refetchMine();
    else if (isArchive) void refetchArchive();
    else if (isHighlight) {
      void (ownHighlight ? refetchMyHighlights() : refetchTheirHighlights());
    } else void (inFeed ? refetchFeed() : refetchSingle());
  }, [isMine, isArchive, isHighlight, ownHighlight, inFeed, refetchMine, refetchArchive, refetchMyHighlights, refetchTheirHighlights, refetchFeed, refetchSingle]);

  const highlightQuery = ownHighlight ? myHighlights : theirHighlights;
  const loading = isMine
    ? mine.isLoading
    : isArchive
      ? archive.isLoading
      : isHighlight
        ? highlightQuery.isLoading || (!ownHighlight && single.isLoading)
        : inFeed
          ? false
          : single.isLoading;
  const fetched = isMine
    ? mine.isFetched
    : isArchive
      ? archive.isFetched
      : isHighlight
        ? highlightQuery.isFetched && (ownHighlight || single.isFetched)
        : inFeed || single.isFetched;

  return {
    authors,
    counts,
    loading,
    fetched,
    refetch,
    viewCountOf: (id) =>
      (isArchive ? archive.stories : (mine.data?.stories ?? [])).find(
        (s) => s.id === id,
      )?.viewCount ?? 0,
    // After deleting a story: the list it came from
    refetchMine: isArchive
      ? () => refetchArchive()
      : ownHighlight
        ? () => refetchMyHighlights()
        : refetchMine,
    highlightId,
    ownHighlight,
  };
}
