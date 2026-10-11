import { fireEvent, render, waitFor } from '@testing-library/react-native';

import apiClient from '@/shared/api/api';

import ReviewsScreen from '../reviews';

jest.mock('@gorhom/bottom-sheet');
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'u1' } }),
}));
jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) };
});
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: (props: any) => <View {...props} /> };
});

const review = (id: string, over: object = {}) => ({
  id,
  userName: `مستخدم ${id}`,
  avatarUrl: null,
  timeAgo: 'منذ يوم',
  rating: 4,
  comment: `تعليق ${id}`,
  likes: 2,
  dislikes: 1,
  userLiked: false,
  userDisliked: false,
  ...over,
});

const summary = {
  averageRating: 4.5,
  totalRatingsCount: 2,
  ratingBreakdown: [
    { star: 5, pct: '50%' },
    { star: 4, pct: '50%' },
    { star: 3, pct: '0%' },
    { star: 2, pct: '0%' },
    { star: 1, pct: '0%' },
  ],
};

const mockApi = (reviews: object[]) => {
  (apiClient.get as jest.Mock).mockImplementation((url: string) =>
    Promise.resolve({
      data: url.endsWith('/summary') ? summary : { data: reviews },
    }),
  );
};

describe('ReviewsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.post as jest.Mock).mockResolvedValue({});
  });

  it('lists the reviews with the summary, the reviewer logo placeholder when there is no picture', async () => {
    mockApi([review('a'), review('b', { avatarUrl: 'https://cdn/b.jpg' })]);
    const { findByText, getByText, getByTestId } = await render(<ReviewsScreen />);

    expect(await findByText('تعليق a')).toBeTruthy();
    expect(getByText('4.5')).toBeTruthy();
    expect(getByText('2 تقييم')).toBeTruthy();
    expect(getByTestId('review-avatar-a-fallback')).toBeTruthy();
    expect(getByTestId('review-avatar-b-photo')).toBeTruthy();
  });

  it('shows the empty message when nobody has reviewed yet', async () => {
    mockApi([]);
    const { findByText } = await render(<ReviewsScreen />);
    expect(await findByText('سجل تقييماتك فارغ حالياً')).toBeTruthy();
  });

  it('like updates the count at once and tells the API; pressing it again undoes it', async () => {
    mockApi([review('a')]);
    const { findByText, getByTestId, getByText } = await render(<ReviewsScreen />);
    await findByText('تعليق a');

    await fireEvent.press(getByTestId('review-like-a'));
    expect(getByText('(3)')).toBeTruthy();
    expect(apiClient.post).toHaveBeenCalledWith('/reviews/a/like');

    await fireEvent.press(getByTestId('review-like-a'));
    expect(getByText('(2)')).toBeTruthy();
  });

  it('liking a review you disliked moves the vote across', async () => {
    mockApi([review('a', { userDisliked: true })]);
    const { findByText, getByTestId, getByText } = await render(<ReviewsScreen />);
    await findByText('تعليق a');

    await fireEvent.press(getByTestId('review-like-a'));
    await waitFor(() => expect(getByText('(3)')).toBeTruthy()); // likes 2 -> 3
    expect(getByText('(0)')).toBeTruthy(); // dislikes 1 -> 0
  });
});
