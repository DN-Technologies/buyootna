import { Text, View } from 'react-native';

import { SafeLinearGradient as LinearGradient } from '@/shared/components/SafeLinearGradient';

export default function RecommendedBadge() {
  return (
    <View className="absolute -top-[14px] left-0 right-0 items-center">
      <LinearGradient
        colors={['#FF8D28', '#FACC15']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 22,
          paddingHorizontal: 16,
          paddingVertical: 5,
          height: 28,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text className="font-cairo-semibold leading-[18px] text-xs text-[#111111]">
          موصى به
        </Text>
      </LinearGradient>
    </View>
  );
}
