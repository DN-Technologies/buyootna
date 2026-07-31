import { Image } from 'expo-image';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

export interface AlertSuccessToastProps {
  message: string;
  visible: boolean;
  onUndo: () => void;
  onHide: () => void;
}

export default function AlertSuccessToast({
  message,
  visible,
  onUndo,
  onHide,
}: AlertSuccessToastProps) {
  const translateY = useRef(new Animated.Value(100)).current; // Start below the screen
  const opacity = useRef(new Animated.Value(0)).current;

  const handleClose = useCallback(() => {
    // Slide down and fade out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(); // Tell parent component it has finished hiding
    });
  }, [opacity, translateY, onHide]);

  useEffect(() => {
    if (visible) {
      // Slide up and fade in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, handleClose, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
      className="elevation-5 absolute bottom-10 left-5 right-5 z-50 flex-row items-center justify-between rounded-[16px] border border-gray-100 bg-white p-4 shadow-lg"
    >
      {/* Right: Message & Icon */}
      <View className="flex-row items-center justify-center gap-1.5">
        <Image
          source={require('@/assets/icons/search/success-notify-icon.svg')}
          style={{ width: 18, height: 18 }}
          contentFit="contain"
        />
        <Text className="font-cairo-semibold text-sm leading-[21px] text-[#111111]">
          {message}
        </Text>
      </View>

      {/* Left: Undo Button */}
      <TouchableOpacity
        onPress={() => {
          onUndo();
          handleClose();
        }}
      >
        <Text className="font-cairo-bold text-sm text-[#15304D]">تراجع</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
