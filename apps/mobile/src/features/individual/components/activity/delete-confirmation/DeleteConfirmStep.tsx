import { Text, TouchableOpacity, View } from 'react-native';

import { TrashIcon } from './DeleteSheetIcons';

interface DeleteConfirmStepProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Step 1: initial delete confirmation
export default function DeleteConfirmStep({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: DeleteConfirmStepProps) {
  return (
    <View className="w-full flex-1 items-center justify-between">
      {/* Circular Trash Icon Wrapper */}
      <View className="mt-2 h-20 w-20 items-center justify-center rounded-full bg-[#FDF2F2]">
        <TrashIcon size={32} />
      </View>

      {/* Warning Texts */}
      <View className="mt-3 items-center">
        <Text className="text-center font-cairo-bold text-[18px] text-[#111111]">
          {title}
        </Text>
        <Text
          className="mt-2.5 px-4 text-center font-cairo text-[13px] leading-5 text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {description}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-6 w-full gap-3">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onConfirm}
          className="h-[48px] w-full items-center justify-center rounded-full bg-[#9C1E28]"
        >
          <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
            {confirmLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onCancel}
          className="h-[48px] w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
        >
          <Text className="font-cairo-semibold text-sm leading-[22px] text-[#111111]">
            تراجع
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
