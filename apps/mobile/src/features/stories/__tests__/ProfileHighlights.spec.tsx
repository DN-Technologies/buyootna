import { fireEvent, render } from '@testing-library/react-native';

import ProfileHighlights from '../components/ProfileHighlights';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('expo-image', () => ({ Image: 'Image' }));

let mockHighlights: { id: string; title: string; coverUrl: string | null }[] = [];
jest.mock('../hooks/useStoryHighlights', () => ({
  useAuthorHighlights: () => ({ data: { highlights: mockHighlights } }),
}));

describe('ProfileHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHighlights = [];
  });

  it('shows nothing without highlights', async () => {
    const screen = await render(<ProfileHighlights authorId="co" />);
    expect(screen.queryByTestId('profile-highlights')).toBeNull();
  });

  it('lists them by title and opens one in the viewer', async () => {
    mockHighlights = [
      { id: 'h1', title: 'مشاريعنا', coverUrl: 'cover.jpg' },
      { id: 'h2', title: 'عروض', coverUrl: null },
    ];
    const screen = await render(<ProfileHighlights authorId="co" />);
    expect(screen.getByText('مشاريعنا')).toBeTruthy();
    expect(screen.getByText('عروض')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('profile-highlight-h2'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/stories/[authorId]',
      params: { authorId: 'co', source: 'highlight', highlightId: 'h2' },
    });
  });
});
