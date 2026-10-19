import { Animated, View } from 'react-native';

interface StoryProgressBarsProps {
  count: number;
  current: number;
  // 0 → 1 for the current story
  progress: Animated.Value;
}

/**
 * One bar per story. Bars before the current one are full; the current one
 * fills with `progress`. Laid out in the app's direction, so in RTL they
 * run (and fill) right to left.
 */
export default function StoryProgressBars({
  count,
  current,
  progress,
}: StoryProgressBarsProps) {
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return (
    <View className="flex-row gap-1" testID="story-progress">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          testID={`story-progress-${i}`}
          className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/40"
        >
          {i < current ? (
            <View className="h-full w-full bg-white" />
          ) : i === current ? (
            <Animated.View className="h-full bg-white" style={{ width }} />
          ) : null}
        </View>
      ))}
    </View>
  );
}
