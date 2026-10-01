import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReportReasonSheetProps {
  onSubmit: (reason: string, description?: string) => void;
  onClose?: () => void;
}

const REPORT_REASONS = [
  'احتيال أو نصب',
  'معلومات غير صحيحة',
  'سلوك مسيء أو غير لائق',
  'انتحال شخصية',
  'أخرى',
];

const ReportReasonSheet = forwardRef<BottomSheetModal, ReportReasonSheetProps>(
  ({ onSubmit, onClose }, ref) => {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const snapPoints = useMemo(() => ['70%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    const handleDismiss = () => {
      // @ts-ignore
      ref.current?.dismiss();
      if (onClose) onClose();
    };

    const handleSubmit = () => {
      if (!selectedReason) return;
      onSubmit(selectedReason, description.trim() || undefined);
      setSelectedReason(null);
      setDescription('');
      handleDismiss();
    };

    const isSubmitActive = !!selectedReason;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 44,
          height: 4,
          borderRadius: 2,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // No android_keyboardInputMode="adjustResize": with edge-to-edge the
        // window never resizes, and in that mode the sheet doesn't move either,
        // so the keyboard covered it. The default lets the sheet rise itself.
      >
        <BottomSheetView className="flex-1 px-6 pb-8 pt-2">
          {/* Header Row */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-cairo-bold text-lg text-[#111111]">
              الإبلاغ
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDismiss}
              className="p-1"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          <Text className="mb-2 font-cairo-medium text-sm text-[#6B6A6A]">
            سبب البلاغ
          </Text>

          {/* Reason Chips */}
          <View className="mb-4 flex-row flex-wrap gap-2">
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  activeOpacity={0.7}
                  onPress={() => setSelectedReason(reason)}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected
                      ? 'border-[#15304D] bg-[#15304D]'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                >
                  <Text
                    className={`font-cairo-medium text-sm ${
                      isSelected ? 'text-white' : 'text-[#111111]'
                    }`}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text className="mb-2 font-cairo-medium text-sm text-[#6B6A6A]">
            تفاصيل إضافية (اختياري)
          </Text>

          {/* Description Input Box */}
          <View className="mt-1 min-h-[120px] flex-1 rounded-2xl border border-[#E2E8F0] bg-white p-4">
            <BottomSheetTextInput
              value={description}
              onChangeText={setDescription}
              placeholder="اكتب المزيد عن البلاغ..."
              placeholderTextColor="#A0AEC0"
              multiline
              textAlignVertical="top"
              style={{
                fontFamily: 'Cairo_400Regular',
                fontSize: 14,
                color: '#111111',
                writingDirection: 'rtl',
                textAlign: 'right',
                minHeight: 90,
              }}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            activeOpacity={isSubmitActive ? 0.8 : 1}
            disabled={!isSubmitActive}
            onPress={handleSubmit}
            className={`mt-6 h-12 w-full items-center justify-center rounded-full ${
              isSubmitActive ? 'bg-[#9C1E28]' : 'bg-[#A0AEC0]'
            }`}
          >
            <Text className="font-cairo-bold text-base text-white">
              إرسال البلاغ
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

ReportReasonSheet.displayName = 'ReportReasonSheet';

export default ReportReasonSheet;
