import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export interface InvoiceItem {
  name: string;
  price: number;
  qty: number;
}

interface InvoiceItemsStepProps {
  items: InvoiceItem[];
  onRemoveItem: (index: number) => void;
  onOpenAddItemSheet: () => void;
  onOpenDiscountSheet: () => void;
  subtotal: number;
  appliedDiscount: number;
  total: number;
}

export default function InvoiceItemsStep({
  items,
  onRemoveItem,
  onOpenAddItemSheet,
  onOpenDiscountSheet,
  subtotal,
  appliedDiscount,
  total,
}: InvoiceItemsStepProps) {
  return (
    <>
      <View className="gap-3">
        <Text
          className="font-cairo-semibold text-[16px] text-black"
          style={{ writingDirection: 'rtl' }}
        >
          بنود الفاتورة
        </Text>

        {/* Table header */}
        <View className="h-[38px] flex-row items-center rounded-md bg-[#F9FAFE] px-4">
          <Text className="w-[100px] text-right font-cairo text-[12px] text-[#6B6A6A]">
            البند
          </Text>
          <Text className="flex-1 text-center font-cairo text-[12px] text-[#6B6A6A]">
            السعر
          </Text>
          <Text className="flex-1 text-center font-cairo text-[12px] text-[#6B6A6A]">
            الكمية
          </Text>
          <Text className="flex-1 text-center font-cairo text-[12px] text-[#6B6A6A]">
            الاجمالي
          </Text>
          <Text className="w-[34px] text-center font-cairo text-[12px] text-[#6B6A6A]">
            اجراء
          </Text>
        </View>

        {/* Item rows */}
        {items.map((item, index) => (
          <View
            key={`${item.name}-${index}`}
            className="h-[42px] flex-row items-center border-b border-[#F0F0F0] px-4"
          >
            <Text
              className="w-[100px] text-right font-cairo text-[13px] text-[#111111]"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text className="flex-1 text-center font-cairo text-[13px] text-[#111111]">
              {item.price.toLocaleString('en-US')}
            </Text>
            <Text className="flex-1 text-center font-cairo text-[13px] text-[#111111]">
              {item.qty}
            </Text>
            <Text className="flex-1 text-center font-cairo text-[13px] text-[#111111]">
              {(item.price * item.qty).toLocaleString('en-US')}
            </Text>
            <TouchableOpacity
              onPress={() => onRemoveItem(index)}
              className="w-[34px] items-center"
            >
              <Ionicons name="trash-outline" size={18} color="#C0392B" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenAddItemSheet}
          className="h-11 w-full flex-row items-center justify-center gap-2 rounded-full border border-[#E2E8F0] bg-white"
        >
          <Ionicons name="add" size={16} color="#111111" />
          <Text className="font-cairo-semibold text-[14px] text-[#111111]">
            اضافة بند
          </Text>
        </TouchableOpacity>
      </View>

      <View className="gap-3">
        <Text
          className="font-cairo-semibold text-[16px] text-black"
          style={{ writingDirection: 'rtl' }}
        >
          اجمالي الفاتورة
        </Text>
        <View className="overflow-hidden rounded-md border border-[#ECECEC]">
          <View className="flex-row items-center justify-between border-b border-[#ECECEC] bg-white px-3 py-3">
            <Text className="font-cairo-medium text-[14px] text-[#111111]">
              {subtotal.toLocaleString('en-US')} د.ك
            </Text>
            <Text
              className="font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الاجمالي
            </Text>
          </View>
          <TouchableOpacity
            onPress={onOpenDiscountSheet}
            className="flex-row items-center justify-between border-b border-[#ECECEC] bg-white px-3 py-3"
          >
            <View className="flex-row items-center gap-2">
              <Text className="font-cairo-medium text-[14px] text-[#111111]">
                {appliedDiscount.toLocaleString('en-US')}
              </Text>
              <Ionicons name="pencil" size={16} color="#15304D" />
            </View>
            <Text
              className="font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              خصم (اختياري)
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center justify-between bg-[#F9FAFE] px-3 py-3">
            <Text className="font-cairo-medium text-[14px] text-[#111111]">
              {total.toLocaleString('en-US')} د.ك
            </Text>
            <Text
              className="font-cairo text-[13px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              الاجمالي النهائي
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
