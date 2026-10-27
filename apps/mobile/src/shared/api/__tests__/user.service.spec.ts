import apiClient from '@/shared/api/api';
import { reviewsService } from '@/shared/api/reviews.service';
import { userService } from '@/shared/api/user.service';
import { DEFAULT_REVIEW_SUMMARY } from '@/shared/components/profile/types';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('@/shared/api/reviews.service', () => ({
  reviewsService: {
    addReview: jest.fn(),
    toggleLike: jest.fn(),
    toggleDislike: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('normalizes company profile data correctly', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          id: 'comp-1',
          role: 'COMPANY',
          phone: '+96598765432',
          createdAt: '2025-04-15T00:00:00.000Z',
          companyProfile: {
            name: 'شركة بيوتنا العقارية',
            logoUrl: 'https://example.com/company-logo.png',
          },
        },
      });

      const profile = await userService.getUserProfile('comp-1');

      expect(profile).toEqual({
        id: 'comp-1',
        name: 'شركة بيوتنا العقارية',
        avatarUrl: 'https://example.com/company-logo.png',
        // No stats from the API: nothing invented
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: null,
        responseTime: null,
        phone: '+96598765432',
        joinedDate: '4/2025',
        role: 'COMPANY',
      });
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/comp-1');
    });

    it('normalizes office profile data correctly', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          id: 'office-1',
          role: 'OFFICE',
          phone: '98765432',
          createdAt: '2024-11-01T00:00:00.000Z',
          officeProfile: {
            name: 'مكتب النخبة',
            logoUrl: 'https://example.com/office-logo.png',
          },
        },
      });

      const profile = await userService.getUserProfile('office-1');

      expect(profile).toEqual({
        id: 'office-1',
        name: 'مكتب النخبة',
        avatarUrl: 'https://example.com/office-logo.png',
        // No stats from the API: nothing invented
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        presence: null,
        responseTime: null,
        phone: '98765432',
        joinedDate: '11/2024',
        role: 'OFFICE',
      });
    });

    it('maps the real trust signals from stats', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          id: 'user-7',
          role: 'INDIVIDUAL',
          name: 'Ebrahim',
          createdAt: '2025-04-15T00:00:00.000Z',
          stats: {
            identityId: 'ident-7',
            rating: 4.3,
            reviewsCount: 3,
            soldCount: 2,
            presence: { isOnline: false, lastSeenAt: '2026-10-07T09:00:00Z' },
            responseTime: { medianSeconds: 600, sampleSize: 4 },
          },
        },
      });

      const profile = await userService.getUserProfile('ident-7');

      expect(profile).toMatchObject({
        rating: 4.3,
        reviewsCount: 3,
        soldCount: 2,
        presence: { isOnline: false, lastSeenAt: '2026-10-07T09:00:00Z' },
        responseTime: { medianSeconds: 600, sampleSize: 4 },
      });
    });

    it('normalizes individual user data with fallback to email prefix if name is missing', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          id: 'user-1',
          role: 'INDIVIDUAL',
          email: 'ahmed@test.com',
          phone: '+96512345678',
          createdAt: '2025-01-10T00:00:00.000Z',
        },
      });

      const profile = await userService.getUserProfile('user-1');

      expect(profile.name).toBe('ahmed');
      // No photo: null, and Avatar draws the person icon (no placeholder URL)
      expect(profile.avatarUrl).toBeNull();
      expect(profile.joinedDate).toBe('1/2025');
    });
  });

  describe('getUserProperties', () => {
    it('requests properties for the given identityId with limit 100', async () => {
      const mockProperties = [
        { id: 'prop-1', price: 120000, companyName: 'أركان' },
      ];
      mockApiClient.get.mockResolvedValueOnce({
        data: { data: mockProperties },
      });

      const result = await userService.getUserProperties('id-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/properties', {
        params: { identityId: 'id-123', limit: 100 },
      });
      expect(result).toEqual(mockProperties);
    });

    it('returns empty array if response data is missing', async () => {
      mockApiClient.get.mockResolvedValueOnce({ data: {} });

      const result = await userService.getUserProperties('id-123');
      expect(result).toEqual([]);
    });
  });

  describe('getUserReviewsWithSummary', () => {
    it('fetches both reviews and review summary', async () => {
      const mockReviews = [
        { id: 'rev-1', userName: 'خالد', rating: 5, comment: 'ممتاز' },
      ];
      const mockSummary = {
        averageRating: 4.8,
        totalRatingsCount: 10,
        ratingBreakdown: [{ star: 5, pct: '80%' }],
      };

      mockApiClient.get.mockImplementation((url: string) => {
        if (url === '/users/id-1/reviews') {
          return Promise.resolve({ data: { data: mockReviews } });
        }
        if (url === '/users/id-1/reviews/summary') {
          return Promise.resolve({ data: mockSummary });
        }
        return Promise.reject(new Error('Unknown url'));
      });

      const result = await userService.getUserReviewsWithSummary('id-1', 'all');

      expect(result.reviews).toEqual(mockReviews);
      expect(result.summary).toEqual(mockSummary);
    });

    it('handles review fetch failures gracefully with defaults', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await userService.getUserReviewsWithSummary('id-1', 'all');

      expect(result.reviews).toEqual([]);
      expect(result.summary).toEqual(DEFAULT_REVIEW_SUMMARY);
    });
  });

  describe('review actions delegation', () => {
    it('delegates addUserReview to reviewsService.addReview', async () => {
      await userService.addUserReview('target-1', 5, 'Great service');
      expect(reviewsService.addReview).toHaveBeenCalledWith(
        'target-1',
        5,
        'Great service',
      );
    });

    it('delegates toggleReviewLike to reviewsService.toggleLike', async () => {
      await userService.toggleReviewLike('rev-123');
      expect(reviewsService.toggleLike).toHaveBeenCalledWith('rev-123');
    });

    it('delegates toggleReviewDislike to reviewsService.toggleDislike', async () => {
      await userService.toggleReviewDislike('rev-123');
      expect(reviewsService.toggleDislike).toHaveBeenCalledWith('rev-123');
    });
  });
});
