import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export function ReviewSummarySkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className="mx-5 mt-5 bg-white p-5">
      <View className="flex-row items-center justify-between">
        {/* Right Side: Rating Progress Bars (5 to 1) */}
        <View className="w-[62%]">
          {[5, 4, 3, 2, 1].map((star) => (
            <View key={star} className="mb-1.5 flex-row items-center gap-2">
              <View className="h-3 w-3 rounded bg-slate-200" />
              <View className="h-[8px] flex-1 overflow-hidden rounded-full bg-[#E2E8F0]" />
            </View>
          ))}
        </View>

        {/* Left Side: Score & Star Rating */}
        <View className="items-center pl-2">
          <View className="h-8 w-12 rounded bg-slate-200" />
          <View className="my-1 flex-row items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <View key={s} className="h-3.5 w-3.5 rounded-full bg-slate-200" />
            ))}
          </View>
          <View className="h-3 w-14 rounded bg-slate-100" />
        </View>
      </View>
    </Animated.View>
  );
}

export default function ReviewSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="mb-4 border-b border-gray-100 pb-4"
    >
      {/* Top user row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-[48px] w-[48px] rounded-full border border-gray-100 bg-slate-200" />

          <View>
            {/* Stars on top */}
            <View className="mt-0.5 flex-row items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <View
                  key={star}
                  className="h-3 w-3 rounded-full bg-slate-200"
                />
              ))}
            </View>
            {/* User name below stars */}
            <View className="mt-1 h-4 w-24 rounded bg-slate-200" />
          </View>
        </View>

        {/* Time ago on the right */}
        <View className="h-3 w-14 rounded bg-slate-100" />
      </View>

      {/* Comment text */}
      <View className="mt-3 gap-2">
        <View className="h-3.5 w-full rounded bg-slate-100" />
        <View className="h-3.5 w-[70%] self-end rounded bg-slate-100" />
      </View>
    </Animated.View>
  );
}
