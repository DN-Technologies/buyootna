import { Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { ServiceInvoice } from '@/shared/api/serviceInvoices.service';

import {
  formatDayTime,
  formatMoney,
  formatWarranty,
  paymentLine,
} from '../format';

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between py-1.5">
      <Text
        className={`font-cairo text-[12px] ${
          strong ? 'font-cairo-bold text-[#111111]' : 'text-[#6B6A6A]'
        }`}
      >
        {label}
      </Text>
      <Text
        className={`text-[12px] text-[#111111] ${
          strong ? 'font-cairo-bold text-[14px]' : 'font-cairo-medium'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

const Dashed = () => (
  <View className="my-2 border-t border-dashed border-[#D7D7D7]" />
);

// The receipt's torn (zig-zag) bottom edge
function ZigZagEdge() {
  const teeth = 24;
  const w = 100 / teeth;
  let d = 'M0 0';
  for (let i = 0; i < teeth; i++) {
    d += ` L${i * w + w / 2} 6 L${(i + 1) * w} 0`;
  }
  return (
    <Svg width="100%" height={8} viewBox="0 0 100 8" preserveAspectRatio="none">
      <Path d={`${d} Z`} fill="#FFFFFF" stroke="#ECECEC" strokeWidth={0.4} />
    </Svg>
  );
}

/** The invoice as a paper receipt: company header, details, items, total. */
export default function InvoiceReceipt({ invoice }: { invoice: ServiceInvoice }) {
  const warranty = formatWarranty(invoice.warrantyMonths);
  return (
    <View>
      <View className="rounded-t-lg border border-b-0 border-[#ECECEC] bg-white px-4 pb-3 pt-6">
        <View className="items-center">
          <View className="h-11 w-11 overflow-hidden rounded-md bg-[#F5F7F9]">
            {invoice.company.logoUrl ? (
              <Image
                source={{ uri: invoice.company.logoUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : null}
          </View>
          <Text className="mt-2 font-cairo-semibold text-[14px] text-[#111111]">
            {invoice.company.name}
          </Text>
          {!!invoice.company.specialty && (
            <Text className="font-cairo text-[11px] text-[#6B6A6A]">
              {invoice.company.specialty}
            </Text>
          )}
        </View>

        <View className="my-3 h-px bg-[#ECECEC]" />

        <Row label="رقم الفاتورة" value={invoice.invoiceNo} />
        <Row label="تاريخ الاصدار" value={formatDayTime(invoice.issueDate)} />
        <Dashed />
        <Row label="الخدمة" value={invoice.title} />
        {warranty && <Row label="كفالة الخدمة (ضمان)" value={warranty} />}
        <Dashed />
        {invoice.items.map((item, i) => (
          <Row
            key={`${item.name}-${i}`}
            label={item.qty > 1 ? `${item.qty} ${item.name}` : item.name}
            value={formatMoney(item.price * item.qty)}
          />
        ))}
        <Row label="الخصم" value={formatMoney(invoice.discount)} />
        <Dashed />
        <Row label="الاجمالي" value={formatMoney(invoice.total)} strong />
        <Text
          className={`mt-1 text-right font-cairo-medium text-[11px] ${
            invoice.paidAt ? 'text-[#018B1B]' : 'text-[#B97500]'
          }`}
        >
          {paymentLine(invoice.paidAt)}
        </Text>
      </View>
      <ZigZagEdge />
    </View>
  );
}
