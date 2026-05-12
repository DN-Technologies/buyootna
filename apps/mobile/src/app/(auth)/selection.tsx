import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import SelectionCard from "@/components/SelectionCard";
import AppLogo from "@/core/components/AppLogo";
import { AccountType } from "@/types";

export default function AccountTypeSelectionScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AccountType>(null);

  const handleStartRegistration = () => {
    if (selectedType === "individual") {
      router.push("/(auth)/individual-register");
    } else if (selectedType === "company") {
      router.push("/(auth)/company-register");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-12 pb-6">
        {/* Header Section */}
        <View className="items-center mb-10">
          <AppLogo width={75} height={100} dark={true} />

          <Text className="text-2xl font-cairo-bold text-[#111] mb-2 mt-3 text-center">
            اختر نوع حسابك للبدء
          </Text>
          <Text className="text-base text-[#6B6A6A] font-cairo-medium text-center leading-2">
            حدد الطريقة التي تناسبك لاستخدام التطبيق، سواء كنت فرد تبحث أو تنشر
            إعلان، شركة تعرض مشاريعها وخدماتها، أو مالك عقار.
          </Text>
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
          onPress={handleStartRegistration}
          className={`w-full py-4 rounded-3xl items-center justify-center ${
            selectedType ? "bg-[#0B2239]" : "bg-[#A6A6A6]"
          }`}
        >
          <Text
            className={`text-lg font-bold  ${
              selectedType ? "text-white" : "text-gray-500"
            }`}
          >
            بدء التسجيل
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
