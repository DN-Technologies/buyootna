import type { Href } from 'expo-router';
import { router } from 'expo-router';

import type { IdentityType } from '@/shared/store/useAuthStore';

import { resetToProfileHome } from './resetToProfileHome';
import { getRootNavigationRef } from './rootNavigation';

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
 * Where this identity browses packages. A company's are subscriptions with
 * their own screen; /plans sells individuals' and offices' ad packages.
 */
export function getIdentityPlansRoute(
  type: IdentityType | null | undefined,
): Href {
  return type === 'COMPANY' ? ('/company-plans' as Href) : '/plans';
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
  // The profile's home alone on the stack holding the profile groups, in one
  // step. dismissAll() only cleared the nearest stack: from a screen pushed
  // over another profile's tabs (settings, «إضافة حساب», the profile
  // switcher's flows) it fell back to those tabs, and the old profile's
  // layout stayed until a restart (QA)
  const rootRef = getRootNavigationRef();
  if (rootRef && resetToProfileHome(rootRef, type ?? 'INDIVIDUAL')) return;

  if (typeof router.canDismiss === 'function' && router.canDismiss()) {
    router.dismissAll();
  }
  router.replace(getIdentityHomeRoute(type));
}

/**
 * After the account is gone or signed out everywhere (deleting it, deactivating
 * it, «تسجيل الخروج من جميع الأجهزة»): the guest home alone on the stack, with
 * the login screen over it. A plain replace to the login screen swapped only
 * the top screen: from settings over a company's tabs, Back (or the login
 * screen's close) showed the deleted company's layout, signed out, until a
 * restart (QA).
 */
export function resetToSignedOut() {
  resetToIdentityHome(null);
  router.push('/(auth)/individual-auth');
}
