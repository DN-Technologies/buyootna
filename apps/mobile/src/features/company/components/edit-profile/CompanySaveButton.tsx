import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface CompanySaveButtonProps {
  isDirty: boolean;
  isSubmitting: boolean;
  onPress: () => void;
}

export default function CompanySaveButton({
  isDirty,
  isSubmitting,
  onPress,
}: CompanySaveButtonProps) {
  const isEnabled = isDirty && !isSubmitting;

  return (
    <View className="bg-white px-4 py-3">
      <TouchableOpacity
        testID="save-button"
        activeOpacity={isEnabled ? 0.7 : 1}
        disabled={!isEnabled}
        onPress={onPress}
        className={`h-[48px] w-full flex-row items-center justify-center rounded-[24px] ${
          isEnabled ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
        }`}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white">
            حفظ التغييرات
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
