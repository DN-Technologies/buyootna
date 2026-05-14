import { forwardRef, useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { AccountType } from "@/core/types";
import { Feather } from "@expo/vector-icons";
import SelectionCard from "@/components/SelectionCard";

interface AccountTypeBottomSheetProps {
  onContinue: (type: AccountType) => void;
  initialType?: AccountType;
}

const AccountTypeBottomSheet = forwardRef<
  BottomSheetModal,
  AccountTypeBottomSheetProps
>(({ onContinue, initialType = null }, ref) => {
  // Defines how high the sheet snaps up. Adjust percentage as needed.
  const snapPoints = useMemo(() => ["65%"], []);
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
    if (ref && "current" in ref && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40 }}
      backgroundStyle={{ backgroundColor: "#FFFFFF", borderRadius: 24 }}
    >
      <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-6">
          {/* Close Button (X) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="mr-4 p-1 bg-gray-100 rounded-full"
          >
            <Feather name="x" size={20} color="#64748B" />
          </TouchableOpacity>

          <Text className="text-xl font-cairo-semibold text-charcoal mb-2 mt-3">
            اختر نوع حسابك للبدء
          </Text>
        </View>

        {/* Selection Cards */}
        <View className="flex-1">
          <SelectionCard
            title="فرد"
            description="للأشخاص الراغبين في إضافة إعلان بيع أو إيجار أو بدل لعقاراتهم الخاص."
            type="individual"
            isSelected={selectedType === "individual"}
            onPress={() => {
              setSelectedType("individual");
              onContinue("individual");
              handleClose();
            }}
          />

          <SelectionCard
            title="شركة"
            description="للمكاتب العقارية والهندسية أو محلات المقاولات التي تقدم خدمات بيع، تسويق، تصميم."
            type="company"
            isSelected={selectedType === "company"}
            onPress={() => {
              setSelectedType("company");
              onContinue("company");
              handleClose();
            }}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default AccountTypeBottomSheet;
