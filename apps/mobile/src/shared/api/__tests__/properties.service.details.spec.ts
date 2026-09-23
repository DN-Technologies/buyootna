import { Image } from 'expo-image';

import apiClient from '@/shared/api/api';
import { propertiesService } from '@/shared/api/properties.service';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('expo-image', () => ({
  Image: {
    prefetch: jest.fn(() => Promise.resolve(true)),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('propertiesService.getPropertyDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches property by id, prefetches hero image, and increments views', async () => {
    const mockProperty = {
      id: 'prop-123',
      title: 'بيت للبيع',
      images: ['https://example.com/hero.jpg', 'https://example.com/hero2.jpg'],
    };

    mockApiClient.get.mockResolvedValueOnce({ data: mockProperty });
    mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } });

    const result = await propertiesService.getPropertyDetails('prop-123');

    expect(mockApiClient.get).toHaveBeenCalledWith('/properties/prop-123');
    expect(Image.prefetch).toHaveBeenCalledWith('https://example.com/hero.jpg');
    expect(mockApiClient.patch).toHaveBeenCalledWith('/properties/prop-123/view');
    expect(result).toEqual(mockProperty);
  });

  it('handles empty images without attempting prefetch', async () => {
    const mockProperty = {
      id: 'prop-456',
      title: 'أرض للبيع',
      images: [],
    };

    mockApiClient.get.mockResolvedValueOnce({ data: mockProperty });
    mockApiClient.patch.mockResolvedValueOnce({ data: { success: true } });

    const result = await propertiesService.getPropertyDetails('prop-456');

    expect(mockApiClient.get).toHaveBeenCalledWith('/properties/prop-456');
    expect(Image.prefetch).not.toHaveBeenCalled();
    expect(mockApiClient.patch).toHaveBeenCalledWith('/properties/prop-456/view');
    expect(result).toEqual(mockProperty);
  });
});
