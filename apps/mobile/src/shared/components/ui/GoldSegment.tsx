import { Text, TouchableOpacity } from 'react-native';

import SlidingSegment from './SlidingSegment';

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
          <Text
            numberOfLines={1}
            className={`${
              active ? 'font-cairo-bold' : 'font-cairo'
            } text-[14px] leading-[22px] text-[#111111]`}
          >
            {labels.get(id)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
