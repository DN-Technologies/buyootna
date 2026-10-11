import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';

interface AlertDeleteToastProps {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
  testID?: string;
}

export default function AlertDeleteToast({
  visible,
  onUndo,
  onDismiss,
  duration = 4000,
  testID,
}: AlertDeleteToastProps) {
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
      testID={testID}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        elevation: 6,
      }}
      className="absolute bottom-8 left-4 right-4 z-50 flex-row items-center justify-between rounded-[8px] border border-[#018B1B] bg-white px-4 py-2.5 shadow-md"
    >
      {/* Left: Undo Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onUndo}
        className="px-2 py-1"
        accessibilityLabel="تراجع عن حذف التنبيه"
        testID="alert-delete-undo-btn"
      >
        <Text
          className="font-cairo-bold text-[14px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          تراجع
        </Text>
      </TouchableOpacity>

      {/* Right: Message */}
      <Text
        className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        تم حذف التنبيه بنجاح.
      </Text>
    </Animated.View>
  );
}
