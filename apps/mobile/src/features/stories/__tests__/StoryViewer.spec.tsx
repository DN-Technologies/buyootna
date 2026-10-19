/* eslint-disable @typescript-eslint/no-require-imports */
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { I18nManager } from 'react-native';

import { chatService } from '@/shared/api/chat.service';
import { storiesService } from '@/shared/api/stories.service';

import StoryViewer, {
  STORY_IMAGE_MS,
  STORY_VIEW_AFTER_MS,
} from '../components/StoryViewer';
import type { FeedAuthor, ViewerStory } from '../types';

jest.mock('@gorhom/bottom-sheet');

const mockRouter = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  canGoBack: jest.fn(() => true),
};
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));
jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));

jest.mock('expo-image', () => {
  const mockReact = jest.requireActual<typeof import('react')>('react');
  const Image = Object.assign(
    (props: Record<string, unknown>) => mockReact.createElement('Image', props),
    { prefetch: jest.fn().mockResolvedValue(true) },
  );
  return { Image };
});

// Swipes are tested in storyNavigation.spec (swipeAction)
jest.mock('react-native-gesture-handler', () => {
  const chain: Record<string, unknown> = {};
  for (const m of ['runOnJS', 'minDistance', 'onEnd']) chain[m] = () => chain;
  return {
    GestureDetector: ({ children }: { children: ReactNode }) => children,
    Gesture: { Pan: () => chain },
  };
});

jest.mock('@/shared/api/stories.service', () => ({
  storiesService: { recordViews: jest.fn(), report: jest.fn(), remove: jest.fn() },
}));
jest.mock('@/shared/api/chat.service', () => ({
  chatService: { createConversation: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

let mockIdentityId = 'viewer-1';
let mockAuthors: FeedAuthor[] = [];
const mockRefetch = jest.fn();
const mockMarkViewed = jest.fn();
jest.mock('../hooks/useStoriesQueries', () => ({
  useActiveIdentityId: () => mockIdentityId,
  useStoriesFeed: () => ({ authors: mockAuthors, refetch: mockRefetch }),
  useAuthorStories: () => ({
    data: undefined,
    isLoading: false,
    isFetched: true,
    refetch: jest.fn(),
  }),
  useMarkStoryViewed: () => mockMarkViewed,
  useMyStories: () => mockMine,
  useStoryViewers: () => ({
    viewers: mockViewers,
    total: mockViewers.length,
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
  }),
}));

let mockMine: {
  data: { stories: (ViewerStory & { viewCount: number })[] } | undefined;
  isLoading: boolean;
  isFetched: boolean;
  refetch: jest.Mock;
} = { data: undefined, isLoading: false, isFetched: false, refetch: jest.fn() };
let mockViewers: {
  identityId: string;
  type: 'INDIVIDUAL';
  name: string;
  avatarUrl: null;
  isVerified: boolean;
  viewedAt: string;
}[] = [];
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    activeIdentity: { id: 'co-me', type: 'COMPANY' },
    displayName: 'شركتي',
    avatarUrl: null,
    isVerified: true,
  }),
}));

const story = (id: string, over: Partial<ViewerStory> = {}): ViewerStory => ({
  id,
  mediaType: 'IMAGE',
  mediaUrl: `https://s3.test/${id}.jpg`,
  posterUrl: null,
  urlExpiresAt: '2026-10-20T12:15:00.000Z',
  width: 1080,
  height: 1920,
  durationMs: null,
  caption: `caption ${id}`,
  property: null,
  publishedAt: '2026-10-20T10:00:00.000Z',
  expiresAt: '2026-10-21T10:00:00.000Z',
  viewed: false,
  ...over,
});

const author = (
  id: string,
  stories: ViewerStory[],
  firstUnseenIndex = 0,
): FeedAuthor => ({
  author: {
    identityId: id,
    type: 'COMPANY',
    name: `شركة ${id}`,
    logoUrl: null,
    isVerified: true,
  },
  followed: false,
  hasUnseen: true,
  firstUnseenIndex,
  latestPublishedAt: '2026-10-20T10:00:00.000Z',
  stories,
});

const loadImage = (screen: { getByTestId: (id: string) => unknown }) =>
  act(() => {
    fireEvent(screen.getByTestId('story-image') as never, 'load');
  });

