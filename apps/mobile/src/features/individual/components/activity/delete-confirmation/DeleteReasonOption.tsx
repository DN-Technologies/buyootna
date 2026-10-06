import { Text, TouchableOpacity, View } from 'react-native';

interface DeleteReasonOptionProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Radio row in the delete-reason step
export default function DeleteReasonOption({
  label,
  selected,
  onPress,
}: DeleteReasonOptionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="w-full flex-row items-center justify-start gap-3 py-2.5"
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${
          selected ? 'border-[#15304D]' : 'border-[#CBD5E1]'
        }`}
      >
        {selected && <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />}
      </View>
      <Text className="font-cairo text-[14px] text-[#111111]">{label}</Text>
    </TouchableOpacity>
  );
}
