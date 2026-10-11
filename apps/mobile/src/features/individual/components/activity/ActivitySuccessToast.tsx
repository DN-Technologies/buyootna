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
        elevation: 3,
        // Figma "Shadow/Low"
        shadowColor: '#212529',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
      className="absolute left-4 right-4 z-[999] flex-row items-center justify-between rounded-[8px] border border-[#15A72B] bg-white px-4 py-[10px]"
    >
      <View className="flex-row items-center gap-2 py-2">
        <Image
          source={require('@/assets/icons/success-icon.svg')}
          style={{ width: 24, height: 24 }}
        />
        <View className="items-start">
          <Text
            className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
            style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
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
