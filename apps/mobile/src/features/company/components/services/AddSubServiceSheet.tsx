import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FieldLabel from '@/features/company/components/invoice/FieldLabel';

import SubServicePickerSheet from './SubServicePickerSheet';
import type { AddSubService } from './useAddSubService';

/** اضافة خدمة فرعية (Figma 8455:24674 / 8455:25340). */
export default function AddSubServiceSheet({ add }: { add: AddSubService }) {
  const insets = useSafeAreaInsets();
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

  return (
    <>
      <BottomSheetModal
        ref={add.sheetRef}
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          {/* Title on the right, close on the left */}
          <View className="flex-row items-center justify-between py-[6px] pl-[10px] pr-4">
            <Text className="flex-1 font-cairo-semibold text-[18px] text-[#111111]" style={{ writingDirection: 'rtl' }}>
              اضافة خدمة فرعية
            </Text>
            <TouchableOpacity
              testID="add-sub-service-close"
              accessibilityLabel="إغلاق"
              onPress={() => add.sheetRef.current?.dismiss()}
              className="h-8 w-8 items-center justify-center"
            >
              <Image
                source={require('@/assets/icons/services/close.svg')}
                style={{ width: 20, height: 20 }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>

          <View className="gap-4 px-4 pt-4">
            <View className="gap-1.5">
              <FieldLabel text="نوع الخدمة" />
              <TouchableOpacity
                testID="add-sub-service-types"
                activeOpacity={0.7}
                onPress={() => add.pickerRef.current?.present()}
                className="h-[46px] w-full flex-row items-center justify-between gap-2 rounded-[6px] border border-[#ECECEC] bg-white px-3"
              >
                <Text
                  numberOfLines={1}
                  className={`flex-1 font-cairo text-[14px] ${
                    add.typesLabel ? 'text-[#111111]' : 'text-[#979797]'
                  }`}
                  style={{ writingDirection: 'rtl' }}
                >
                  {add.typesLabel || 'اختر نوع الخدمة'}
                </Text>
                <Image
                  source={require('@/assets/icons/services/dropdown.svg')}
                  style={{ width: 18, height: 18 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>

            {add.hasOther && (
              <View className="gap-1.5">
                <FieldLabel text="عنوان الخدمة" required={false} />
                <BottomSheetTextInput
                  testID="add-sub-service-title"
                  value={add.serviceTitle}
                  onChangeText={add.setServiceTitle}
                  maxLength={100}
                  placeholder="اكتب نبذة عن الخدمة لاظهارها للعملاء..."
                  placeholderTextColor="#979797"
                  className="h-[56px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                />
              </View>
            )}
          </View>

          <View className="px-4 pb-2 pt-8">
            <TouchableOpacity
              testID="add-sub-service-submit"
              activeOpacity={0.8}
              disabled={!add.isValid || add.isSubmitting}
              onPress={() => void add.submit()}
              className={`h-12 items-center justify-center rounded-[24px] ${
                add.isValid ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
              }`}
            >
              {add.isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-cairo-semibold text-[14px] text-white">
                  اضافة
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      <SubServicePickerSheet
        ref={add.pickerRef}
        options={add.typeOptions}
        selected={add.selectedTypes}
        disabled={add.disabledTypes}
        onToggle={add.toggleType}
      />
    </>
  );
}
