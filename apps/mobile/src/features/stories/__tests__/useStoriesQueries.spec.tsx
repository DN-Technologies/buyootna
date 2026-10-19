import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useAuthStore } from '@/shared/store/useAuthStore';

import { storiesKeys, useMarkStoryViewed } from '../hooks/useStoriesQueries';
import type { FeedAuthor, StoryFeedPage } from '../types';

const story = (id: string, viewed: boolean) => ({
  id,
  mediaType: 'IMAGE' as const,
  mediaUrl: 'u',
  posterUrl: null,
  urlExpiresAt: 'x',
  width: 1,
  height: 1,
  durationMs: null,
  caption: null,
  property: null,
  publishedAt: 'x',
  expiresAt: 'x',
  viewed,
});

const feedAuthor = (id: string, stories: ReturnType<typeof story>[]): FeedAuthor => ({
  author: { identityId: id, type: 'COMPANY', name: id, logoUrl: null, isVerified: false },
  followed: false,
  hasUnseen: stories.some((s) => !s.viewed),
  firstUnseenIndex: 0,
  latestPublishedAt: 'x',
  stories,
});

describe('storiesKeys', () => {
  it('every key starts with the active profile', () => {
    expect(storiesKeys.feed('p1')).toEqual(['stories', 'p1', 'feed']);
    expect(storiesKeys.author('p1', 'a1')).toEqual(['stories', 'p1', 'author', 'a1']);
    expect(storiesKeys.feed('p1')).not.toEqual(storiesKeys.feed('p2'));
  });
});

describe('useMarkStoryViewed', () => {
  it("marks the story seen in the profile's cached feed, and the ring follows", async () => {
    useAuthStore.setState({ activeIdentity: { id: 'p1' } as never });
    const client = new QueryClient();
    const page: StoryFeedPage = {
      snapshotAt: 'x',
      nextCursor: null,
      authors: [feedAuthor('a1', [story('s1', true), story('s2', false)])],
    };
    client.setQueryData(storiesKeys.feed('p1'), { pages: [page], pageParams: [undefined] });
    // Another profile's cache stays untouched
    client.setQueryData(storiesKeys.feed('p2'), { pages: [page], pageParams: [undefined] });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = await renderHook(() => useMarkStoryViewed(), { wrapper });
    result.current('s2');

    const mine = client.getQueryData<{ pages: StoryFeedPage[] }>(storiesKeys.feed('p1'));
    expect(mine?.pages[0].authors[0].stories.map((s) => s.viewed)).toEqual([true, true]);
    expect(mine?.pages[0].authors[0].hasUnseen).toBe(false);

    const other = client.getQueryData<{ pages: StoryFeedPage[] }>(storiesKeys.feed('p2'));
    expect(other?.pages[0].authors[0].hasUnseen).toBe(true);
  });
});
