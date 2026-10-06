import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface AccountBalanceActionsProps {
  hasHistory: boolean;
}

export function AccountBalanceActions({ hasHistory }: AccountBalanceActionsProps) {
  const router = useRouter();

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
      {hasHistory ? (
        <View className="gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/add-listing')}
            className="h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
          >
            <Text className="font-cairo-semibold text-sm text-white">
              إضافة إعلان
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/plans')}
            className="h-12 w-full items-center justify-center rounded-[24px] border border-[#15304D] bg-white"
          >
            <Text className="font-cairo-semibold text-sm text-[#15304D]">
              استعرض الباقات
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/plans')}
          className="h-[48px] w-full items-center justify-center rounded-[24px] bg-[#15304D]"
        >
          <Text className="font-cairo-semibold text-[14px] leading-[22px] text-white">
            استعرض الباقات
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
