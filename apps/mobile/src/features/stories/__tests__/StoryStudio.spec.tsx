import { fireEvent, render } from '@testing-library/react-native';

import StoryStudio from '../studio/StoryStudio';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@gorhom/bottom-sheet', () => ({}));
jest.mock('../studio/HighlightPickerSheet', () => ({ __esModule: true, default: () => null }));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (select: (s: unknown) => unknown) => select({ activeIdentity: { id: 'co' } }),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const story = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  mediaType: 'IMAGE',
  mediaUrl: `${id}.jpg`,
  posterUrl: null,
  publishedAt: '2026-10-20T10:00:00.000Z',
  expiresAt: '2026-10-21T10:00:00.000Z',
  viewCount: 4,
  ...over,
});
const query = (data: unknown) => ({ data, refetch: jest.fn(), isRefetching: false });
const mockReorder = jest.fn();
jest.mock('../hooks/useStoriesQueries', () => ({
  useMyStories: () => query({ stories: [] }),
}));
jest.mock('../hooks/useStoryHighlights', () => ({
  useMyHighlights: () =>
    query({
      highlights: [
        { id: 'h1', title: 'مشاريعنا', coverUrl: null, stories: [] },
        { id: 'h2', title: 'عروض', coverUrl: null, stories: [] },
      ],
    }),
  useStoryArchive: () => ({
    stories: [story('s1'), story('s2')],
    refetch: jest.fn(),
    hasNextPage: false,
  }),
  useHighlightMutations: () => ({ reorder: { mutate: mockReorder } }),
}));

describe('StoryStudio', () => {
  beforeEach(() => jest.clearAllMocks());

  it('«قصة جديدة» opens the composer; an archived story opens in the viewer', async () => {
    const screen = await render(<StoryStudio />);
    await fireEvent.press(screen.getByTestId('studio-new-story'));
    expect(mockPush).toHaveBeenCalledWith('/stories/new');
    await fireEvent.press(screen.getByTestId('studio-archive-s2'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'co', source: 'archive', storyId: 's2' },
    });
  });

  it('«تحديد» picks archive stories in order and offers to add them', async () => {
    const screen = await render(<StoryStudio />);
    expect(screen.queryByTestId('studio-add-to-highlight')).toBeNull();
    await fireEvent.press(screen.getByTestId('studio-select'));
    await fireEvent.press(screen.getByTestId('studio-archive-s2'));
    await fireEvent.press(screen.getByTestId('studio-archive-s1'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId('studio-add-to-highlight')).toHaveTextContent(
      'إضافة إلى المميزة (2)',
    );
  });

  it('«ترتيب» moves highlights with the arrows and saves on «تم»', async () => {
    const screen = await render(<StoryStudio />);
    await fireEvent.press(screen.getByTestId('studio-reorder'));
    expect(screen.queryByTestId('studio-new-highlight')).toBeNull();
    await fireEvent.press(screen.getByTestId('studio-move-h2-earlier'));
    await fireEvent.press(screen.getByTestId('studio-reorder'));
    expect(mockReorder).toHaveBeenCalledWith(['h2', 'h1']);
  });

  it('«تم» without a change saves nothing', async () => {
    const screen = await render(<StoryStudio />);
    await fireEvent.press(screen.getByTestId('studio-reorder'));
    await fireEvent.press(screen.getByTestId('studio-reorder'));
    expect(mockReorder).not.toHaveBeenCalled();
  });
});
