import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';

import { useAuthStore } from '@/shared/store/useAuthStore';

export function useAuthGuard() {
  const token = useAuthStore((state) => state.token);
  const authSheetRef = useRef<BottomSheetModal>(null);

  // Returns the action's promise (when signed in) so callers can await the
  // whole guarded operation -- e.g. the chat button's single-flight guard
  // must span the createConversation call, not just the tap. Existing
  // call sites ignore the return value, so this is additive.
  const guardAction = async (action: () => void | Promise<void>) => {
    if (token) {
      await action();
    } else {
      authSheetRef.current?.present();
    }
  };

  return {
    guardAction,
    authSheetRef,
    isGuest: !token,
  };
}
