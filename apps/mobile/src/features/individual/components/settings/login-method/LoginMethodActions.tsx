import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface LoginMethodActionsProps {
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

// حفظ / تراجع
export default function LoginMethodActions({
  canSave,
  isSaving,
  onSave,
  onCancel,
}: LoginMethodActionsProps) {
  const disabled = !canSave || isSaving;
  return (
    <View className="gap-2 pt-5">
      <TouchableOpacity
        testID="login-method-save"
        activeOpacity={0.8}
        disabled={disabled}
        onPress={onSave}
        className={`h-[48px] items-center justify-center rounded-[24px] bg-[#15304D] ${
          disabled ? 'opacity-60' : ''
        }`}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text className="font-cairo-semibold text-[14px] text-white">حفظ</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        testID="login-method-cancel"
        activeOpacity={0.8}
        onPress={onCancel}
        className="h-[48px] items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
      >
        <Text className="font-cairo-semibold text-[14px] text-[#111111]">
          تراجع
        </Text>
      </TouchableOpacity>
    </View>
  );
}
