import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { RefObject } from 'react';
import { TouchableOpacity, View } from 'react-native';

import AvatarPill from './AvatarPill';
import HomeModeSwitch, { type HomeMode } from './HomeModeSwitch';

interface HomeTopBarProps {
  mode: HomeMode;
  onModeChange: (mode: HomeMode) => void;
  authSheetRef: RefObject<BottomSheetModal | null>;
  // A double tap on the photo
  onSwitchProfile: () => void;
}

/**
 * The individual home's top row (Figma 9305:76975): the avatar pill on the
 * right; the map and «الرئيسية» / «القصص» on the left.
 */
export default function HomeTopBar({
  mode,
  onModeChange,
  authSheetRef,
  onSwitchProfile,
}: HomeTopBarProps) {
  const router = useRouter();
  return (
    <View className="h-[46px] flex-row items-center px-[16px]" style={{ gap: 8 }}>
      <View className="flex-1 flex-row">
        <AvatarPill
          authSheetRef={authSheetRef}
          onSwitchProfile={onSwitchProfile}
        />
      </View>
      <TouchableOpacity
        testID="home-map-button"
        accessibilityRole="button"
        accessibilityLabel="الخريطة"
        activeOpacity={0.7}
        onPress={() => router.push('/map')}
        className="h-[40px] w-[46px] items-center justify-center rounded-full"
        style={{ borderWidth: 0.5, borderColor: '#C5A36D' }}
      >
        <Image
          source={require('@/assets/icons/home/topbar/map.svg')}
          style={{ width: 20, height: 20 }}
          contentFit="contain"
        />
      </TouchableOpacity>
      <HomeModeSwitch mode={mode} onChange={onModeChange} />
    </View>
  );
}
