import { Text, View } from 'react-native';

export interface RequestDetailsDescriptionProps {
  description: string;
}

export default function RequestDetailsDescription({
  description,
}: RequestDetailsDescriptionProps) {
  return (
    <View className="mt-4">
      {/* Section Title */}
      <Text
        testID="request-details-description-title"
        className="mb-2 font-cairo-bold text-[14px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        الوصف
      </Text>

      {/* Body Text */}
      <Text
        testID="request-details-description-body"
        className="font-cairo-regular text-[13px] leading-[22px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {description}
      </Text>
    </View>
  );
}
