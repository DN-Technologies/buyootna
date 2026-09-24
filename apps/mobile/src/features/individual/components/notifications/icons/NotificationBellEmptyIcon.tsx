import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

export default function NotificationBellEmptyIcon() {
  return (
    <View className="items-center justify-center">
      {/* Bell + Badge container */}
      <View className="relative h-[66px] w-[64px] items-center justify-center">
        <Svg
          width={62}
          height={66}
          viewBox="0 0 62.4913 65.6889"
          fill="none"
        >
          <Path
            d="M0.941479 41.707C0.260988 46.1679 3.30331 49.2641 7.02828 50.8072C21.3091 56.7231 41.1822 56.7231 55.463 50.8072C59.188 49.2641 62.2303 46.1679 61.5498 41.707C61.1316 38.9655 59.0637 36.6827 57.5316 34.4536C55.5249 31.4979 55.3255 28.2741 55.3252 24.8443C55.3252 11.5895 44.5444 0.844442 31.2456 0.844442C17.9469 0.844442 7.16611 11.5895 7.16611 24.8443C7.16582 28.2741 6.96642 31.4979 4.95966 34.4536C3.4276 36.6827 1.35969 38.9655 0.941479 41.707Z"
            stroke="#111111"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M18.4468 55.2445C19.9139 60.7652 25.0884 64.8444 31.2467 64.8444C37.405 64.8444 42.5795 60.7652 44.0467 55.2445"
            stroke="#111111"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        {/* Red 0 Badge */}
        <View className="absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-[#9C1E28]">
          <Text className="font-cairo-semibold text-[12px] leading-none text-white">
            0
          </Text>
        </View>
      </View>

      {/* Shadow underneath */}
      <View className="mt-2 h-[5px] w-[64px]">
        <Svg width={64} height={5} viewBox="0 0 64 5" fill="none">
          <Ellipse cx={32} cy={2.5} rx={32} ry={2.5} fill="#F2F2F2" />
        </Svg>
      </View>
    </View>
  );
}
