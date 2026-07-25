export const NO_IMAGE_SOURCE = require('@/assets/images/no-image.png');

/**
 * Returns an array of image sources (URIs or local require modules).
 * If the provided images array is empty or undefined, returns [NO_IMAGE_SOURCE].
 */
export function getPropertyImages(images?: (string | number)[]): (string | { uri: string } | number)[] {
  if (!images || images.length === 0) {
    return [NO_IMAGE_SOURCE];
  }
  return images;
}

/**
 * Returns the first image source (URI object or local require module).
 * If the provided images array is empty or undefined, returns NO_IMAGE_SOURCE.
 */
export function getFirstPropertyImage(images?: (string | number)[]): { uri: string } | number {
  if (!images || images.length === 0) {
    return NO_IMAGE_SOURCE;
  }
  const first = images[0];
  return typeof first === 'string' ? { uri: first } : first;
}
