import { Text, TouchableOpacity, View } from 'react-native';

interface FeatureItem {
  id: string;
  label: string;
}

interface PropertyAmenitiesChipsProps {
  activeFeatures: FeatureItem[];
  selectedFeatures: string[];
  onToggleFeature: (label: string) => void;
}

export default function PropertyAmenitiesChips({
  activeFeatures,
  selectedFeatures,
  onToggleFeature,
}: PropertyAmenitiesChipsProps) {
  return (
    <View className="mt-2 mb-2 w-full">
      <Text
        className="mb-3 font-cairo-medium text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        المزايا
      </Text>
      <View className="flex-row flex-wrap justify-start gap-2">
        {activeFeatures.map((feature) => {
          const isSelected = selectedFeatures?.includes(feature.label);
          return (
            <TouchableOpacity
              key={feature.id}
              onPress={() => onToggleFeature(feature.label)}
              activeOpacity={0.7}
              className={`mb-2 rounded-full border px-5 py-1.5 ${
                isSelected
                  ? 'border-[#15304D] bg-[#F4F8FB]'
                  : 'border-transparent bg-[#F5F7F9]'
              }`}
            >
              <Text
                className={`font-cairo text-[13px] ${
                  isSelected
                    ? 'font-cairo-semibold text-[#15304D]'
                    : 'text-[#6B6A6A]'
                }`}
              >
                {feature.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
