import { Text, TouchableOpacity, View } from 'react-native';

import { EditIcon, PlusIcon, TrashIcon } from '@/assets/icons/company-add';
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

const HEAD = 'font-cairo text-[14px] leading-[21px] text-[#979797]';
const CELL = 'font-cairo text-[13px] leading-[20px] text-[#111111]';
const SECTION_TITLE = 'font-cairo-semibold text-[16px] leading-[20px] text-black';
// The last column holds the 22px delete button; its header is "اجراء"
const ACTION_COLUMN = 'w-[34px] items-center';

/**
 * Step 2, "بنود الفاتورة" (Figma 4410:167393). Rows are RTL: the item name
 * sits on the right and the delete button on the left.
 */
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
      <View className="gap-[14px]">
        <Text className={SECTION_TITLE} style={{ writingDirection: 'rtl' }}>
          بنود الفاتورة
        </Text>

        <View className="gap-3">
          <View className="gap-2">
            <View className="flex-row items-center gap-2 rounded-[8px] bg-[#F9FAFE] px-4 py-[14px]">
              <Text className={`w-[100px] ${HEAD}`}>البند</Text>
              <Text className={`flex-1 ${HEAD}`}>السعر</Text>
              <Text className={`flex-1 ${HEAD}`}>الكمية</Text>
              <Text className={`flex-1 ${HEAD}`}>الاجمالي</Text>
              <View className={ACTION_COLUMN}>
                <Text className={HEAD}>اجراء</Text>
              </View>
            </View>

            {items.map((item, index) => (
              <View
                key={`${item.name}-${index}`}
                testID={`invoice-item-${index}`}
                className="flex-row items-center gap-2 rounded-[8px] border border-[#ECECEC] bg-white px-4 py-[10px]"
              >
                <Text className={`w-[100px] ${CELL}`} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className={`flex-1 ${CELL}`}>
                  {formatNumber(item.price)}
                </Text>
                <Text className={`flex-1 ${CELL}`}>{item.qty}</Text>
                <Text className={`flex-1 ${CELL}`}>
                  {formatNumber(item.price * item.qty)}
                </Text>
                <View className={ACTION_COLUMN}>
                  <TouchableOpacity
                    testID={`invoice-item-remove-${index}`}
                    accessibilityLabel="حذف البند"
                    onPress={() => onRemoveItem(index)}
                    hitSlop={8}
                    className="h-[22px] w-[22px] items-center justify-center"
                  >
                    <TrashIcon />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            testID="invoice-add-item"
            activeOpacity={0.7}
            onPress={onOpenAddItemSheet}
            className="h-11 w-full flex-row items-center justify-center gap-1 rounded-[24px] border border-[#15304D] bg-white"
          >
            <PlusIcon />
            <Text
              className="font-cairo-semibold text-[14px] leading-[21px] text-[#15304D]"
              style={{ letterSpacing: 0.28 }}
            >
              اضافة بند
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="gap-[14px]">
        <Text className={SECTION_TITLE} style={{ writingDirection: 'rtl' }}>
          اجمالي الفاتورة
        </Text>

        {/* Labels on the right, amounts on the left */}
        <View className="overflow-hidden rounded-[6px] border border-[#ECECEC] bg-white">
          <View className="flex-row items-center gap-2 border-b border-[#ECECEC] px-3 py-[14px]">
            <Text
              className="flex-1 font-cairo text-[14px] leading-[21px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الاجمالي
            </Text>
            <Text
              testID="invoice-subtotal"
              className="font-cairo-semibold text-[16px] leading-[24px] text-[#111111]"
            >
              {formatNumber(subtotal)} د.ك
            </Text>
          </View>

          <View className="flex-row items-center gap-2 px-3 pb-[10px] pt-[14px]">
            <Text
              className="flex-1 font-cairo text-[14px] leading-[21px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              خصم <Text className="text-[12px] text-[#A0A0A0]">(اختياري)</Text>
            </Text>
            <TouchableOpacity
              testID="invoice-discount"
              accessibilityLabel="تعديل الخصم"
              activeOpacity={0.7}
              onPress={onOpenDiscountSheet}
              hitSlop={8}
              className="flex-row items-center gap-2"
            >
              <Text className="font-cairo-semibold text-[16px] leading-[24px] text-[#111111]">
                {formatNumber(appliedDiscount)}
              </Text>
              <View className="h-6 w-6 items-center justify-center">
                <EditIcon />
              </View>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center gap-2 border-t border-[#ECECEC] bg-[#F9FAFE] px-3 py-[14px]">
            <Text
              className="flex-1 font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
              style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
            >
              الاجمالي النهائي
            </Text>
            <Text
              testID="invoice-total"
              className="font-cairo-semibold text-[16px] leading-[24px] text-[#111111]"
            >
              {formatNumber(total)} د.ك
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
