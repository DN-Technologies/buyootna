import { Image, Text, View } from 'react-native';

import type { InvoiceItem } from './InvoiceItemsStep';

const formatReceiptDate = (date: Date) => {
  const datePart = date.toLocaleDateString('ar-KW', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('ar-KW', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} • ${timePart}`;
};

interface InvoiceReceiptProps {
  invoiceNo: string;
  clientName: string;
  title: string;
  issueDate: Date;
  items: InvoiceItem[];
  appliedDiscount: number;
  total: number;
  companyName?: string;
  logoUrl?: string | null;
}

export default function InvoiceReceipt({
  invoiceNo,
  clientName,
  title,
  issueDate,
  items,
  appliedDiscount,
  total,
  companyName,
  logoUrl,
}: InvoiceReceiptProps) {
  return (
    <View className="px-4">
      <View
        className="rounded-t-lg bg-white px-4 pb-6 pt-8"
        style={{
          shadowColor: '#919191',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
      >
        {/* Company header */}
        <View className="items-center">
          <View className="h-10 w-10 overflow-hidden rounded-md bg-[#F5F7F9]">
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : null}
          </View>
          <Text className="mt-2 font-cairo-semibold text-[14px] text-[#111111]">
            {companyName ?? 'شركة'}
          </Text>
        </View>

        <View className="my-4 h-px bg-[#ECECEC]" />

        {/* Meta rows */}
        <View className="gap-2.5">
          {[
            { label: 'رقم الفاتورة', value: invoiceNo },
            { label: 'موجهة الى', value: clientName },
            { label: 'تاريخ الاصدار', value: formatReceiptDate(issueDate) },
          ].map((row) => (
            <View
              key={row.label}
              className="flex-row items-center justify-between"
            >
              <Text
                className="font-cairo text-[13px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {row.label}
              </Text>
              <Text className="text-left font-cairo-medium text-[13px] text-[#111111]">
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="my-4 h-px bg-[#ECECEC]" />

        {/* Title row */}
        <View className="flex-row items-center justify-between">
          <Text
            className="font-cairo text-[13px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            الخدمة
          </Text>
          <Text className="text-left font-cairo-medium text-[13px] text-[#111111]">
            {title}
          </Text>
        </View>

        <View className="my-4 h-px bg-[#ECECEC]" />

        {/* Items */}
        <View className="gap-2.5">
          {items.map((item, index) => (
            <View
              key={`${item.name}-${index}`}
              className="flex-row items-center justify-between"
            >
              <Text className="text-left font-cairo text-[13px] text-[#111111]">
                {(item.price * item.qty).toLocaleString('en-US')} د.ك
              </Text>
              <Text
                className="font-cairo text-[13px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {item.name}
              </Text>
            </View>
          ))}
          <View className="flex-row items-center justify-between">
            <Text className="text-left font-cairo text-[13px] text-[#111111]">
              {appliedDiscount.toLocaleString('en-US')}
            </Text>
            <Text
              className="font-cairo text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الخصم
            </Text>
          </View>
        </View>

        <View className="my-4 h-px bg-[#ECECEC]" />

        <View className="flex-row items-center justify-between">
          <Text className="text-left font-cairo-medium text-[14px] text-[#111111]">
            {total.toLocaleString('en-US')} د.ك
          </Text>
          <Text
            className="font-cairo text-[13px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            الاجمالي
          </Text>
        </View>
      </View>

      {/* Scalloped bottom edge */}
      <View className="-mt-2 flex-row justify-between px-1">
        {Array.from({ length: 13 }).map((_, index) => (
          <View
            key={index}
            className="h-4 w-4 rounded-full bg-white"
            style={{
              shadowColor: '#919191',
              shadowOpacity: 0.2,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}
          />
        ))}
      </View>

      <Text className="mt-3 text-center font-cairo-medium text-[13px] text-[#111111]">
        شكرا لتعاملكم معنا
      </Text>
    </View>
  );
}
