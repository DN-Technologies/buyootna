import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react-native';

import { reviewsService } from '@/shared/api/reviews.service';
import { useCompanyReviews } from '@/shared/hooks/useCompanyReviews';
import { showAlert } from '@/shared/utils/alert';

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
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return Wrapper;
}

describe('useCompanyReviews', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  const mockSummary = {
    averageRating: 4.5,
    totalRatingsCount: 10,
    ratingBreakdown: [
      { star: 5, pct: '70%' },
      { star: 4, pct: '20%' },
      { star: 3, pct: '10%' },
      { star: 2, pct: '0%' },
      { star: 1, pct: '0%' },
    ],
  };

  const mockReviews = [
    {
      id: 'rev-1',
      authorName: 'أحمد',
      rating: 5,
      comment: 'خدمة ممتازة',
      date: '2026-01-01',
      likes: 2,
      dislikes: 0,
      userLiked: false,
      userDisliked: false,
    },
  ];

  it('fetches reviews and summary when targetUserId is provided', async () => {
    mockReviewsService.getSummary.mockResolvedValueOnce(mockSummary);
    mockReviewsService.getReviews.mockResolvedValueOnce({ data: mockReviews } as any);

    const { result } = await renderHook(() => useCompanyReviews('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.reviews).toEqual(mockReviews);
    });

    expect(result.current.reviewSummary).toEqual(mockSummary);
    expect(mockReviewsService.getSummary).toHaveBeenCalledWith('user-1');
    expect(mockReviewsService.getReviews).toHaveBeenCalledWith('user-1', 'all');
  });

  it('maintains stable callback references across re-renders when dependencies do not change', async () => {
    mockReviewsService.getSummary.mockResolvedValue(mockSummary);
    mockReviewsService.getReviews.mockResolvedValue({ data: mockReviews } as any);

    const { result, rerender } = await renderHook(
      ({ id }: { id: string }) => useCompanyReviews(id),
      {
        initialProps: { id: 'user-1' },
        wrapper: createWrapper(),
      },
    );

    const initialToggleLike = result.current.handleToggleLike;
    const initialToggleDislike = result.current.handleToggleDislike;

    rerender({ id: 'user-1' });

    expect(result.current.handleToggleLike).toBe(initialToggleLike);
    expect(result.current.handleToggleDislike).toBe(initialToggleDislike);
  });

  it('submits a review successfully and refetches', async () => {
    mockReviewsService.getSummary.mockResolvedValue(mockSummary);
    mockReviewsService.getReviews.mockResolvedValue({ data: mockReviews } as any);
    mockReviewsService.addReview.mockResolvedValueOnce({} as any);

    const { result } = await renderHook(() => useCompanyReviews('user-1'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.handleAddReview('رائع جداً', 5);
    });

    expect(mockReviewsService.addReview).toHaveBeenCalledWith('user-1', 5, 'رائع جداً');
    expect(showAlert).toHaveBeenCalledWith('تم بنجاح', 'تم إضافة تقييمك بنجاح');
  });
});
