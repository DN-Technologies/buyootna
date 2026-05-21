import { Image } from 'expo-image';
import { Text, TouchableOpacity,View } from 'react-native';

interface SelectionCardProps {
  title: string;
  description: string;
  type: 'individual' | 'company';
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
  const descColor = isSelected ? 'text-gray-300' : 'text-gray-medium';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        borderRadius: 8,
      }}
      className={`rounedd-2xl mb-4 flex-row items-center gap-3 border-[1.5px] px-2 py-3 ${containerBg} ${borderColor}`}
    >
      {/* Text Content */}
      <View className="flex-1 items-start">
        <Text
          className={`mb-1 w-full text-right font-cairo-semibold text-lg ${
            isSelected ? 'text-white' : 'text-charcoal'
          }`}
        >
          {title}
        </Text>
        <Text
          className={`w-full text-right font-cairo-medium text-sm leading-5 ${descColor}`}
        >
          {description}
        </Text>
      </View>

      {/* Icon Container */}
      <View
        style={{ width: 40, height: 40 }}
        className="mr-4 items-center justify-center rounded-full bg-[#F5F7F9]"
      >
        {type === 'individual' ? (
          <Image
            source={require('@/assets/icons/individual-icon.svg')}
            style={{
              width: 25,
              height: 25,
            }}
          />
        ) : (
          <Image
            source={require('@/assets/icons/company-icon.svg')}
            style={{
              width: 25,
              height: 25,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
