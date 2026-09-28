import { useCallback, useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface FavoritesUndoToastProps {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  message?: string;
  duration?: number;
}

export default function FavoritesUndoToast({
  visible,
  onUndo,
  onDismiss,
  message = 'تمت الإزالة من المفضلة',
  duration = 4000,
}: FavoritesUndoToastProps) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  // The latest onDismiss, so the auto-dismiss timer never calls a stale one
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Slides the toast in (shown) or out, then runs `done`
  const animateTo = useCallback(
    (shown: boolean, done?: () => void) => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: shown ? 1 : 0,
          duration: shown ? 250 : 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: shown ? 0 : 20,
          duration: shown ? 250 : 200,
          useNativeDriver: true,
        }),
      ]).start(done);
    },
    [opacityAnim, translateYAnim],
  );

  const handleDismiss = useCallback(() => {
    animateTo(false, () => onDismissRef.current());
  }, [animateTo]);

  useEffect(() => {
    if (!visible) {
      animateTo(false);
      return;
    }
    animateTo(true);
    const timer = setTimeout(handleDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, animateTo, handleDismiss]);

  const handleUndo = () => {
    handleDismiss();
    onUndo();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: translateYAnim }],
        elevation: 5,
        shadowColor: '#212529',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      }}
      className="absolute bottom-6 left-4 right-4 z-50 rounded-[12px] border border-[#ECECEC] bg-white px-4 py-3"
    >
      <View className="w-full flex-row items-center justify-between">
        {/* Undo CTA on Left */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleUndo}
          className="py-1 pr-2"
        >
          <Text className="font-cairo-bold text-sm text-[#15304D]">
            تراجع
          </Text>
        </TouchableOpacity>

        {/* Message on Right */}
        <Text className="font-cairo-semibold text-sm text-[#111111]">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
