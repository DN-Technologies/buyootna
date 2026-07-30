import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InvoicesEmptyIcon } from '@/assets/icons/more';
import {
  InvoiceResponse,
  invoicesService,
  InvoiceStatus,
} from '@/core/api/invoices.service';
import ConnectionErrorModal from '@/core/components/ConnectionErrorModal';
import { exportInvoicesToPdf } from '@/core/utils/invoiceExportHelper';

const TABS = [
  { key: 'ALL', label: 'الكل' },
  { key: 'PAID', label: 'مدفوعة' },
  { key: 'OVERDUE', label: 'منتهية' },
  { key: 'CANCELLED', label: 'ملغية' },
];

export default function InvoicesScreen() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | InvoiceStatus>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await invoicesService.getInvoices();
      setInvoices(data || []);
      setShowErrorModal(false);
    } catch {
      console.log('API failed to fetch invoices');
      setInvoices([]);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleExport = async () => {
    if (invoices.length === 0) {
      Alert.alert('تنبيه', 'لا توجد فواتير لتصديرها حالياً');
      return;
    }
    try {
      setIsExporting(true);
      const listToExport =
        filteredInvoices.length > 0 ? filteredInvoices : invoices;
      await exportInvoicesToPdf(listToExport);
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء تصدير الفواتير. يرجى المحاولة لاحقاً');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateArabic = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const monthsArabic = [
        'يناير',
        'فبراير',
        'مارس',
        'أبريل',
        'مايو',
        'يونيو',
        'يوليو',
        'أغسطس',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر',
      ];
      return `${date.getDate()} ${monthsArabic[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return '';
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'ALL') return true;
    return inv.status === activeTab;
  });

  const getStatusBadgeStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return {
          bg: 'bg-[#E5FFE8]',
          text: 'text-[#018B1B]',
          label: 'مدفوعة',
        };
      case 'OVERDUE':
        return {
          bg: 'bg-[#EEEEEE]',
          text: 'text-[#6B6A6A]',
          label: 'منتهية',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-[#FFEBEB]',
          text: 'text-[#9C1E28]',
          label: 'ملغية',
        };
      default:
        return {
          bg: 'bg-gray-50 border border-gray-100',
          text: 'text-gray-600',
          label: 'معلقة',
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* --- 1. Header --- */}
      <View className="flex-row items-center justify-between px-5 py-4">
        {/* Back Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-8 items-end"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        {/* Title */}
        <Text className="font-cairo-semibold text-lg leading-[24px] text-[#111111]">
          الفواتير
        </Text>

        {/* Export / Download Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isExporting}
          onPress={handleExport}
          className="w-8 items-start justify-center"
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="#15304D" />
          ) : (
            <Feather name="download" size={20} color="#111111" />
          )}
        </TouchableOpacity>
      </View>

      {/* --- 2. Filter Tabs --- */}
      <View className="border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            flexDirection: 'row',
            minWidth: '100%',
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                activeOpacity={0.7}
                className={`relative px-3 py-2 ${
                  isActive ? 'border-b-2 border-[#15304D]' : ''
                }`}
              >
                <Text
                  className={`font-almarai-bold text-[15px] leading-[22px] ${
                    isActive ? 'text-[#15304D]' : 'text-[#6B6A6A]'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* --- 3. Body Content --- */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#15304D" />
        </View>
      ) : filteredInvoices.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="w-full flex-1 bg-gray-50/30"
          contentContainerStyle={{
            paddingBottom: 40,
            paddingHorizontal: 20,
            paddingTop: 16,
          }}
        >
          <View className="w-full gap-4">
            {filteredInvoices.map((invoice) => {
              const badge = getStatusBadgeStyle(invoice.status);
              return (
                <View
                  key={invoice.id}
                  className="w-full flex-1 rounded-md border border-[#ECECEC] bg-white p-4 shadow-sm shadow-gray-100"
                >
                  {/* Top Block: Title, Status and Price */}
                  <View className="flex-row items-center justify-between">
                    {/* Invoice ID & Package details */}
                    <View className="items-start gap-1">
                      <Text className="font-cairo-semibold text-[14px] text-[#111111]">
                        {invoice.planName} • {invoice.invoiceNo}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        {invoice.planDetails && (
                          <Text className="font-cairo text-[12px] text-[#6B6A6A]">
                            {invoice.planDetails}
                          </Text>
                        )}
                        {/* Status Badge */}
                        <View
                          className={`rounded-full px-3 py-0.5 ${badge.bg}`}
                        >
                          <Text
                            className={`font-cairo-medium text-[11px] leading-[18px] ${badge.text}`}
                          >
                            {badge.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {/* Price Tag (Left in absolute visual but standard for Arabic numbers) */}
                    <Text className="font-cairo-semibold text-[16px] text-[#111111]">
                      {invoice.amount} د.ك
                    </Text>
                  </View>

                  {/* Horizontal Divider */}
                  <View className="my-2 h-[1px] bg-gray-100/80" />

                  {/* Bottom Block: Info note & Action Button */}
                  <View className="flex-row items-center justify-between">
                    {/* Info Statement (Right) */}
                    <Text className="font-cairo-medium text-[12px] text-[#111111]">
                      {invoice.status === 'PAID' &&
                        `تم الدفع في: ${formatDateArabic(invoice.paidAt)}`}
                      {invoice.status === 'OVERDUE' &&
                        `تاريخ الاستحقاق: ${formatDateArabic(invoice.dueDate)}`}
                      {invoice.status === 'CANCELLED' &&
                        invoice.delayDays &&
                        `متأخرة منذ ${invoice.delayDays} أيام!`}
                    </Text>
                    {invoice.status === 'OVERDUE' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          Alert.alert('الدفع', 'سيتم تحويلك إلى صفحة الدفع')
                        }
                      >
                        <Text className="font-cairo-semibold text-[14px] text-[#15304D]">
                          ادفع الان
                        </Text>
                      </TouchableOpacity>
                    )}

                    {invoice.status === 'CANCELLED' && <View />}

                    {/* Action Link (Left) */}
                    {invoice.status === 'PAID' && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          Alert.alert('تحميل', 'سيتم تحميل الفاتورة قريباً')
                        }
                        className="flex-row items-center gap-1.5"
                      >
                        <Feather name="download" size={14} color="#15304D" />
                        <Text className="font-cairo-bold text-[13px] text-[#15304D]">
                          تحميل
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        /* Empty State View */
        <View className="flex-1 items-center justify-center px-6">
          {/* Centered Illustration */}
          <View className="mb-6 items-center justify-center">
            <InvoicesEmptyIcon size={112} />
          </View>

          {/* Texts */}
          <Text className="mb-2 font-cairo-bold text-lg text-[#111111]">
            لا توجد فواتير حتى الآن
          </Text>
          <Text className="text-center font-cairo-medium text-[14px] leading-[22px] text-[#6B6A6A]">
            ستظهر فواتير اشتراكاتك ومدفوعاتك هنا عند إجراء أي عملية شراء.
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/plans')}
            className="h-[44px] w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-semibold text-[14px] leading-[22px] text-white">
              استعرض الباقات
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <ConnectionErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onRetry={fetchInvoices}
        isLoading={isLoading}
      />
    </SafeAreaView>
  );
}
