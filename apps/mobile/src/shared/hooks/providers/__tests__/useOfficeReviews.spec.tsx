import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react-native';

import { reviewsService } from '@/shared/api/reviews.service';
import { useOfficeReviews } from '@/shared/hooks/providers/useOfficeReviews';

jest.mock('@/shared/api/reviews.service', () => ({
  reviewsService: {
    getSummary: jest.fn(),
    getReviews: jest.fn(),
    addReview: jest.fn(),
    toggleLike: jest.fn(),
    toggleDislike: jest.fn(),
  },
}));

jest.mock('@/shared/utils/alert', () => ({
  showAlert: jest.fn(),
}));

const mockReviewsService = reviewsService as jest.Mocked<typeof reviewsService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
}

describe('useOfficeReviews', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  const mockSummary = {
    averageRating: 4.6,
    totalRatingsCount: 8,
    ratingBreakdown: [
      { star: 5, pct: '80%' },
      { star: 4, pct: '20%' },
      { star: 3, pct: '0%' },
      { star: 2, pct: '0%' },
      { star: 1, pct: '0%' },
    ],
  };

  const mockReviews = [
    {
      id: 'rev-off-1',
      authorName: 'سعد',
      rating: 5,
      comment: 'مكتب عقاري محترف',
      date: '2026-02-01',
      likes: 3,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
    },
  ];

  it('fetches reviews and summary when targetUserId is provided', async () => {
    mockReviewsService.getSummary.mockResolvedValueOnce(mockSummary);
    mockReviewsService.getReviews.mockResolvedValueOnce({
      data: mockReviews,
    } as any);

    const { result } = await renderHook(() => useOfficeReviews('user-off-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.reviews).toEqual(mockReviews);
    });

    expect(result.current.reviewSummary).toEqual(mockSummary);
    expect(mockReviewsService.getSummary).toHaveBeenCalledWith('user-off-1');
    expect(mockReviewsService.getReviews).toHaveBeenCalledWith(
      'user-off-1',
      'all',
    );
  });

  it('maintains stable callback references across re-renders when dependencies do not change', async () => {
    mockReviewsService.getSummary.mockResolvedValue(mockSummary);
    mockReviewsService.getReviews.mockResolvedValue({
      data: mockReviews,
    } as any);

    const { result, rerender } = await renderHook(
      ({ id }: { id: string }) => useOfficeReviews(id),
      {
        initialProps: { id: 'user-off-1' },
        wrapper: createWrapper(),
      },
    );

    const initialToggleLike = result.current.handleToggleLike;
    const initialToggleDislike = result.current.handleToggleDislike;
    const initialAddReview = result.current.handleAddReview;

    rerender({ id: 'user-off-1' });

    expect(result.current.handleToggleLike).toBe(initialToggleLike);
    expect(result.current.handleToggleDislike).toBe(initialToggleDislike);
    expect(result.current.handleAddReview).toBe(initialAddReview);
  });
});
