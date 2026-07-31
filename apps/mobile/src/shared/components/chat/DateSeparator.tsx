import { Text, View } from 'react-native';

export default function DateSeparator({ dateText }: { dateText: string }) {
  return (
    <View className="my-4 w-full items-center">
      <Text className="font-cairo-medium text-[12px] text-[#94A3B8]">
        {dateText}
      </Text>
    </View>
  );
}