describe('StoryViewer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockIdentityId = 'viewer-1';
    mockAuthors = [
      author('a1', [story('s1', { viewed: true }), story('s2')], 1),
      author('a2', [story('s3', { property: { id: 'p1', type: 'SALE', category: 'APARTMENT', location: 'حولي', coverUrl: null } })]),
    ];
    (storiesService.recordViews as jest.Mock).mockResolvedValue(undefined);
  });
  afterEach(() => jest.useRealTimers());

  it("opens at the chosen author's first unseen story", async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s2');
    expect(screen.getByTestId('story-author-name')).toHaveTextContent('شركة a1');
  });

  it('story media is kept in memory only, never on disk', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    expect(screen.getByTestId('story-image').props.cachePolicy).toBe('memory');
  });

  it('moves on after 5 seconds of showing, and closes after the last story', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await loadImage(screen);
    await act(() => jest.advanceTimersByTimeAsync(STORY_IMAGE_MS));
    expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s3');

    await loadImage(screen);
    await act(() => jest.advanceTimersByTimeAsync(STORY_IMAGE_MS));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('the clock waits for the photo to load', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await act(() => jest.advanceTimersByTimeAsync(STORY_IMAGE_MS * 2));
    expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s2');
  });

  it('records a view after a second on screen, once, and marks it seen', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await loadImage(screen);
    await act(() => jest.advanceTimersByTimeAsync(STORY_VIEW_AFTER_MS));
    expect(mockMarkViewed).toHaveBeenCalledWith('s2');
    // The queue sends after its short pause
    await act(() => jest.advanceTimersByTimeAsync(2000));
    expect(storiesService.recordViews).toHaveBeenCalledWith(['s2']);
  });

  it('a story already seen is not recorded again', async () => {
    mockAuthors = [author('a1', [story('s1', { viewed: true })])];
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await loadImage(screen);
    await act(() => jest.advanceTimersByTimeAsync(STORY_VIEW_AFTER_MS + 2000));
    expect(mockMarkViewed).not.toHaveBeenCalled();
    expect(storiesService.recordViews).not.toHaveBeenCalled();
  });

  it('holding pauses the clock; letting go resumes it', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await loadImage(screen);
    const zone = screen.getByTestId('story-tap-left');
    await act(() => {
      fireEvent(zone, 'longPress');
    });
    await act(() => jest.advanceTimersByTimeAsync(STORY_IMAGE_MS * 2));
    expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s2');

    await act(() => {
      fireEvent(zone, 'pressOut');
    });
    await act(() => jest.advanceTimersByTimeAsync(STORY_IMAGE_MS));
    expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s3');
  });

  describe('taps follow the reading direction', () => {
    const original = I18nManager.isRTL;
    afterEach(() => {
      Object.defineProperty(I18nManager, 'isRTL', { value: original, configurable: true });
    });

    it('RTL: left goes forward, right goes back', async () => {
      Object.defineProperty(I18nManager, 'isRTL', { value: true, configurable: true });
      const screen = await render(<StoryViewer authorId="a1" source="feed" />);
      await act(() => {
        fireEvent.press(screen.getByTestId('story-tap-left'));
      });
      expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s3');
      await act(() => {
        fireEvent.press(screen.getByTestId('story-tap-right'));
      });
      expect(screen.getByTestId('story-caption')).toHaveTextContent('caption s2');
    });
  });

  it('the listing link opens the listing', async () => {
    const screen = await render(<StoryViewer authorId="a2" source="feed" />);
    await act(() => {
      fireEvent.press(screen.getByTestId('story-open-property'));
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/property/p1');
  });

  it('a reply opens the chat with the author, about the linked listing', async () => {
    (chatService.createConversation as jest.Mock).mockResolvedValue({ id: 'c1' });
    const screen = await render(<StoryViewer authorId="a2" source="feed" />);
    await act(() => {
      fireEvent.press(screen.getByTestId('story-reply'));
    });
    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith('/chat/c1'),
    );
    expect(chatService.createConversation).toHaveBeenCalledWith('a2', 'p1');
  });

  it('reports the story through the report sheet', async () => {
    (storiesService.report as jest.Mock).mockResolvedValue(undefined);
    const { present } = require('@gorhom/bottom-sheet');
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await act(() => {
      fireEvent.press(screen.getByTestId('story-options'));
    });
    expect(present).toHaveBeenCalled();
    await act(() => {
      fireEvent.press(screen.getByText('احتيال أو نصب'));
    });
    await act(() => {
      fireEvent.press(screen.getByText('إرسال البلاغ'));
    });
    await waitFor(() =>
      expect(storiesService.report).toHaveBeenCalledWith(
        's2',
        'احتيال أو نصب',
        undefined,
      ),
    );
  });

  it('closes when the active profile changes', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    mockIdentityId = 'another-profile';
    await screen.rerender(<StoryViewer authorId="a1" source="feed" />);
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('a photo that fails to load fetches fresh links once', async () => {
    const screen = await render(<StoryViewer authorId="a1" source="feed" />);
    await act(() => {
      fireEvent(screen.getByTestId('story-image'), 'error');
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    await act(() => {
      fireEvent(screen.getByTestId('story-image'), 'error');
    });
    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText('تعذر تحميل القصة')).toBeTruthy();
  });

  it('nothing to show closes the viewer', async () => {
    mockAuthors = [];
    await render(<StoryViewer authorId="a1" source="feed" />);
    expect(mockRouter.back).toHaveBeenCalled();
  });

  describe('own stories (source=mine)', () => {
    beforeEach(() => {
      mockAuthors = [];
      mockMine = {
        data: {
          stories: [
            { ...story('m1', { viewed: true }), viewCount: 3 },
            { ...story('m2', { viewed: true }), viewCount: 0 },
          ],
        },
        isLoading: false,
        isFetched: true,
        refetch: jest.fn().mockResolvedValue(undefined),
      };
      mockViewers = [
        { identityId: 'v1', type: 'INDIVIDUAL', name: 'مشاهد أول', avatarUrl: null, isVerified: false, viewedAt: '2026-10-20T11:00:00.000Z' },
      ];
    });

    it('shows the view count instead of a reply, under its own name', async () => {
      const screen = await render(<StoryViewer authorId="co-me" source="mine" />);
      expect(screen.getByTestId('story-author-name')).toHaveTextContent('شركتي');
      // The button also holds the eye icon's glyph
      expect(screen.getByTestId('story-viewers')).toHaveTextContent(/المشاهدون · 3$/);
      expect(screen.queryByTestId('story-reply')).toBeNull();
    });

    it('opens the viewer list', async () => {
      const { present } = require('@gorhom/bottom-sheet');
      const screen = await render(<StoryViewer authorId="co-me" source="mine" />);
      await act(() => {
        fireEvent.press(screen.getByTestId('story-viewers'));
      });
      expect(present).toHaveBeenCalled();
      expect(screen.getByTestId('viewers-title')).toHaveTextContent('المشاهدون · 1');
      expect(screen.getByText('مشاهد أول')).toBeTruthy();
    });

    it('⋮ deletes after confirming, then reloads its stories', async () => {
      (storiesService.remove as jest.Mock).mockResolvedValue(undefined);
      const screen = await render(<StoryViewer authorId="co-me" source="mine" />);
      await act(() => {
        fireEvent.press(screen.getByTestId('story-options'));
      });
      expect(screen.queryByText('احتيال أو نصب')).toBeNull();
      await act(() => {
        fireEvent.press(screen.getByText('حذف'));
      });
      await waitFor(() => expect(storiesService.remove).toHaveBeenCalledWith('m1'));
      expect(mockMine.refetch).toHaveBeenCalled();
    });

    it('its own views are never recorded', async () => {
      mockMine.data = { stories: [{ ...story('m3', { viewed: false }), viewCount: 0 }] };
      const screen = await render(<StoryViewer authorId="co-me" source="mine" />);
      await loadImage(screen);
      await act(() => jest.advanceTimersByTimeAsync(STORY_VIEW_AFTER_MS + 2000));
      expect(mockMarkViewed).not.toHaveBeenCalled();
      expect(storiesService.recordViews).not.toHaveBeenCalled();
    });

    it('no stories left closes the viewer', async () => {
      mockMine.data = { stories: [] };
      await render(<StoryViewer authorId="co-me" source="mine" />);
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
