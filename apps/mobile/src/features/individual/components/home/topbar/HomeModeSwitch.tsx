import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import SlidingSegment from '@/shared/components/ui/SlidingSegment';
import { animateNextLayout } from '@/shared/utils/animation/animateNextLayout';

export type HomeMode = 'home' | 'stories';

interface HomeModeSwitchProps {
  mode: HomeMode;
  onChange: (mode: HomeMode) => void;
}

const MODES: {
  id: HomeMode;
  label: string;
  icon: number;
  iconSize: number;
}[] = [
  // In reading order: «الرئيسية» on the right
  {
    id: 'home',
    label: 'الرئيسية',
    icon: require('@/assets/icons/home/topbar/home.svg'),
    iconSize: 14.133,
  },
  {
    id: 'stories',
    label: 'القصص',
    icon: require('@/assets/icons/home/topbar/circle-dashed.svg'),
    iconSize: 18,
  },
];

/**
 * «الرئيسية» / «القصص» (Figma 9305:76795): the selected side shows its name
 * on cream, the other only its icon. The cream slides over on a spring and
 * the sides trade widths smoothly, iOS-style.
 */
export default function HomeModeSwitch({ mode, onChange }: HomeModeSwitchProps) {
  const byId = new Map(MODES.map((m) => [m.id, m]));
  return (
    <SlidingSegment
      testID="home-mode-switch"
      options={MODES.map((m) => m.id)}
      value={mode}
      // The cream sits centred inside the gold border, with an even 4pt gap
      // all round (as «عقارات / مكاتب عقارية»), not over the border
      className="h-[40px] items-center rounded-[20px] bg-white p-[4px]"
      style={{ borderWidth: 0.5, borderColor: '#C5A36D', gap: 2 }}
      thumbStyle={{ backgroundColor: '#FBEFCD', borderRadius: 16 }}
      renderOption={(id, active) => {
        const m = byId.get(id)!;
        return (
          <TouchableOpacity
            testID={`home-mode-${m.id}`}
            accessibilityRole="tab"
            accessibilityLabel={m.label}
            accessibilityState={{ selected: active }}
            activeOpacity={0.7}
            onPress={() => {
              if (active) return;
              // The sides trade widths on a spring as the name moves over
              animateNextLayout();
              onChange(m.id);
            }}
            className="h-[31px] flex-row items-center justify-center px-[10px]"
            // Right to left inside, as the rest of the app (the segment
            // itself is laid out left to right)
            style={{ gap: 4, direction: 'rtl' }}
          >
            {/* The house sits in a 16px slot, the circle fills its 18 */}
            <View
              className="items-center justify-center"
              style={{
                width: m.id === 'home' ? 16 : 18,
                height: m.id === 'home' ? 16 : 18,
              }}
            >
              <Image
                source={m.icon}
                style={{ width: m.iconSize, height: m.iconSize }}
                contentFit="contain"
              />
            </View>
            {active && (
              <Text className="font-cairo text-[14px] leading-[22px] text-[#111111]">
                {m.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}
