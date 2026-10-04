import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { formatNumber } from '@/shared/utils/formatNumber';

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

        {/* Table header (Figma 4410:167393) */}
        <View className="flex-row items-center rounded-[8px] bg-[#F9FAFE] px-4 py-3.5">
          <Text className="w-[100px] text-right font-cairo text-[14px] text-[#979797]">
            البند
          </Text>
          <Text className="flex-1 text-center font-cairo text-[14px] text-[#979797]">
            السعر
          </Text>
          <Text className="flex-1 text-center font-cairo text-[14px] text-[#979797]">
            الكمية
          </Text>
          <Text className="flex-1 text-center font-cairo text-[14px] text-[#979797]">
            الاجمالي
          </Text>
          <Text className="w-[34px] text-center font-cairo text-[14px] text-[#979797]">
            اجراء
          </Text>
        </View>

        {/* Item rows: individually bordered cards */}
        <View className="gap-2">
          {items.map((item, index) => (
            <View
              key={`${item.name}-${index}`}
              className="flex-row items-center rounded-[8px] border border-[#ECECEC] bg-white px-4 py-2.5"
            >
              <Text
                className="w-[100px] text-right font-cairo text-[13px] text-[#111111]"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="flex-1 text-center font-cairo text-[13px] text-[#111111]">
                {formatNumber(item.price)}
              </Text>
              <Text className="flex-1 text-center font-cairo text-[13px] text-[#111111]">
                {item.qty}
              </Text>
              <Text className="flex-1 text-center font-cairo text-[13px] text-[#111111]">
                {formatNumber(item.price * item.qty)}
              </Text>
              <TouchableOpacity
                onPress={() => onRemoveItem(index)}
                className="w-[34px] items-center"
              >
                <Ionicons name="trash-outline" size={18} color="#C0392B" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenAddItemSheet}
          className="h-11 w-full flex-row items-center justify-center gap-1 rounded-full border border-[#15304D] bg-white"
        >
          <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
            اضافة بند
          </Text>
          <Ionicons name="add" size={16} color="#15304D" />
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
              {formatNumber(subtotal)} د.ك
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
                {formatNumber(appliedDiscount)}
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
              {formatNumber(total)} د.ك
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
