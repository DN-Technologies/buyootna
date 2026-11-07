import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

import { useAuthStore } from '@/shared/store/useAuthStore';

import SubmitVerificationSheet from './SubmitVerificationSheet';
import { useCompanyVerification } from './useCompanyVerification';
import VerificationButton from './VerificationButton';
import VerificationDetailsSheet from './VerificationDetailsSheet';
import VerificationResultSheet from './VerificationResultSheet';

// «حسابك موثق بنجاح» shows once per approved request
const SEEN_KEY = (requestId: string) =>
  `verification-approved-seen:${requestId}`;

/**
 * The company card's «طلب التوثيق» button and its sheets:
 * - none: «طلب توثيق» opens «تقديم طلب توثيق», then «تم إرسال طلبك بنجاح»
 * - under review: «طلبك قيد المراجعة» opens «تفاصيل طلب التوثيق»
 * - sent back: «استكمال البيانات» opens the screen to fix the fields
 * - verified: «حساب موثق», and «حسابك موثق بنجاح» the first time
 */
export default function CompanyVerificationAction() {
  const router = useRouter();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const { identityId, request, state, refetch, invalidate } =
    useCompanyVerification();

  const submitSheetRef = useRef<BottomSheetModal>(null);
  const sentSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const verifiedSheetRef = useRef<BottomSheetModal>(null);

  // The admin may have decided since: check again on each visit
  useFocusEffect(
    useCallback(() => {
      if (identityId) refetch();
    }, [identityId, refetch]),
  );

  const approvedId =
    state === 'verified' && request?.status === 'APPROVED' ? request.id : null;
  useEffect(() => {
    if (!approvedId) return;
    let cancelled = false;
    (async () => {
      try {
        if (await AsyncStorage.getItem(SEEN_KEY(approvedId))) return;
        await AsyncStorage.setItem(SEEN_KEY(approvedId), '1');
      } catch {
        return;
      }
      if (cancelled) return;
      // The «موثق» badge next to the name comes with the profile
      refreshProfile();
      verifiedSheetRef.current?.present();
    })();
    return () => {
      cancelled = true;
    };
  }, [approvedId, refreshProfile]);

  const onPress = () => {
    switch (state) {
      case 'none':
        submitSheetRef.current?.present();
        break;
      case 'pending':
        detailsSheetRef.current?.present();
        break;
      case 'changes-requested':
        router.push('/company-verification');
        break;
      default:
        break;
    }
  };

  const onSent = async () => {
    await invalidate();
    sentSheetRef.current?.present();
  };

  return (
    <>
      <VerificationButton state={state} onPress={onPress} />
      <SubmitVerificationSheet
        ref={submitSheetRef}
        identityId={identityId}
        onSent={onSent}
      />
      <VerificationResultSheet ref={sentSheetRef} variant="sent" />
      <VerificationDetailsSheet ref={detailsSheetRef} request={request} />
      <VerificationResultSheet ref={verifiedSheetRef} variant="verified" />
    </>
  );
}
