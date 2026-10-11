import { Text, View } from 'react-native';

export default function AlertChips({ chips }: { chips: string[] }) {
  if (chips.length === 0) return null;

  return (
    <View className="mt-2.5 flex-row flex-wrap gap-1.5">
      {chips.map((chip, idx) => (
        <View key={idx} className="rounded-lg bg-[#F9FAFE] px-2.5 py-1">
          <Text className="font-almarai text-xs text-[#111111]">{chip}</Text>
        </View>
      ))}
    </View>
  );
}
