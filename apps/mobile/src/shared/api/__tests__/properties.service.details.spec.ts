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

// A مميز ad has up to 15 photos; the upload endpoint takes 10 a request
describe('propertiesService.uploadImages', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uploads 15 photos in two requests (10 + 5) and keeps their order', async () => {
    mockApiClient.post
      .mockResolvedValueOnce({
        data: { urls: Array.from({ length: 10 }, (_, i) => `u${i}`) },
      } as never)
      .mockResolvedValueOnce({
        data: { urls: Array.from({ length: 5 }, (_, i) => `u${i + 10}`) },
      } as never);
    const uris = Array.from({ length: 15 }, (_, i) => `file:///p${i}.jpg`);

    const urls = await propertiesService.uploadImages(uris);

    expect(mockApiClient.post).toHaveBeenCalledTimes(2);
    expect(urls).toEqual(Array.from({ length: 15 }, (_, i) => `u${i}`));
  });

  it('sends up to 10 photos in a single request', async () => {
    mockApiClient.post.mockResolvedValueOnce({ data: { urls: ['a', 'b'] } } as never);

    await propertiesService.uploadImages(['file:///a.jpg', 'file:///b.jpg']);

    expect(mockApiClient.post).toHaveBeenCalledTimes(1);
  });
});
