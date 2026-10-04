import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { showAlert } from '@/shared/utils/alert';
import { formatNumber } from '@/shared/utils/formatNumber';

import FieldLabel from './FieldLabel';
import type { InvoiceItem } from './InvoiceItemsStep';

const inputClassName =
  'h-[46px] w-full rounded-md border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]';

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
          backgroundColor: '#111111',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView>
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
                اضافة بند
              </Text>
            </View>

            <View className="gap-4">
              <View className="gap-1.5">
                <FieldLabel text="اسم البند" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="اكتب اسم الخدمة او البند"
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
                  placeholder="اكتب السعر بالدينار الكويتي"
                  placeholderTextColor="#979797"
                  keyboardType="decimal-pad"
                  className={inputClassName}
                  style={{ writingDirection: 'rtl' }}
                />
              </View>

              <View className="gap-1.5">
                <FieldLabel text="الكمية" required={false} />
                <View className="h-[46px] w-full flex-row items-center justify-between rounded-md border border-[#ECECEC] bg-white px-2">
                  <TouchableOpacity
                    onPress={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
                  >
                    <Ionicons name="remove" size={16} color="#111111" />
                  </TouchableOpacity>
                  <Text className="font-cairo-medium text-[14px] text-[#111111]">
                    {qty}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setQty((q) => q + 1)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]"
                  >
                    <Ionicons name="add" size={16} color="#111111" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="gap-1.5">
                <FieldLabel text="الاجمالي" />
                <View className={`${inputClassName} justify-center`}>
                  <Text
                    className="font-cairo text-[14px] text-[#111111]"
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
                onPress={handleAdd}
                className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
              >
                <Text className="font-cairo-semibold text-[14px] text-white">
                  اضافة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddItemSheet.displayName = 'AddItemSheet';

export default AddItemSheet;
