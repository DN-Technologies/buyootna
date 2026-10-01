import { Text, TouchableOpacity, View } from 'react-native';

export default function EditProfileSubmitBar({
  enabled,
  onSubmit,
}: {
  enabled: boolean;
  onSubmit: () => void;
}) {
  return (
    <View className="border-t border-gray-50 bg-white px-5 py-4">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSubmit}
        disabled={!enabled}
        className={`h-[48px] w-full items-center justify-center rounded-[24px] ${
          enabled ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
        }`}
      >
        <Text className="font-cairo-bold text-[15px] text-white">
          تعديل البيانات
        </Text>
      </TouchableOpacity>
    </View>
  );
}
