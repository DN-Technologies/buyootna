import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { animateNextLayout } from '@/shared/utils/animation/animateNextLayout';

import { FLOATING } from './floating';
import SlidingSegment, { SEGMENT_MS } from './SlidingSegment';

export interface ModeSwitchOption<T extends string> {
  id: T;
  label: string;
  // Drawn in an 18pt slot
  icon: ReactNode;
}

interface ModeSwitchProps<T extends string> {
  // In reading order: the first one is on the right
  modes: ModeSwitchOption<T>[];
  value: T;
  onChange: (value: T) => void;
  // Each side is `${testID}-${id}`
  testID: string;
  // White with a shadow, over content
  floating?: boolean;
}

/**
 * The home's two-way switch (Figma 9305:76795): the selected side shows its
 * name on cream, the other only its icon. The cream slides over on a spring
 * and the sides trade widths smoothly, iOS-style. «الرئيسية / القصص» on the
 * individual home, «الرئيسية / الاستوديو» on the company and office homes.
 */
export default function ModeSwitch<T extends string>({
  modes,
  value,
  onChange,
  testID,
  floating = false,
}: ModeSwitchProps<T>) {
  const byId = new Map(modes.map((m) => [m.id, m]));
  return (
    <SlidingSegment
      testID={testID}
      options={modes.map((m) => m.id)}
      value={value}
      // The cream sits centred inside the gold border, with an even 4pt gap
      // all round (as «عقارات / مكاتب عقارية»), not over the border
      className="h-[40px] items-center rounded-[20px] bg-white p-[4px]"
      style={[
        { borderWidth: 0.5, borderColor: '#C5A36D', gap: 2 },
        floating && FLOATING,
      ]}
      thumbStyle={{ backgroundColor: '#FBEFCD', borderRadius: 16 }}
      renderOption={(id, active) => {
        const m = byId.get(id)!;
        return (
          <TouchableOpacity
            testID={`${testID.replace(/-switch$/, '')}-${m.id}`}
            accessibilityRole="tab"
            accessibilityLabel={m.label}
            accessibilityState={{ selected: active }}
            activeOpacity={0.7}
            onPress={() => {
              if (active) return;
              // The sides trade widths on a spring as the name moves over
              // in step with the selection's glide
              animateNextLayout(SEGMENT_MS);
              onChange(m.id);
            }}
            className="h-[31px] flex-row items-center justify-center px-[10px]"
            // Right to left inside, as the rest of the app (the segment
            // itself is laid out left to right)
            style={{ gap: 4, direction: 'rtl' }}
          >
            <View className="size-[18px] items-center justify-center">
              {m.icon}
            </View>
            {active && (
              <Text className="font-cairo text-[14px] leading-[26px] text-[#111111]">
                {m.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}
