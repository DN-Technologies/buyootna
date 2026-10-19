import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { storiesService } from '@/shared/api/stories.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

import type {
  StoryAuthorStories,
  StoryFeedPage,
  ViewerStory,
} from '../types';

/**
 * Every Stories query key starts with the active profile: the query cache
 * survives a profile switch, and one profile's seen state must never show
 * for another.
 */
export const storiesKeys = {
  all: (identityId: string | null) => ['stories', identityId] as const,
  feed: (identityId: string | null) => ['stories', identityId, 'feed'] as const,
  author: (identityId: string | null, authorId: string) =>
    ['stories', identityId, 'author', authorId] as const,
};

export function useActiveIdentityId(): string | null {
  return useAuthStore((s) => s.activeIdentity?.id ?? null);
}

type FeedData = InfiniteData<StoryFeedPage, string | undefined>;

const errorCode = (error: unknown) =>
  (error as { response?: { data?: { code?: string } } })?.response?.data?.code;

/** The stories feed (signed-in profiles only), paged by cursor. */
export function useStoriesFeed() {
  const identityId = useActiveIdentityId();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const key = storiesKeys.feed(identityId);

  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => storiesService.getFeed(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: !!token && !!identityId,
  });

  const loadMore = useCallback(async () => {
    if (!query.hasNextPage || query.isFetchingNextPage) return;
    try {
      await query.fetchNextPage({ throwOnError: true });
    } catch (error) {
      // The scroll's snapshot is over 30 minutes old: start again. A plain
      // refetch would reuse the stored, expired cursors, so the pages are
      // reset (a deliberate exception to the refetch-on-focus convention).
      if (errorCode(error) === 'STORY_CURSOR_EXPIRED') {
        await queryClient.resetQueries({ queryKey: key });
      }
    }
  }, [key, query, queryClient]);

  const authors = query.data?.pages.flatMap((p) => p.authors) ?? [];
  return { ...query, authors, loadMore };
}

/** One author's live stories (opened from a profile). */
export function useAuthorStories(authorId: string, enabled = true) {
  const identityId = useActiveIdentityId();
  const token = useAuthStore((s) => s.token);
  return useQuery<StoryAuthorStories>({
    queryKey: storiesKeys.author(identityId, authorId),
    queryFn: () => storiesService.getByAuthor(authorId),
    enabled: enabled && !!token && !!identityId && !!authorId,
  });
}

const markStory = (story: ViewerStory, storyId: string): ViewerStory =>
  story.id === storyId ? { ...story, viewed: true } : story;

/**
 * Marks a story seen in the cached feed and author lists at once, so its
 * ring turns grey without waiting for a refetch.
 */
export function useMarkStoryViewed() {
  const identityId = useActiveIdentityId();
  const queryClient = useQueryClient();
  return useCallback(
    (storyId: string) => {
      queryClient.setQueryData<FeedData>(storiesKeys.feed(identityId), (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                authors: page.authors.map((a) => {
                  const stories = a.stories.map((s) => markStory(s, storyId));
                  return { ...a, stories, hasUnseen: stories.some((s) => !s.viewed) };
                }),
              })),
            }
          : data,
      );
      queryClient.setQueriesData<StoryAuthorStories>(
        { queryKey: [...storiesKeys.all(identityId), 'author'] },
        (data) => {
          if (!data) return data;
          const stories = data.stories.map((s) => markStory(s, storyId));
          return { ...data, stories, hasUnseen: stories.some((s) => !s.viewed) };
        },
      );
    },
    [identityId, queryClient],
  );
}
