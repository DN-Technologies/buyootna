import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';

import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import AccountTypeBottomSheet from '@/shared/components/AccountTypeBottomSheet';
import SuccessBottomSheet from '@/shared/components/SuccessBottomSheet';
import { AccountType } from '@/types';

interface IndividualAuthBottomSheetsProps {
  accountTypeSheetRef: React.RefObject<BottomSheetModal | null>;
  profileSheetRef: React.RefObject<BottomSheetModal | null>;
  successSheetRef: React.RefObject<BottomSheetModal | null>;
  onAccountTypeChange: (type: AccountType) => void;
  onAddAccount: () => void;
  onSuccessClose: () => void;
}

export const IndividualAuthBottomSheets: React.FC<
  IndividualAuthBottomSheetsProps
> = ({
  accountTypeSheetRef,
  profileSheetRef,
  successSheetRef,
  onAccountTypeChange,
  onAddAccount,
  onSuccessClose,
}) => {
  return (
    <>
      <AccountTypeBottomSheet
        ref={accountTypeSheetRef}
        initialType="individual"
        onContinue={onAccountTypeChange}
      />

      <ProfileBottomSheet
        ref={profileSheetRef}
        onAddAccount={onAddAccount}
      />

      <SuccessBottomSheet
        ref={successSheetRef}
        title="تم بنجاح"
        description="تم تفعيل حسابك وتسجيل الدخول بنجاح"
        buttonText="ابدأ الآن"
        onPress={onSuccessClose}
      />
    </>
  );
};

export default IndividualAuthBottomSheets;
