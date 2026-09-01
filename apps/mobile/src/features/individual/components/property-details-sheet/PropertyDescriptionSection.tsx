import { Text, View } from 'react-native';

interface PropertyDescriptionSectionProps {
  description?: string;
}

export default function PropertyDescriptionSection({
  description,
}: PropertyDescriptionSectionProps) {
  if (!description) return null;

  return (
    <View className="mb-5 items-start">
      <Text className="mb-1 font-cairo-bold text-base text-[#6B6A6A]">
        الوصف
      </Text>
      <Text
        className="font-cairo text-sm leading-6 text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {description}
      </Text>
    </View>
  );
}
