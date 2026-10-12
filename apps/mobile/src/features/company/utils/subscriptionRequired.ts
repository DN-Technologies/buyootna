import type { Router } from 'expo-router';

import { showAlert } from '@/shared/utils/alert';

export const COMPANY_PLANS_ROUTE = '/company-plans';

/** The API refused an action because the company has no running subscription. */
export function isSubscriptionRequired(error: unknown): boolean {
  const code = (error as { response?: { data?: { code?: string } } })?.response
    ?.data?.code;
  return code === 'SUBSCRIPTION_REQUIRED';
}

/** Tells the company why, with a way to the plans. */
export function promptSubscription(router: Router) {
  showAlert(
    'اشترك للمتابعة',
    'انتهى اشتراك شركتك. اشترك في إحدى الباقات لتستمر في إضافة الخدمات والمشاريع، والرد على الطلبات، وإصدار الفواتير.',
    [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'عرض الباقات',
        onPress: () => router.push(COMPANY_PLANS_ROUTE as never),
      },
    ],
  );
}

/**
 * For a catch block: shows the subscribe prompt and returns true when that
 * was the reason the request failed, so the caller skips its own error.
 */
export function handleSubscriptionRequired(
  error: unknown,
  router: Router,
): boolean {
  if (!isSubscriptionRequired(error)) return false;
  promptSubscription(router);
  return true;
}
