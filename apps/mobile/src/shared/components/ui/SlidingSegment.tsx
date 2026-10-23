import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import {
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// UIKit's segmented-control feel: a quick, barely-bouncing spring
export const IOS_SPRING = { duration: 380, dampingRatio: 0.86 } as const;

interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SlidingSegmentProps<T extends string> {
  // In reading order: the first one is on the right
  options: T[];
  value: T;
  renderOption: (id: T, active: boolean) => ReactNode;
  // The selected background (colour, radius, border)
  thumbStyle: ViewStyle;
  // Each option's slot (e.g. flex: 1 for equal widths)
  optionStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
}

/**
 * A segmented control whose selected background slides to the new choice on
 * a spring, as on iOS, resizing as it goes when the options differ in width.
 *
 * Laid out left to right internally (options reversed), so the measured
 * frames and the thumb's `left` mean the same thing under the app's forced
 * RTL, where `left` and `right` are otherwise swapped.
 */
export default function SlidingSegment<T extends string>({
  options,
  value,
  renderOption,
  thumbStyle,
  optionStyle,
  style,
  className,
  testID,
}: SlidingSegmentProps<T>) {
  const frames = useRef<Partial<Record<T, Frame>>>({});
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);
  const shown = useSharedValue(0);

  const place = useCallback(
    (id: T) => {
      const f = frames.current[id];
      if (!f) return;
      y.value = f.y;
      height.value = f.height;
      if (shown.value) {
        x.value = withSpring(f.x, IOS_SPRING);
        width.value = withSpring(f.width, IOS_SPRING);
      } else {
        // The first placement doesn't slide in from the edge
        x.value = f.x;
        width.value = f.width;
        shown.value = 1;
      }
    },
    [x, y, width, height, shown],
  );

  useEffect(() => {
    place(value);
  }, [value, place]);

  const thumb = useAnimatedStyle(() => ({
    opacity: shown.value,
    top: y.value,
    height: height.value,
    width: width.value,
    transform: [{ translateX: x.value }],
  }));

  return (
    <View
      testID={testID}
      className={className}
      style={[style, { flexDirection: 'row', direction: 'ltr' }]}
    >
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', left: 0 }, thumbStyle, thumb]}
      />
      {[...options].reverse().map((id) => (
        <View
          key={id}
          style={optionStyle}
          onLayout={(e: LayoutChangeEvent) => {
            frames.current[id] = e.nativeEvent.layout;
            // Follows the selected option when it resizes (a label showing)
            if (id === value) place(id);
          }}
        >
          {renderOption(id, id === value)}
        </View>
      ))}
    </View>
  );
}
