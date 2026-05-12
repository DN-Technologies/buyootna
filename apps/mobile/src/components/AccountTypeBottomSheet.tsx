import { forwardRef, useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import SelectionCard from "./SelectionCard";
import { AccountType } from "@/types";
import AppLogo from "@/core/components/AppLogo";
import { Feather } from "@expo/vector-icons";

interface AccountTypeBottomSheetProps {
  onContinue: (type: AccountType) => void;
}

const AccountTypeBottomSheet = forwardRef<
  BottomSheetModal,
  AccountTypeBottomSheetProps
>(({ onContinue }, ref) => {
  // Defines how high the sheet snaps up. Adjust percentage as needed.
  const snapPoints = useMemo(() => ["65%"], []);
  const [selectedType, setSelectedType] = useState<AccountType>(null);

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
          <View className="flex-1">
            <Text className="text-2xl font-cairo-bold text-[#111] mb-2 mt-3 text-center">
              اختر نوع حسابك للبدء
            </Text>
            <Text className="text-base text-[#6B6A6A] font-cairo-medium text-center leading-2">
              حدد الطريقة التي تناسبك لاستخدام التطبيق، سواء كنت فرد تبحث أو
              تنشر إعلان، شركة تعرض مشاريعها وخدماتها، أو مالك عقار.
            </Text>
          </View>

          {/* Close Button (X) */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            className="ml-4 p-1 bg-gray-100 rounded-full"
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
            isSelected={selectedType === "individual"}
            onPress={() => setSelectedType("individual")}
          />

          <SelectionCard
            title="شركة"
            description="للمكاتب العقارية والهندسية أو محلات المقاولات التي تقدم خدمات بيع، تسويق، تصميم."
            type="company"
            isSelected={selectedType === "company"}
            onPress={() => setSelectedType("company")}
          />
        </View>
        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedType}
          onPress={() => {
            if (selectedType) {
              onContinue(selectedType);
              handleClose();
            }
          }}
          className={`w-full py-4 rounded-xl items-center justify-center mt-auto ${
            selectedType ? "bg-[#0B2239]" : "bg-gray-300"
          }`}
        >
          <Text
            className={`text-lg font-bold ${
              selectedType ? "text-white" : "text-gray-500"
            }`}
          >
            بدء التسجيل
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default AccountTypeBottomSheet;
