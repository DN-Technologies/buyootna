import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text, TouchableOpacity, View } from 'react-native';

import DeleteReasonOption from './DeleteReasonOption';
import { ChevronRightIcon } from './DeleteSheetIcons';
import type { DeleteReason } from './useDeleteReason';

interface DeleteReasonStepProps {
  selectedReason: DeleteReason | null;
  onSelectReason: (reason: DeleteReason) => void;
  customReason: string;
  onChangeCustomReason: (text: string) => void;
  isSubmitActive: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

// Step 2: delete reason selection
export default function DeleteReasonStep({
  selectedReason,
  onSelectReason,
  customReason,
  onChangeCustomReason,
  isSubmitActive,
  onBack,
  onSubmit,
}: DeleteReasonStepProps) {
  return (
    <View className="w-full flex-1 justify-between">
      {/* Header row with back navigation */}
      <View className="w-full flex-row items-center justify-between border-b border-gray-100 pb-3">
        <TouchableOpacity activeOpacity={0.7} onPress={onBack} className="p-1">
          <ChevronRightIcon size={20} />
        </TouchableOpacity>
        <Text
          className="font-cairo-semibold text-[16px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          ما سبب حذف الاعلان؟
        </Text>
        <View className="w-8" />
      </View>

      {/* Radio Options List */}
      <View className="mt-4 w-full gap-1">
        <DeleteReasonOption
          label="تم البيع"
          selected={selectedReason === 'SOLD'}
          onPress={() => onSelectReason('SOLD')}
        />
        <DeleteReasonOption
          label="سبب اخر"
          selected={selectedReason === 'OTHER'}
          onPress={() => onSelectReason('OTHER')}
        />

        {/* Multi-line Custom Input */}
        {selectedReason === 'OTHER' && (
          <BottomSheetTextInput
            multiline
            value={customReason}
            onChangeText={onChangeCustomReason}
            placeholder="اذكر سبب حذفك للاعلان"
            placeholderTextColor="#9CA3AF"
            // Plain free text: without these the OS autofill offered
            // saved email/password credentials here (QA)
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            textAlign="right"
            className="mt-2 h-24 w-full rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 font-cairo text-[13px] text-[#111111]"
            style={{ textAlignVertical: 'top', writingDirection: 'rtl' }}
          />
        )}
      </View>

      {/* Bottom Delete Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!isSubmitActive}
        onPress={onSubmit}
        className={`mt-6 h-[48px] w-full items-center justify-center rounded-full ${
          isSubmitActive ? 'bg-[#9C1E28]' : 'bg-[#CBD5E1]'
        }`}
      >
        <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
          حذف الإعلان
        </Text>
      </TouchableOpacity>
    </View>
  );
}
