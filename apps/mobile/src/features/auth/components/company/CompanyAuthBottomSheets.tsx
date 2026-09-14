import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React from 'react';

import ProfileBottomSheet from '@/features/auth/components/ProfileBottomSheet';
import AccountTypeBottomSheet from '@/shared/components/AccountTypeBottomSheet';
import { AccountType } from '@/types';

interface CompanyAuthBottomSheetsProps {
  accountTypeSheetRef: React.RefObject<BottomSheetModal | null>;
  profileSheetRef: React.RefObject<BottomSheetModal | null>;
  currentType: 'company' | 'office';
  onAccountTypeChange: (type: AccountType) => void;
  onAddAccount: () => void;
}

export const CompanyAuthBottomSheets: React.FC<
  CompanyAuthBottomSheetsProps
> = ({
  accountTypeSheetRef,
  profileSheetRef,
  currentType,
  onAccountTypeChange,
  onAddAccount,
}) => {
  return (
    <>
      <AccountTypeBottomSheet
        ref={accountTypeSheetRef}
        initialType={currentType}
        onContinue={onAccountTypeChange}
      />

      <ProfileBottomSheet
        ref={profileSheetRef}
        onAddAccount={onAddAccount}
      />
    </>
  );
};

export default CompanyAuthBottomSheets;
