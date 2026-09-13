import { Image } from 'expo-image';
import { Animated, Text, View } from 'react-native';

interface ActivitySuccessToastProps {
  visible: boolean;
  message: string;
  subtitle: string | null;
  bottomOffset: number;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
}

export default function ActivitySuccessToast({
  visible,
  message,
  subtitle,
  bottomOffset,
  fadeAnim,
  slideAnim,
}: ActivitySuccessToastProps) {
  if (!visible) return null;

  return (
    <Animated.View
      style={{
        bottom: bottomOffset,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        elevation: 5,
      }}
      className="absolute left-[20px] right-[20px] z-[999] flex-row items-center justify-between rounded-xl border border-[#33D679] bg-white px-4 py-3.5 shadow-lg"
    >
      <View className="flex-row items-center gap-2.5">
        <Image
          source={require('@/assets/icons/success-icon.svg')}
          style={{ width: 24, height: 24 }}
        />
        <View className="items-start">
          <Text
            className="font-cairo-semibold text-[14px] leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {message}
          </Text>
          {subtitle && (
            <Text
              className="mt-0.5 font-cairo text-[12px] leading-[18px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
