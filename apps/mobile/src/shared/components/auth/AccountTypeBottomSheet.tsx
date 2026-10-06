import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SelectionCard from '@/shared/components/ui/SelectionCard';
import { AccountType } from '@/types';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

// Company option stays hidden unless explicitly enabled via env
// (EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS=true) — e.g. on the feat/companies
// branch. Unset elsewhere (dev/main/production) keeps it hidden.
const COMPANIES_ENABLED =
  process.env.EXPO_PUBLIC_ENABLE_COMPANY_ACCOUNTS === 'true';

interface AccountTypeBottomSheetProps {
  onContinue: (type: AccountType) => void;
  initialType?: AccountType;
}

const AccountTypeBottomSheet = forwardRef<
  BottomSheetModal,
  AccountTypeBottomSheetProps
>(({ onContinue, initialType = null }, ref) => {
  // Defines how high the sheet snaps up. Adjust percentage as needed.
  const snapPoints = useMemo(() => ['65%'], []);
  const [selectedType, setSelectedType] = useState<AccountType>(initialType);

  // Creates the dark overlay behind the bottom sheet
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  // Dismiss helper
  const handleClose = () => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <SafeBottomSheetView className="flex-1 px-6 pb-8 pt-2">
        {/* Header Section */}
        <View className="mb-6 flex-row items-start justify-between">
          <Text className="mb-2 mt-3 font-cairo-semibold text-xl text-charcoal">
            اختر نوع حسابك للبدء
          </Text>
          {/* Close Button (X) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="mr-4 rounded-full bg-gray-100 p-1"
          >
            <Feather name="x" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Selection Cards */}
        <View className="flex-1">
          <SelectionCard
            title="فرد"
            description="للأشخاص الراغبين في إضافة إعلان بيع أو إيجار أو بدل لعقاراتهم الخاص."
            type="individual"
            isSelected={selectedType === 'individual'}
            onPress={() => {
              setSelectedType('individual');
              onContinue('individual');
              handleClose();
            }}
          />

          {COMPANIES_ENABLED && (
            <SelectionCard
              title="شركة"
              description="للمكاتب العقارية والهندسية أو محلات المقاولات التي تقدم خدمات بيع، تسويق، تصميم."
              type="company"
              isSelected={selectedType === 'company'}
              onPress={() => {
                setSelectedType('company');
                onContinue('company');
                handleClose();
              }}
            />
          )}
        </View>
      </SafeBottomSheetView>
    </BottomSheetModal>
  );
});

AccountTypeBottomSheet.displayName = 'AccountTypeBottomSheet';

export default AccountTypeBottomSheet;
