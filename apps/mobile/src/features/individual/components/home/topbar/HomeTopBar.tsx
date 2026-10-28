import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { type RefObject, useEffect, useState } from 'react';
import { type LayoutChangeEvent, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import AvatarPill, { AVATAR_PILL_OPEN_WIDTH } from '@/shared/components/avatar-pill/AvatarPill';
import { FLOATING } from '@/shared/components/ui/floating';
import { IOS_SPRING } from '@/shared/components/ui/SlidingSegment';

import HomeModeSwitch, { type HomeMode } from './HomeModeSwitch';

const MAP_WIDTH = 46;
const GAP = 8;

interface HomeTopBarProps {
  mode: HomeMode;
  onModeChange: (mode: HomeMode) => void;
  authSheetRef: RefObject<BottomSheetModal | null>;
  // A double tap on the photo
  onSwitchProfile: () => void;
}

/**
 * The individual home's top row (Figma 9305:76975): the avatar pill on the
 * right; the map and «الرئيسية» / «القصص» on the left. On a phone too
 * narrow for the open pill (it would cover the map), the map steps aside
 * while the pill is open, on the same spring, and comes back when it closes.
 */
export default function HomeTopBar({
  mode,
  onModeChange,
  authSheetRef,
  onSwitchProfile,
}: HomeTopBarProps) {
  const router = useRouter();
  const [pillOpen, setPillOpen] = useState(false);
  // The pill's room with the map shown
  const [room, setRoom] = useState(0);
  const hideMap = pillOpen && room > 0 && room < AVATAR_PILL_OPEN_WIDTH;

  const shown = useSharedValue(1);
  useEffect(() => {
    shown.value = withSpring(hideMap ? 0 : 1, IOS_SPRING);
  }, [hideMap, shown]);
  const mapStyle = useAnimatedStyle(() => ({
    width: (MAP_WIDTH + GAP) * shown.value,
    opacity: shown.value,
  }));

  return (
    <View className="h-[46px] flex-row items-center px-[16px]">
      <View
        testID="home-pill-room"
        className="flex-1 flex-row"
        onLayout={(e: LayoutChangeEvent) => {
          // Measured while closed, with the map shown (the map's slot
          // animates while the pill is open)
          if (!pillOpen) setRoom(e.nativeEvent.layout.width);
        }}
      >
        <AvatarPill
          authSheetRef={authSheetRef}
          onSwitchProfile={onSwitchProfile}
          onOpenChange={setPillOpen}
          floating
        />
      </View>
      <Animated.View
        testID="home-map-slot"
        pointerEvents={hideMap ? 'none' : 'auto'}
        className="flex-row items-center"
        style={mapStyle}
      >
        <View style={{ width: GAP }} />
        <TouchableOpacity
          testID="home-map-button"
          accessibilityRole="button"
          accessibilityLabel="الخريطة"
          activeOpacity={0.7}
          onPress={() => router.push('/map')}
          className="h-[40px] items-center justify-center rounded-full"
          style={[
            { width: MAP_WIDTH, borderWidth: 0.5, borderColor: '#C5A36D' },
            FLOATING,
          ]}
        >
          <Image
            source={require('@/assets/icons/home/topbar/map.svg')}
            style={{ width: 20, height: 20 }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </Animated.View>
      <View style={{ width: GAP }} />
      <HomeModeSwitch mode={mode} onChange={onModeChange} />
    </View>
  );
}
