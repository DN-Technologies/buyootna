import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { showAlert } from '@/shared/utils/alert';

import FieldLabel from './FieldLabel';

const inputClassName =
  'h-[46px] w-full rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

interface DiscountSheetProps {
  onApply: (value: number) => void;
}

const DiscountSheet = forwardRef<BottomSheetModal, DiscountSheetProps>(
  ({ onApply }, ref) => {
    const [value, setValue] = useState('');

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

    const handleApply = () => {
      const parsed = parseFloat(value);
      if (isNaN(parsed) || parsed < 0) {
        showAlert('قيمة غير صالحة', 'يرجى إدخال مقدار الخصم بشكل صحيح.', [
          { text: 'حسناً' },
        ]);
        return;
      }
      onApply(parsed);
      setValue('');
      // @ts-ignore
      ref.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing={true}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <SafeBottomSheetView>
          <View className="bg-white px-4 pb-8 pt-1">
            <View className="flex-row items-center justify-between pb-4">
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore
                  ref.current?.dismiss();
                }}
                className="p-2"
              >
                <Ionicons name="close" size={20} color="#111111" />
              </TouchableOpacity>
              <Text
                className="font-cairo-semibold text-[18px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                اضافة خصم
              </Text>
            </View>

            <View className="gap-4">
              <View className="gap-1.5">
                <FieldLabel text="اكتب مقدار الخصم" />
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  placeholder="بالدينار الكويتي"
                  placeholderTextColor="#979797"
                  keyboardType="decimal-pad"
                  className={inputClassName}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleApply}
                className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
              >
                <Text className="font-cairo-semibold text-[14px] text-white">
                  اضافة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

DiscountSheet.displayName = 'DiscountSheet';

export default DiscountSheet;
