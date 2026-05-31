import { Text, View } from 'react-native';

import FilterPill from './FilterPill';

export interface PillOption {
  id: string;
  label: string;
}

export interface PillGroupProps {
  title: string;
  options: PillOption[];
  multiSelect?: boolean;

  // Dynamic typing: If multiSelect is true, value is an array of strings. Otherwise, it's a single string.
  value: string | string[];
  onChange: (value: any) => void;
}

export default function PillGroup({
  title,
  options,
  multiSelect = false,
  value,
  onChange,
}: PillGroupProps) {
  const handlePress = (optionId: string) => {
    if (multiSelect) {
      // MULTI-SELECT LOGIC (e.g., Features)
      const currentValue = (value as string[]) || [];
      if (currentValue.includes(optionId)) {
        // If it's already selected, remove it
        onChange(currentValue.filter((id) => id !== optionId));
      } else {
        // If it's not selected, ad it
        onChange([...currentValue, optionId]);
      }
    } else {
      // SINGLE-SELECT LOGIC (e.g., Property Category)
      // If clicking the already active pill, we want to unselect it (optional).
      // Here we just toggle it off if clicked agai, or set it to the new id.
      onChange(value === optionId ? '' : optionId);
    }
  };

  return (
    <View className="mb-6 w-full">
      {/* Group Title */}
      <Text
        className="mb-3 font-cairo-medium text-sm leading-[22px] text-[#111111]"
        style={{
          writingDirection: 'rtl',
        }}
      >
        {title}
      </Text>

      {/* Pills Container - using flex-row-reverse for perfect RTL wrapping */}
      <View className="flex-row flex-wrap">
        {options.map((option) => {
          // Check if this specific pill is active based on multi/single select mode
          const isActive = multiSelect
            ? (value as string[])?.includes(option.id)
            : value === option.id;

          return (
            <FilterPill
              key={option.id}
              label={option.label}
              isActive={isActive}
              onPress={() => handlePress(option.id)}
            />
          );
        })}
      </View>
    </View>
  );
}
