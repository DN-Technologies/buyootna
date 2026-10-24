import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import SlidingSegment, { SEGMENT_MS } from './SlidingSegment';

/**
 * The label turning bold as the selection arrives (and back as it leaves):
 * the regular and bold words crossfade over the glide instead of the
 * weight snapping at the start of it.
 */
function CrossfadeLabel({ label, active }: { label: string; active: boolean }) {
  const bold = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    bold.value = withTiming(active ? 1 : 0, { duration: SEGMENT_MS * 0.7 });
  }, [active, bold]);
  const regularStyle = useAnimatedStyle(() => ({ opacity: 1 - bold.value }));
  const boldStyle = useAnimatedStyle(() => ({ opacity: bold.value }));
  const text = 'text-[14px] leading-[24px] text-[#111111]';
  return (
    <>
      <Animated.Text numberOfLines={1} className={`font-cairo ${text}`} style={regularStyle}>
        {label}
      </Animated.Text>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.centred, boldStyle]}>
        <Text
          numberOfLines={1}
          accessibilityElementsHidden
          importantForAccessibility="no"
          className={`font-cairo-bold ${text}`}
        >
          {label}
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  centred: { alignItems: 'center', justifyContent: 'center' },
});

export interface GoldSegmentOption<T extends string> {
  id: T;
  label: string;
}

interface GoldSegmentProps<T extends string> {
  // In reading order: the first one is on the right
  options: GoldSegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

/**
 * The gold-bordered segment of the home and «القصص» (Figma Component 72):
 * the cream selection slides to the chosen option, iOS-style, and it turns
 * bold.
 */
export default function GoldSegment<T extends string>({
  options,
  value,
  onChange,
  testID,
}: GoldSegmentProps<T>) {
  const labels = new Map(options.map((o) => [o.id, o.label]));
  return (
    <SlidingSegment
      testID={testID}
      options={options.map((o) => o.id)}
      value={value}
      className="h-[42px] flex-1 items-center rounded-full px-[6px] py-[4px]"
      style={{ borderWidth: 0.3, borderColor: '#C5A36D' }}
      optionStyle={{ flex: 1 }}
      thumbStyle={{ backgroundColor: '#FBEFCD', borderRadius: 16 }}
      renderOption={(id, active) => (
        <TouchableOpacity
          testID={testID ? `${testID}-${id}` : undefined}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          activeOpacity={0.7}
          onPress={() => onChange(id)}
          className="h-[32px] items-center justify-center px-[12px]"
        >
          <CrossfadeLabel label={labels.get(id) ?? ''} active={active} />
        </TouchableOpacity>
      )}
    />
  );
}
