import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import CompanySheetHeader from '@/features/company/components/CompanySheetHeader';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { showAlert } from '@/shared/utils/alert';

import FieldLabel from './FieldLabel';

const inputClassName =
  'h-[46px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

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
          backgroundColor: '#000000',
          width: 45,
          height: 5,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <SafeBottomSheetView>
          <View className="gap-4 bg-white pb-6 pt-1">
            <CompanySheetHeader
              title="اضافة خصم"
              onClose={() => {
                // @ts-ignore
                ref.current?.dismiss();
              }}
            />

            <View className="gap-4 px-4 pt-2">
              <View className="gap-1.5">
                <FieldLabel text="اكتب مقدار الخصم" />
                <TextInput
                  value={value}
                  onChangeText={setValue}
                  testID="invoice-discount-input"
                  placeholder="بالدينار الكويتي"
                  placeholderTextColor="#979797"
                  keyboardType="decimal-pad"
                  className={inputClassName}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                testID="invoice-discount-submit"
                onPress={handleApply}
                className="mt-2 h-12 w-full items-center justify-center rounded-[24px] border border-[#15304D] bg-[#15304D]"
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-white"
                  style={{ letterSpacing: 0.28 }}
                >
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
