import { Text, View } from 'react-native';

import { InvoicesEmptyIcon } from '@/assets/icons/more';

import type { InvoicesMode } from '../types';

interface ServiceInvoicesEmptyProps {
  mode: InvoicesMode;
  // A search with no matches, as opposed to no invoices at all
  isSearching: boolean;
}

export default function ServiceInvoicesEmpty({
  mode,
  isSearching,
}: ServiceInvoicesEmptyProps) {
  const title = isSearching
    ? 'لا توجد نتائج مطابقة'
    : 'لا توجد فواتير للخدمات حتى الآن';
  const body = isSearching
    ? 'جرّب البحث باسم آخر أو رقم فاتورة مختلف.'
    : mode === 'client'
      ? 'ستظهر فواتير اشتراكاتك ومدفوعاتك هنا عند اصدارها.'
      : 'ستظهر الفواتير التي تصدرها لعملائك هنا.';
  return (
    <View
      testID="service-invoices-empty"
      className="flex-1 items-center justify-center px-8 pb-24"
    >
      <InvoicesEmptyIcon size={64} />
      <Text className="mt-4 text-center font-cairo-bold text-[16px] text-[#111111]">
        {title}
      </Text>
      <Text
        className="mt-1.5 text-center font-cairo text-[13px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        {body}
      </Text>
    </View>
  );
}
