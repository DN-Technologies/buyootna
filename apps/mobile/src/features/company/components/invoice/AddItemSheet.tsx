import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { MinusIcon, PlusIcon } from '@/assets/icons/company-add';
import CompanySheetHeader from '@/features/company/components/CompanySheetHeader';
import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { showAlert } from '@/shared/utils/alert';
import { formatNumber } from '@/shared/utils/formatNumber';

import FieldLabel from './FieldLabel';
import type { InvoiceItem } from './InvoiceItemsStep';

const inputClassName =
  'h-[46px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

interface AddItemSheetProps {
  /** Called with a validated item when the user presses اضافة. */
  onAdd: (item: InvoiceItem) => void;
}

const AddItemSheet = forwardRef<BottomSheetModal, AddItemSheetProps>(
  ({ onAdd }, ref) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState(1);
    const total = useMemo(() => {
      const parsed = parseFloat(price) || 0;
      return parsed * qty;
    }, [price, qty]);

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

    const resetForm = () => {
      setName('');
      setPrice('');
      setQty(1);
    };

    const handleAdd = () => {
      const parsedPrice = parseFloat(price);
      if (!name.trim() || !parsedPrice || parsedPrice <= 0) {
        showAlert('بيانات ناقصة', 'يرجى إدخال اسم البند والسعر بشكل صحيح.', [
          { text: 'حسناً' },
        ]);
        return;
      }
      onAdd({ name: name.trim(), price: parsedPrice, qty });
      resetForm();
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
              title="اضافة بند"
              onClose={() => {
                // @ts-ignore
                ref.current?.dismiss();
              }}
            />

            <View className="gap-4 px-4 pt-2">
              <View className="gap-1.5">
                <FieldLabel text="اسم البند" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  testID="invoice-item-name"
                  placeholder="اكتب اسم الخدمة او الخامة"
                  placeholderTextColor="#979797"
                  className={inputClassName}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>

              <View className="gap-1.5">
                <FieldLabel text="السعر" />
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  testID="invoice-item-price"
                  placeholder="اكتب السعر بالدينار الكويتي"
                  placeholderTextColor="#979797"
                  keyboardType="decimal-pad"
                  className={inputClassName}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>

              <View className="gap-1.5">
                <FieldLabel text="الكمية" required={false} />
                {/* More on the right, less on the left */}
                <View className="h-[46px] w-full flex-row items-center justify-between rounded-[6px] border border-[#ECECEC] bg-white px-3">
                  <TouchableOpacity
                    testID="invoice-item-qty-plus"
                    accessibilityLabel="زيادة الكمية"
                    onPress={() => setQty((q) => q + 1)}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <PlusIcon color="#979797" />
                  </TouchableOpacity>
                  <Text
                    testID="invoice-item-qty"
                    className="font-cairo text-[14px] leading-[21px] text-[#111111]"
                  >
                    {qty}
                  </Text>
                  <TouchableOpacity
                    testID="invoice-item-qty-minus"
                    accessibilityLabel="تقليل الكمية"
                    onPress={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <MinusIcon />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="gap-1.5">
                <FieldLabel text="الاجمالي" />
                <View className={`${inputClassName} justify-center`}>
                  <Text
                    testID="invoice-item-total"
                    className={`font-cairo text-[14px] ${total > 0 ? 'text-[#111111]' : 'text-[#979797]'}`}
                    style={{ writingDirection: 'rtl' }}
                  >
                    {total > 0
                      ? `${formatNumber(total)} د.ك`
                      : 'السعر الاجمالي للبند'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                testID="invoice-item-submit"
                onPress={handleAdd}
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

AddItemSheet.displayName = 'AddItemSheet';

export default AddItemSheet;
