import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface NotificationDeleteToastProps {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function NotificationDeleteToast({
  visible,
  onUndo,
  onDismiss,
  duration = 4000,
}: NotificationDeleteToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [visible, duration, fadeAnim, slideAnim, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        elevation: 6,
      }}
      className="absolute bottom-8 left-4 right-4 z-50 flex-row items-center justify-between rounded-[8px] border border-[#15A72B] bg-white px-4 py-2.5 shadow-md"
    >
      {/* Left: Undo Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onUndo}
        className="px-2 py-1"
        accessibilityLabel="تراجع عن حذف الإشعار"
      >
        <Text
          className="font-cairo-bold text-[14px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          تراجع
        </Text>
      </TouchableOpacity>

      {/* Right: Text + Verified Checkmark Badge */}
      <View className="flex-row items-center gap-2">
        <Text
          className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          تم حذف الإشعار
        </Text>
        <Image
          source={require('@/assets/icons/success-icon.svg')}
          style={{ width: 24, height: 24 }}
        />
      </View>
    </Animated.View>
  );
}
