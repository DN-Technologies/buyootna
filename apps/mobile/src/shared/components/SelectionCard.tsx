import { Text, TouchableOpacity, View } from 'react-native';

import { SafeImage as Image } from '@/shared/components/SafeImage';

interface SelectionCardProps {
  title: string;
  description: string;
  type: 'individual' | 'office' | 'company';
  isSelected: boolean;
  onPress: () => void;
}

export default function SelectionCard({
  title,
  description,
  type,
  isSelected,
  onPress,
}: SelectionCardProps) {
  // Dynamic styling based on selection state
  const containerBg = isSelected ? 'bg-secondary' : 'bg-white';
  const borderColor = isSelected ? 'border-secondary' : 'border-gray-200';
  const descColor = isSelected ? 'text-gray-300' : 'text-[#6B6A6A]';
  const iconBg = isSelected ? 'bg-white' : 'bg-[#F5F7F9]';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        borderRadius: 12,
      }}
      className={`mb-4 flex-row items-center gap-4 border-[1.5px] p-4 ${containerBg} ${borderColor}`}
    >
      {/* Icon Container - appears on the right in RTL */}
      <View
        style={{ width: 44, height: 44 }}
        className={`items-center justify-center rounded-full ${iconBg}`}
      >
        {type === 'individual' && (
          <Image
            source={require('@/assets/icons/individual-icon.svg')}
            style={{
              width: 25,
              height: 25,
            }}
          />
        )}
        {type === 'office' && (
          <Image
            source={require('@/assets/icons/owner-icon.svg')}
            style={{
              width: 25,
              height: 25,
            }}
          />
        )}
        {type === 'company' && (
          <Image
            source={require('@/assets/icons/company-icon.svg')}
            style={{
              width: 25,
              height: 25,
            }}
          />
        )}
      </View>

      {/* Text Content - appears on the left in RTL, right-aligned text */}
      <View className="flex-1 items-start">
        <Text
          className={`mb-1 w-full font-cairo-semibold text-lg ${
            isSelected ? 'text-white' : 'text-charcoal'
          }`}
          style={{
            writingDirection: 'rtl',
          }}
        >
          {title}
        </Text>
        <Text
          className={`w-full font-cairo-medium text-sm leading-5 ${descColor}`}
          style={{
            writingDirection: 'rtl',
          }}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
