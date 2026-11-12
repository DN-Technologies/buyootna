import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';

import AuthGuardSheet from '@/shared/components/auth/AuthGuardSheet';
import { useSignInPrompt } from '@/shared/store/useSignInPrompt';

/** The app-wide sign-in sheet behind requestSignIn(). Mounted once. */
export default function GlobalSignInPrompt() {
  const requestId = useSignInPrompt((s) => s.requestId);
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (requestId > 0) sheetRef.current?.present();
  }, [requestId]);

  return <AuthGuardSheet ref={sheetRef} />;
}
