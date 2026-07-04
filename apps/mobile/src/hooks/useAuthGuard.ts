import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

export function useAuthGuard() {
  const token = useAuthStore((state) => state.token);
  const authSheetRef = useRef<BottomSheetModal>(null);

  const guardAction = (action: () => void) => {
    if (token) {
      action();
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
