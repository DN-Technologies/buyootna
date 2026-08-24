import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DeleteConfirmationSheetProps {
  onConfirm: (reason?: string) => void;
  onCancel?: () => void;
}

const TrashIcon = ({
  color = '#9C1E28',
  size = 28,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 7L18.1327 19.1422C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1422L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRightIcon = ({
  color = '#111111',
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5L16 12L9 19"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeleteConfirmationSheet = forwardRef<
  BottomSheetModal,
  DeleteConfirmationSheetProps
>(({ onConfirm, onCancel }, ref) => {
  // Flow step state: 'confirm' (Step 1) or 'reason' (Step 2)
  const [step, setStep] = useState<'confirm' | 'reason'>('confirm');

  // Selected delete reason state
  const [selectedReason, setSelectedReason] = useState<'SOLD' | 'OTHER' | null>(
    null,
  );
  const [customReason, setCustomReason] = useState('');

  // snapPoints: 48% provides enough room for the custom text inputs in Step 2
  const snapPoints = useMemo(() => ['48%'], []);

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

  // Reset states when sheet is dismissed/closed
  const handleDismiss = () => {
    setStep('confirm');
    setSelectedReason(null);
    setCustomReason('');
  };

  const handleConfirm = () => {
    // @ts-ignore
    ref.current?.dismiss();
    const finalReason = selectedReason === 'SOLD' ? 'SOLD' : customReason;
    onConfirm(finalReason);
  };

  const handleCancel = () => {
    // @ts-ignore
    ref.current?.dismiss();
    if (onCancel) onCancel();
  };

  // Determine if the submit button is active in Step 2
  const isSubmitActive =
    selectedReason === 'SOLD' ||
    (selectedReason === 'OTHER' && customReason.trim().length > 0);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView className="flex-1 items-center justify-between px-6 pb-8 pt-4">
        {step === 'confirm' ? (
          // ==========================================
          // STEP 1: INITIAL DELETE CONFIRMATION
          // ==========================================
          <View className="w-full flex-1 items-center justify-between">
            {/* Circular Trash Icon Wrapper */}
            <View className="mt-2 h-20 w-20 items-center justify-center rounded-full bg-[#FDF2F2]">
              <TrashIcon size={32} />
            </View>

            {/* Warning Texts */}
            <View className="mt-3 items-center">
              <Text className="text-center font-cairo-bold text-[18px] text-[#111111]">
                هل أنت متأكد من حذف الإعلان؟
              </Text>
              <Text
                className="mt-2.5 px-4 text-center font-cairo text-[13px] leading-5 text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                سيتم حذف الإعلان ولن يظهر للمستخدمين بعد الآن، وسيتم فقدان مدة
                التميز المتبقية
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="mt-6 w-full gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setStep('reason')}
                className="h-[48px] w-full items-center justify-center rounded-full bg-[#9C1E28]"
              >
                <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
                  حذف الإعلان
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCancel}
                className="h-[48px] w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
              >
                <Text className="font-cairo-semibold text-sm leading-[22px] text-[#111111]">
                  تراجع
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // ==========================================
          // STEP 2: DELETE REASON SELECTION
          // ==========================================
          <View className="w-full flex-1 justify-between">
            {/* Header row with back navigation */}
            <View className="w-full flex-row items-center justify-between border-b border-gray-100 pb-3">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setStep('confirm')}
                className="p-1"
              >
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
              {/* Option 1: Sold */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedReason('SOLD')}
                className="w-full flex-row items-center justify-start gap-3 py-2.5"
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border ${
                    selectedReason === 'SOLD'
                      ? 'border-[#15304D]'
                      : 'border-[#CBD5E1]'
                  }`}
                >
                  {selectedReason === 'SOLD' && (
                    <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                  )}
                </View>
                <Text className="font-cairo text-[14px] text-[#111111]">
                  تم البيع
                </Text>
              </TouchableOpacity>

              {/* Option 2: Other Reason */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedReason('OTHER')}
                className="w-full flex-row items-center justify-start gap-3 py-2.5"
              >
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border ${
                    selectedReason === 'OTHER'
                      ? 'border-[#15304D]'
                      : 'border-[#CBD5E1]'
                  }`}
                >
                  {selectedReason === 'OTHER' && (
                    <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                  )}
                </View>
                <Text className="font-cairo text-[14px] text-[#111111]">
                  سبب اخر
                </Text>
              </TouchableOpacity>

              {/* Multi-line Custom Input */}
              {selectedReason === 'OTHER' && (
                <BottomSheetTextInput
                  multiline
                  value={customReason}
                  onChangeText={setCustomReason}
                  placeholder="اذكر سبب حذفك للاعلان"
                  placeholderTextColor="#9CA3AF"
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
              onPress={handleConfirm}
              className={`mt-6 h-[48px] w-full items-center justify-center rounded-full ${
                isSubmitActive ? 'bg-[#9C1E28]' : 'bg-[#CBD5E1]'
              }`}
            >
              <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
                حذف الإعلان
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

DeleteConfirmationSheet.displayName = 'DeleteConfirmationSheet';

export default DeleteConfirmationSheet;
