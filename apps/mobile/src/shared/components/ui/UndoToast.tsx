import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface UndoToastProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
  testID?: string;
}

/**
 * Figma success message with «تراجع»: green border, the check and the
 * message on the right, the undo on the left. Hides itself after
 * `duration` ms.
 */
export default function UndoToast({
  visible,
  message,
  onUndo,
  onDismiss,
  duration = 4000,
  testID = 'undo-toast',
}: UndoToastProps) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      fade.setValue(0);
      return;
    }
    Animated.timing(fade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, message, duration, fade, onDismiss]);

  if (!visible) return null;

  return (
    <Animated.View
      testID={testID}
      style={{
        opacity: fade,
        elevation: 4,
        shadowColor: '#212529',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 2 },
      }}
      className="absolute left-4 right-4 top-2 z-50 flex-row items-center gap-2 rounded-[8px] border border-[#15A72B] bg-white px-4 py-[10px]"
    >
      {/* Under RTL the first child sits on the right */}
      <View className="flex-1 flex-row items-center gap-2 py-2">
        <Image
          source={require('@/assets/icons/portfolio/toast-check.svg')}
          style={{ width: 23.5, height: 24 }}
          contentFit="contain"
        />
        <Text
          className="shrink font-cairo-semibold text-[14px] tracking-[0.28px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {message}
        </Text>
      </View>
      <TouchableOpacity
        testID={`${testID}-undo`}
        activeOpacity={0.7}
        onPress={onUndo}
        className="h-10 justify-center"
      >
        <Text className="font-cairo-bold text-[14px] text-[#15304D]">
          تراجع
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
