import { fireEvent, render } from '@testing-library/react-native';
import { createRef } from 'react';

import StoriesList from '../components/StoriesList';
import type { FeedAuthor, ViewerStory } from '../types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@/features/reels/components/ReelsRail', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/shared/hooks/device/useTabBarHeight', () => ({
  useTabBarHeight: () => ({ scrollContentBottomPadding: 0 }),
}));

let mockToken: string | null = 'token';
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (select: (s: { token: string | null }) => unknown) =>
    select({ token: mockToken }),
}));

let mockAuthors: FeedAuthor[] = [];
let mockLoading = false;
const mockFeed = jest.fn();
jest.mock('../hooks/useStoriesQueries', () => ({
  useStoriesFeed: (type?: string) => {
    mockFeed(type);
    return {
      authors: mockAuthors,
      isLoading: mockLoading,
      isError: false,
      isFetchingNextPage: false,
      refetch: jest.fn(),
      loadMore: jest.fn(),
    };
  },
}));

const story = (viewed: boolean) => ({ viewed }) as ViewerStory;
const author = (
  id: string,
  stories: ViewerStory[],
  subtitle: string | null = 'مكتب هندسي',
): FeedAuthor => ({
  author: {
    identityId: id,
    type: 'COMPANY',
    name: `دار ${id}`,
    logoUrl: null,
    isVerified: false,
    subtitle,
  },
  followed: false,
  hasUnseen: stories.some((s) => !s.viewed),
  firstUnseenIndex: 0,
  latestPublishedAt: new Date(Date.now() - 20 * 60_000).toISOString(),
  stories,
});

const renderList = (ref = createRef<never>()) =>
  render(<StoriesList authSheetRef={ref} />);

describe('StoriesList («القصص»)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = 'token';
    mockLoading = false;
    mockAuthors = [];
  });

  it('shows each provider with its specialty and when it posted', async () => {
    mockAuthors = [author('a1', [story(false)])];
    const screen = await renderList();
    expect(screen.getByText('دار a1')).toBeTruthy();
    expect(screen.getByText('مكتب هندسي')).toBeTruthy();
    expect(screen.getByText(/20/)).toBeTruthy();
  });

  it('rings: gold unwatched, dashed partly watched, grey watched', async () => {
    mockAuthors = [
      author('a1', [story(false), story(false)]),
      author('a2', [story(true), story(false)]),
      author('a3', [story(true)]),
    ];
    const screen = await renderList();
    expect(screen.getByTestId('story-row-a1-ring-unseen')).toBeTruthy();
    expect(screen.getByTestId('story-row-a2-ring-partial')).toBeTruthy();
    expect(screen.getByTestId('story-row-a3-ring-seen')).toBeTruthy();
  });

  it('the segment asks for that kind, and a row keeps it in the viewer', async () => {
    mockAuthors = [author('a1', [story(false)])];
    const screen = await renderList();
    expect(mockFeed).toHaveBeenLastCalledWith(undefined);

    await fireEvent.press(screen.getByTestId('stories-segment-OFFICE'));
    expect(mockFeed).toHaveBeenLastCalledWith('OFFICE');

    await fireEvent.press(screen.getByTestId('story-row-a1'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'a1', source: 'feed', type: 'OFFICE' },
    });
  });

  it('«الكل» opens the viewer without a type', async () => {
    mockAuthors = [author('a1', [story(false)])];
    const screen = await renderList();
    await fireEvent.press(screen.getByTestId('story-row-a1'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'a1', source: 'feed' },
    });
  });

  it('empty and loading states', async () => {
    const screen = await renderList();
    expect(screen.getByText('لا توجد قصص حالياً')).toBeTruthy();
    mockLoading = true;
    const loading = await renderList();
    expect(loading.getByTestId('stories-loading')).toBeTruthy();
  });

  it('signed out, it asks to sign in', async () => {
    mockToken = null;
    const present = jest.fn();
    const ref = { current: { present } } as never;
    const screen = await render(<StoriesList authSheetRef={ref} />);
    await fireEvent.press(screen.getByTestId('stories-sign-in'));
    expect(present).toHaveBeenCalled();
  });
});
