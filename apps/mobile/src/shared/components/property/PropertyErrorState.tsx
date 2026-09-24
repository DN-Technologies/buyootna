import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface PropertyErrorStateProps {
  onBack: () => void;
}

export default function PropertyErrorState({ onBack }: PropertyErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <Feather name="alert-circle" size={32} color="#EF4444" />
      </View>
      <Text className="mb-2 text-center font-cairo-bold text-2xl text-[#111111]">
        عذراً، حدث خطأ ما
      </Text>
      <Text className="mb-8 px-4 text-center font-cairo-semibold text-base leading-6 text-[#6B6A6A]">
        عذراً، هذا العقار غير موجود أو تم حذفه
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBack}
        className="w-full items-center justify-center rounded-3xl bg-[#0B2239] py-4"
        accessibilityRole="button"
        accessibilityLabel="الرجوع للخلف"
      >
        <Text className="font-cairo-bold text-lg text-white">الرجوع للخلف</Text>
      </TouchableOpacity>
    </View>
  );
}
