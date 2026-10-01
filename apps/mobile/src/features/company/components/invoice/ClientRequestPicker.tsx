import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import {
  type InvoiceableClient,
  serviceInvoicesService,
} from '@/shared/api/serviceInvoices.service';

interface ClientRequestPickerProps {
  selectedRequestId: string | null;
  onSelect: (client: InvoiceableClient | null) => void;
}

/**
 * Pick the client from the company's accepted requests: the invoice then
 * reaches that client's فواتير الخدمات. Picking the selected one again
 * clears it (back to typing a name).
 */
export default function ClientRequestPicker({
  selectedRequestId,
  onSelect,
}: ClientRequestPickerProps) {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['invoiceable-clients'],
    queryFn: serviceInvoicesService.invoiceableClients,
  });

  if (isLoading) {
    return <ActivityIndicator className="my-2" color="#15304D" />;
  }
  if (clients.length === 0) {
    return (
      <Text
        className="font-cairo text-[12px] text-[#6B6A6A]"
        style={{ writingDirection: 'rtl' }}
      >
        لا توجد طلبات مقبولة بعد. يمكنك كتابة اسم العميل، ولن تصل الفاتورة
        لحسابه في التطبيق.
      </Text>
    );
  }
  return (
    <View className="gap-2">
      {clients.map((client) => {
        const selected = client.requestId === selectedRequestId;
        return (
          <TouchableOpacity
            key={client.requestId}
            testID={`invoice-client-${client.requestId}`}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onSelect(selected ? null : client)}
            className={`flex-row items-center gap-2.5 rounded-md border px-3 py-2.5 ${
              selected ? 'border-[#15304D] bg-[#F9FAFE]' : 'border-[#ECECEC]'
            }`}
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded-full border ${
                selected ? 'border-[#15304D] bg-[#15304D]' : 'border-[#CBD5E1]'
              }`}
            >
              {selected && <Feather name="check" size={12} color="#FFFFFF" />}
            </View>
            <View className="flex-1 items-start">
              <Text className="font-cairo-semibold text-[13px] text-[#111111]">
                {client.clientName}
              </Text>
              <Text
                className="font-cairo text-[11px] text-[#6B6A6A]"
                numberOfLines={1}
              >
                {client.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
