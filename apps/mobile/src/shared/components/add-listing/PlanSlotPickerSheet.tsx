import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { PublishOption } from '@/shared/api/plans.service';

interface PlanSlotPickerSheetProps {
  options: PublishOption[];
  onSelectSlot: (slotId: string) => void;
  onClose?: () => void;
}

const PlanSlotPickerSheet = forwardRef<
  BottomSheetModal,
  PlanSlotPickerSheetProps
>(({ options, onSelectSlot, onClose }, ref) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    options[0]?.slotId || '',
  );

  const snapPoints = useMemo(() => ['55%'], []);

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

  const handleConfirm = () => {
    if (selectedSlotId) {
      onSelectSlot(selectedSlotId);
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <BottomSheetView className="flex-1 justify-between px-6 pb-8 pt-4">
        <View>
          <Text className="mb-1 text-center font-cairo-bold text-xl text-[#111111]">
            اختر الباقة لنشر الإعلان
          </Text>
          <Text className="mb-5 text-center font-cairo text-sm text-[#6B6A6A]">
            حدد الباقة أو الرصيد الذي تريد استخدامه لنشر هذا العقار
          </Text>

          <View className="gap-3">
            {options.map((opt) => {
              const isSelected = selectedSlotId === opt.slotId;
              return (
                <TouchableOpacity
                  key={opt.slotId}
                  activeOpacity={0.8}
                  onPress={() => setSelectedSlotId(opt.slotId)}
                  className={`flex-row items-center justify-between rounded-xl border p-4 ${
                    isSelected
                      ? 'border-[#15304D] bg-[#F4F7FB]'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: opt.color || '#15304D' }}
                    >
                      <Feather name="layers" size={20} color="#FFFFFF" />
                    </View>
                    <View className="items-start">
                      <Text className="font-cairo-bold text-base text-[#111111]">
                        {opt.title}
                      </Text>
                      <Text className="font-cairo text-xs text-[#6B6A6A]">
                        {opt.subtitle}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-[#15304D] bg-[#15304D]'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleConfirm}
          className="mt-4 h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
        >
          <Text className="font-cairo-bold text-[15px] text-white">
            متابعة النشر
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

PlanSlotPickerSheet.displayName = 'PlanSlotPickerSheet';

export default PlanSlotPickerSheet;
