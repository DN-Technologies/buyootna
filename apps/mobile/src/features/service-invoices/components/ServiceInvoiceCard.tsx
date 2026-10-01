import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import type { ServiceInvoice } from '@/shared/api/serviceInvoices.service';

import { formatMoney, paymentLine } from '../format';
import type { InvoicesMode } from '../types';

interface ServiceInvoiceCardProps {
  invoice: ServiceInvoice;
  mode: InvoicesMode;
  onPress: () => void;
  onDownload: () => void;
}

// Invoice number and service on one side, the amount on the other; then the
// payment line and تحميل
export default function ServiceInvoiceCard({
  invoice,
  mode,
  onPress,
  onDownload,
}: ServiceInvoiceCardProps) {
  // The company also needs to see who it billed
  const subtitle =
    mode === 'company'
      ? `${invoice.title} • ${invoice.clientName}`
      : invoice.title;
  return (
    <TouchableOpacity
      testID={`service-invoice-${invoice.id}`}
      activeOpacity={0.8}
      onPress={onPress}
      className="w-full rounded-md border border-[#ECECEC] bg-white p-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 items-start gap-1">
          <Text className="font-cairo-semibold text-[14px] text-[#111111]">
            {invoice.invoiceNo}
          </Text>
          <Text
            className="font-cairo text-[12px] text-[#6B6A6A]"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
        <Text className="font-cairo-semibold text-[16px] text-[#111111]">
          {formatMoney(invoice.total)}
        </Text>
      </View>

      <View className="my-2.5 h-[1px] bg-[#F1F1F1]" />

      <View className="flex-row items-center justify-between">
        <Text
          className={`font-cairo-medium text-[12px] ${
            invoice.paidAt ? 'text-[#111111]' : 'text-[#B97500]'
          }`}
        >
          {paymentLine(invoice.paidAt)}
        </Text>
        <TouchableOpacity
          testID={`service-invoice-download-${invoice.id}`}
          activeOpacity={0.7}
          onPress={onDownload}
          className="flex-row items-center gap-1"
          hitSlop={8}
        >
          <Text className="font-cairo-semibold text-[13px] text-[#15304D]">
            تحميل
          </Text>
          <Feather name="download" size={14} color="#15304D" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
