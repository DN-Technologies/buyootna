import { fireEvent, render, screen } from '@testing-library/react-native';

import ProfileReels from '../components/ProfileReels';
import ReelsRail from '../components/ReelsRail';
import {
  useAuthorReelsRail,
  useReelsAvailable,
  useReelsRail,
} from '../hooks/useReelsQueries';
import type { ViewerReel } from '../types';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void) => effect(),
}));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('react-native-svg', () => ({ SvgXml: 'SvgXml' }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('../hooks/useReelsQueries', () => ({
  useReelsAvailable: jest.fn(),
  useReelsRail: jest.fn(),
  useAuthorReelsRail: jest.fn(),
}));

const reel = {
  id: 'r1',
  posterUrl: 'https://cdn.test/p.jpg',
  viewCount: 1500,
  author: { name: 'شركة الاختبار', identityId: 'a1' },
} as ViewerReel;
const query = (reels: ViewerReel[]) => ({
  data: { reels },
  refetch: jest.fn(),
});

describe('ReelsRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useReelsRail as jest.Mock).mockReturnValue(query([reel]));
  });

  it('shows nothing while the switch is off, and asks for no reels', async () => {
    (useReelsAvailable as jest.Mock).mockReturnValue(false);
    await render(<ReelsRail />);
    expect(screen.queryByTestId('reels-rail')).toBeNull();
    expect(useReelsRail).toHaveBeenCalledWith(false);
  });

  it('shows nothing with no reels', async () => {
    (useReelsAvailable as jest.Mock).mockReturnValue(true);
    (useReelsRail as jest.Mock).mockReturnValue(query([]));
    await render(<ReelsRail />);
    expect(screen.queryByTestId('reels-rail')).toBeNull();
  });

  it('opens the feed at the reel tapped', async () => {
    (useReelsAvailable as jest.Mock).mockReturnValue(true);
    await render(<ReelsRail />);
    expect(screen.getByText('شركة الاختبار')).toBeTruthy();
    expect(screen.getByText('1.5 ألف')).toBeTruthy();
    fireEvent.press(screen.getByTestId('reel-card-r1'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/reels',
      params: { startId: 'r1' },
    });
  });

  it('opens the feed from the start with «عرض الكل»', async () => {
    (useReelsAvailable as jest.Mock).mockReturnValue(true);
    await render(<ReelsRail />);
    fireEvent.press(screen.getByTestId('reels-rail-all'));
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/reels', params: {} });
  });
});

describe('ProfileReels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthorReelsRail as jest.Mock).mockReturnValue(query([reel]));
  });

  it('shows nothing while the switch is off', async () => {
    (useReelsAvailable as jest.Mock).mockReturnValue(false);
    await render(<ProfileReels authorId="a1" />);
    expect(screen.queryByTestId('profile-reels')).toBeNull();
  });

  it("opens that author's reels at the one tapped", async () => {
    (useReelsAvailable as jest.Mock).mockReturnValue(true);
    await render(<ProfileReels authorId="a1" />);
    // Its own profile: the name would only repeat
    expect(screen.queryByText('شركة الاختبار')).toBeNull();
    fireEvent.press(screen.getByTestId('reel-card-r1'));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/reels',
      params: { authorId: 'a1', startId: 'r1' },
    });
  });
});
