import { useRouter } from 'expo-router';

import { useAuthStore } from '@/shared/store/useAuthStore';

/** Where the chat's pinned ad / request and its ad cards lead. */
export function useChatNavigation(pinnedPropertyId?: string) {
  const router = useRouter();

  // The company opens the request it received; the requester opens their
  // own request
  const openRequest = (requestId: string) =>
    router.push(
      useAuthStore.getState().activeIdentity?.type === 'COMPANY'
        ? `/(company)/(requests)/${requestId}`
        : ({
            pathname: '/request-details/[id]',
            params: { id: requestId },
          } as never),
    );

  const openProperty = (propertyId: string) =>
    router.push(`/property/${propertyId}`);

  // An ad card in the messages; one without an id falls back to the pinned ad
  const openMessageProperty = (propertyId?: string) => {
    const targetId = propertyId || pinnedPropertyId;
    if (targetId) openProperty(targetId);
  };

  return { openRequest, openProperty, openMessageProperty };
}
