import { Feather } from '@expo/vector-icons';
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  DEACTIVATE_DURATIONS,
  DEACTIVATE_REASONS,
  type DeactivateDuration,
  OTHER_REASON_ID,
} from './constants';
import DeactivateSheetActions from './DeactivateSheetActions';
import ReasonOption from './ReasonOption';

interface DeactivateReasonsStepProps {
  selectedReasons: string[];
  otherReasonText: string;
  onToggleReason: (id: string) => void;
  onChangeOtherReason: (text: string) => void;
  duration: DeactivateDuration;
  onChangeDuration: (days: DeactivateDuration) => void;
  onBack: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

// Step 2: why (Figma 1684:60321, 1684:60354, 1684:60387)
export default function DeactivateReasonsStep({
  selectedReasons,
  otherReasonText,
  onToggleReason,
  onChangeOtherReason,
  duration,
  onChangeDuration,
  onBack,
  onSubmit,
  onCancel,
}: DeactivateReasonsStepProps) {
  return (
    <View testID="deactivate-step-reasons" className="flex-1 justify-between">
      {/* Header */}
      <View className="mb-4 flex-row items-center justify-between border-b border-[#ECECEC] pb-3">
        <TouchableOpacity
          testID="deactivate-reasons-back"
          onPress={onBack}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Feather name="chevron-right" size={22} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-[18px] text-[#111111]">
          ما سبب تعطيل الحساب؟
        </Text>
        <View className="h-8 w-8" />
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        <View className="gap-2">
          {DEACTIVATE_REASONS.map((reason) => (
            <ReasonOption
              key={reason.id}
              id={reason.id}
              title={reason.title}
              checked={selectedReasons.includes(reason.id)}
              onToggle={onToggleReason}
            />
          ))}

          {/* Free text when "أخرى" is picked (Figma 1684:60387) */}
          {selectedReasons.includes(OTHER_REASON_ID) && (
            <View className="mt-2 rounded-[8px] border border-[#ECECEC] bg-white p-3">
              <BottomSheetTextInput
                testID="deactivate-reason-other-input"
                value={otherReasonText}
                onChangeText={onChangeOtherReason}
                placeholder="اذكر سبب تعطيلك للحساب"
                placeholderTextColor="#979797"
                multiline
                numberOfLines={3}
                style={{
                  textAlign: 'right',
                  fontFamily: 'Cairo-Regular',
                  fontSize: 14,
                  minHeight: 64,
                  color: '#111111',
                }}
              />
            </View>
          )}
        </View>

        {/* How long: the account comes back on its own after a period */}
        <Text className="mb-2 mt-4 font-cairo-semibold text-[14px] text-[#111111]">
          مدة التعطيل
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {DEACTIVATE_DURATIONS.map((option) => {
            const selected = option.days === duration;
            return (
              <TouchableOpacity
                key={option.title}
                testID={`deactivate-duration-${option.days ?? 'open'}`}
                activeOpacity={0.7}
                onPress={() => onChangeDuration(option.days)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`h-[34px] items-center justify-center rounded-[10px] px-3 ${
                  selected
                    ? 'bg-[#15304D]'
                    : 'border border-[#ECECEC] bg-[#F9FAFE]'
                }`}
              >
                <Text
                  className={`font-cairo-medium text-[13px] ${
                    selected ? 'text-white' : 'text-[#111111]'
                  }`}
                >
                  {option.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetScrollView>

      <DeactivateSheetActions
        className="w-full gap-2 pt-2"
        primaryLabel="تعطيل الحساب"
        primaryTestID="deactivate-reasons-submit"
        primaryDisabled={selectedReasons.length === 0}
        onPrimary={onSubmit}
        cancelTestID="deactivate-reasons-cancel"
        onCancel={onCancel}
      />
    </View>
  );
}
