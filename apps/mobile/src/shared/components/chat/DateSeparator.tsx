import { Text, View } from 'react-native';

// "أمس" / "اليوم" between the days of a chat (Figma 4410:168547)
export default function DateSeparator({ dateText }: { dateText: string }) {
  return (
    <View className="mb-4 mt-1 w-full items-center">
      <Text className="font-cairo-medium text-[13px] leading-[17px] text-[#6B6A6A]">
        {dateText}
      </Text>
    </View>
  );
}
