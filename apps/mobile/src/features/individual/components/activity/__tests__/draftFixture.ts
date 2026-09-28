import { ActivityItem } from '@/shared/hooks/useMyActivity';

export const IMAGE_URLS = [
  'https://bucket.s3.eu-central-1.amazonaws.com/properties/a.jpg',
  'https://bucket.s3.eu-central-1.amazonaws.com/properties/b.jpg',
  'https://bucket.s3.eu-central-1.amazonaws.com/properties/c.jpg',
];

export const makeActivityItem = (
  overrides: Partial<ActivityItem> = {},
): ActivityItem => ({
  id: 'draft-1',
  images: IMAGE_URLS,
  price: 120000,
  type: 'SALE',
  category: 'APARTMENT',
  status: 'DRAFT',
  updatedAt: '2026-09-20T10:00:00.000Z',
  endDate: '2026-09-25T10:00:00.000Z',
  ...overrides,
});

// This RNTL version has no by-type query, so the specs swap expo-image's
// Image for a stub that records the props each image was rendered with
export const renderedImages: { source: unknown; style: unknown }[] = [];

export const mockExpoImage = () => ({
  Image: (props: { source: unknown; style: unknown }) => {
    renderedImages.push(props);
    return null;
  },
});
