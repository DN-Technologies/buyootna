import type { ReactNode } from 'react';
import { Image, Text, View } from 'react-native';

import { formatNumber } from '@/shared/utils/formatNumber';

import type { InvoiceItem } from './InvoiceItemsStep';

const formatReceiptDate = (date: Date) => {
  const datePart = date.toLocaleDateString('ar-KW-u-nu-latn', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('ar-KW-u-nu-latn', {
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
  // The line under the company name, e.g. "للمقاولات والتشطيبات"
  companySpecialty?: string | null;
  // Optional service warranty (كفالة الخدمة) in months — Figma 4410:167623
  warrantyMonths?: string;
}

const CARD_SHADOW = {
  shadowColor: '#919191',
  shadowOpacity: 0.2,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
} as const;

interface RowProps {
  label: string;
  value: ReactNode;
  // The total row is a little taller with a 14px amount
  emphasised?: boolean;
}

// One receipt line: the label on the right, its value on the left
const Row = ({ label, value, emphasised }: RowProps) => (
  <View
    className={`flex-row items-center gap-2 px-3 ${emphasised ? 'py-[6px]' : 'py-1'}`}
  >
    <Text
      className="flex-1 font-cairo text-[13px] leading-[20px] text-[#6B6A6A]"
      style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
    >
      {label}
    </Text>
    <Text
      className={`shrink font-cairo-semibold leading-[20px] text-[#111111] ${
        emphasised ? 'text-[14px]' : 'text-[12px]'
      }`}
      style={emphasised ? undefined : { letterSpacing: 0.24 }}
    >
      {value}
    </Text>
  </View>
);

const Divider = () => <View className="mx-2 h-px bg-[#ECECEC]" />;

/**
 * Step 3, "مراجعة الفاتورة" (Figma 4410:167552, and 4410:167623 with the
 * warranty line): the invoice as the client will get it.
 */
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
  companySpecialty,
  warrantyMonths,
}: InvoiceReceiptProps) {
  return (
    <View className="pt-4">
      <View
        className="gap-4 rounded-t-[12px] bg-white px-4 pb-4 pt-8"
        style={CARD_SHADOW}
      >
        {/* Company header */}
        <View className="items-center gap-2">
          <View className="h-10 w-10 overflow-hidden rounded-bl-[8px] rounded-tl-[8px] rounded-tr-[8px] bg-[#F5F7F9]">
            {logoUrl ? (
              <Image
                source={{ uri: logoUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : null}
          </View>
          <View className="items-center gap-[2px]">
            <Text
              className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
              style={{ letterSpacing: 0.28 }}
            >
              {companyName ?? 'شركة'}
            </Text>
            {!!companySpecialty && (
              <Text className="font-cairo-medium text-[12px] leading-[15px] text-[#A0A0A0]">
                {companySpecialty}
              </Text>
            )}
          </View>
        </View>

        <Divider />

        <View className="gap-[6px]">
          <Row label="رقم الفاتورة" value={invoiceNo} />
          <Row label="موجهة الى" value={clientName} />
          <Row label="تاريخ الاصدار" value={formatReceiptDate(issueDate)} />
        </View>

        <Divider />

        <View className="gap-[6px]">
          <Row label="الخدمة" value={title} />
          {/* Only when the invoice carries a كفالة الخدمة */}
          {!!warrantyMonths?.trim() && (
            <Row
              label="كفالة الخدمة (ضمان)"
              value={`${warrantyMonths.trim()} شهور`}
            />
          )}
        </View>

        <Divider />

        <View className="gap-[6px]">
          {items.map((item, index) => (
            <Row
              key={`${item.name}-${index}`}
              label={item.name}
              value={`${formatNumber(item.price * item.qty)} د.ك`}
            />
          ))}
          <Row label="الخصم" value={formatNumber(appliedDiscount)} />
        </View>

        <Divider />

        <Row
          emphasised
          label="الاجمالي"
          value={`${formatNumber(total)} د.ك`}
        />
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

      <Text
        className="mt-4 text-center font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
        style={{ letterSpacing: -0.408 }}
      >
        شكرا لتعاملكم معنا
      </Text>
    </View>
  );
}
