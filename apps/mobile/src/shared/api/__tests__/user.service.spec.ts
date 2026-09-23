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
        rating: 4.5,
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
        rating: 4.5,
        phone: '98765432',
        joinedDate: '11/2024',
        role: 'OFFICE',
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
      expect(profile.avatarUrl).toBe('https://via.placeholder.com/150');
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
