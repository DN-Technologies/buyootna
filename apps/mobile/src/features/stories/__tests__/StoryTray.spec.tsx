import { fireEvent, render } from '@testing-library/react-native';

import StoryTray from '../components/StoryTray';
import type { FeedAuthor } from '../types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));

let mockAuthors: FeedAuthor[] = [];
const mockRefetch = jest.fn();
const mockRefetchMine = jest.fn();
let mockMine: { stories: { id: string }[] } | undefined;
jest.mock('../hooks/useStoriesQueries', () => ({
  useStoriesFeed: () => ({
    authors: mockAuthors,
    refetch: mockRefetch,
    loadMore: jest.fn(),
  }),
  useMyStories: () => ({ data: mockMine, refetch: mockRefetchMine }),
}));

// An individual by default; provider tests switch to a company
let mockIdentity: { id: string; type: string } = { id: 'me', type: 'INDIVIDUAL' };
jest.mock('@/shared/hooks/auth/useIdentity', () => ({
  useIdentity: () => ({
    activeIdentity: mockIdentity,
    isBusiness: mockIdentity.type !== 'INDIVIDUAL',
    displayName: 'شركتي',
    avatarUrl: null,
    isVerified: true,
  }),
}));

const author = (id: string, hasUnseen: boolean): FeedAuthor => ({
  author: {
    identityId: id,
    type: 'OFFICE',
    name: `مكتب ${id}`,
    logoUrl: null,
    isVerified: false,
  },
  followed: false,
  hasUnseen,
  firstUnseenIndex: 0,
  latestPublishedAt: '2026-10-20T10:00:00.000Z',
  stories: [],
});

describe('StoryTray', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIdentity = { id: 'me', type: 'INDIVIDUAL' };
    mockMine = undefined;
  });

  it('is hidden while there are no stories', async () => {
    mockAuthors = [];
    const screen = await render(<StoryTray />);
    expect(screen.queryByTestId('story-tray')).toBeNull();
  });

  it("keeps the feed's order, with gold rings for unseen and grey for seen", async () => {
    mockAuthors = [author('a1', true), author('a2', false)];
    const screen = await render(<StoryTray />);
    expect(screen.getByText('مكتب a1')).toBeTruthy();
    expect(screen.getByTestId('story-ring-a1-unseen')).toBeTruthy();
    expect(screen.getByTestId('story-ring-a2-seen')).toBeTruthy();
    const names = screen.getAllByText(/^مكتب /).map((n) => n.props.children);
    expect(names).toEqual(['مكتب a1', 'مكتب a2']);
  });

  it('a ring opens the viewer at that author, from the feed', async () => {
    mockAuthors = [author('a1', true)];
    const screen = await render(<StoryTray />);
    await fireEvent.press(screen.getByTestId('story-ring-a1'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'a1', source: 'feed' },
    });
  });

  it('refreshes when the screen comes into focus', async () => {
    mockAuthors = [];
    await render(<StoryTray />);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('a provider without a logo shows its initial', async () => {
    mockAuthors = [author('a1', true)];
    const screen = await render(<StoryTray />);
    expect(screen.getByText('م')).toBeTruthy();
  });

  describe('«قصتك» for companies and offices', () => {
    beforeEach(() => {
      mockIdentity = { id: 'co-1', type: 'COMPANY' };
    });

    it('shows even with an empty feed, so the provider can post', async () => {
      mockAuthors = [];
      const screen = await render(<StoryTray />);
      expect(screen.getByTestId('story-tray')).toBeTruthy();
      expect(screen.getByText('قصتك')).toBeTruthy();
    });

    it('without stories, tapping it opens the composer', async () => {
      mockAuthors = [];
      mockMine = { stories: [] };
      const screen = await render(<StoryTray />);
      expect(screen.getByTestId('story-ring-mine-seen')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('story-ring-mine'));
      expect(mockPush).toHaveBeenCalledWith('/stories/new');
    });

    it('with stories, tapping it opens them; + still posts a new one', async () => {
      mockAuthors = [];
      mockMine = { stories: [{ id: 's1' }] };
      const screen = await render(<StoryTray />);
      expect(screen.getByTestId('story-ring-mine-unseen')).toBeTruthy();
      await fireEvent.press(screen.getByTestId('story-ring-mine'));
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/stories/[authorId]',
        params: { authorId: 'co-1', source: 'mine' },
      });
      await fireEvent.press(screen.getByTestId('story-add'));
      expect(mockPush).toHaveBeenLastCalledWith('/stories/new');
    });

    it('its own stories refresh on focus too', async () => {
      await render(<StoryTray />);
      expect(mockRefetchMine).toHaveBeenCalled();
    });

    it('individuals get no «قصتك»', async () => {
      mockIdentity = { id: 'me', type: 'INDIVIDUAL' };
      mockAuthors = [author('a1', true)];
      const screen = await render(<StoryTray />);
      expect(screen.queryByText('قصتك')).toBeNull();
      expect(mockRefetchMine).not.toHaveBeenCalled();
    });
  });
});
