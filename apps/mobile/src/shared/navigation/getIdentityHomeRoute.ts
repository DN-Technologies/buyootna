import type { Href } from 'expo-router';

import type { IdentityType } from '@/shared/store/useAuthStore';

/**
 * Single source of truth for "which route group is home for this identity".
 * Guests and unrecognized/null identity types fall back to individual.
 */
export function getIdentityHomeRoute(type: IdentityType | null | undefined): Href {
  switch (type) {
    case 'COMPANY':
      return '/(company)/company-home';
    case 'OFFICE':
      return '/(office)/office-home';
    case 'INDIVIDUAL':
    default:
      return '/(individual)/home';
  }
}
