import type { Href } from 'expo-router';
import { router } from 'expo-router';

import type { IdentityType } from '@/shared/store/useAuthStore';

/**
 * Single source of truth for "which route group is home for this identity".
 * Guests and unrecognized/null identity types fall back to individual.
 */
export function getIdentityHomeRoute(type: IdentityType | null | undefined): Href {
  switch (type) {
    case 'COMPANY':
      return '/(company)/home';
    case 'OFFICE':
      return '/(office)/office-home';
    case 'INDIVIDUAL':
    default:
      return '/(individual)/home';
  }
}

/**
 * Navigate to the authenticated home for `type` and drop every screen the
 * (auth) flow pushed (selection, login/signup, OTP) from history, so a
 * post-auth edge swipe-back can't return the user to those screens. Auth
 * flows all live on the same native stack as the app groups, so a plain
 * push/replace only touches the top entry and leaves the auth screens
 * mounted underneath.
 */
export function resetToIdentityHome(type: IdentityType | null | undefined) {
  if (typeof router.canDismiss === 'function' && router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(getIdentityHomeRoute(type));
}
