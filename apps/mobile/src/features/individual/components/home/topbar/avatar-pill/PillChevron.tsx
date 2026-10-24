import { Image } from 'expo-image';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

interface PillChevronProps {
  open: boolean;
  // Its turn and its nudge, driven by the pill
  chevronStyle: AnimatedStyle<ViewStyle>;
  onPress: () => void;
}

/** ‹ opens the pill, › closes it. */
export default function PillChevron({ open, chevronStyle, onPress }: PillChevronProps) {
  return (
    <TouchableOpacity
      testID="avatar-pill-toggle"
      accessibilityRole="button"
      accessibilityLabel={open ? 'إغلاق' : 'فتح'}
      hitSlop={10}
      onPress={onPress}
      className="size-[20px] items-center justify-center"
    >
      {/* Closed it points away from the photo (‹), open back at it (›) */}
      <Animated.View style={chevronStyle}>
        <Image
          source={require('@/assets/icons/home/topbar/chevron.svg')}
          style={{ width: 14, height: 14 }}
          contentFit="contain"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
