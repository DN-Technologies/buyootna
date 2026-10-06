import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AccountBalanceActionsProps {
  hasHistory: boolean;
}

export function AccountBalanceActions({ hasHistory }: AccountBalanceActionsProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pt-4"
      // Clear of the home indicator / nav bar (bottom edge isn't safe)
      style={{ paddingBottom: insets.bottom + 16 }}
    >
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
