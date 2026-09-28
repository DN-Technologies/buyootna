import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface AccountActionsProps {
  onDelete: () => void;
  onDeactivate: () => void;
}

// Delete (red) and temporarily deactivate (amber) the account
export default function AccountActions({
  onDelete,
  onDeactivate,
}: AccountActionsProps) {
  return (
    <View className="mt-4 gap-3">
      <TouchableOpacity
        testID="settings-delete-account"
        onPress={onDelete}
        className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#9C1E28] bg-white leading-[22px]"
      >
        <Feather name="user-x" size={18} color="#9C1E28" />
        <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#9C1E28]">
          حذف الحساب
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="settings-deactivate-account"
        onPress={onDeactivate}
        className="h-[44px] flex-row items-center justify-center gap-2 rounded-full border border-[#B97500] bg-white"
      >
        <Feather name="pause-circle" size={18} color="#B97500" />
        <Text className="font-cairo-semibold text-[14px] leading-[24px] text-[#B97500]">
          تعطيل الحساب مؤقتا
        </Text>
      </TouchableOpacity>
    </View>
  );
}
