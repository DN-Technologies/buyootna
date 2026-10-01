import { Feather } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type { ServiceInvoice } from '@/shared/api/serviceInvoices.service';

import type { InvoicesMode } from '../types';
import InvoiceReceipt from './InvoiceReceipt';
import SheetBackdrop from './SheetBackdrop';

interface InvoiceDetailsSheetProps {
  invoice: ServiceInvoice | null;
  mode: InvoicesMode;
  isExporting: boolean;
  onDownload: (invoice: ServiceInvoice) => void;
  onShare: (invoice: ServiceInvoice) => void;
  // Client only: remove it from their list (asks first)
  onDelete?: (invoice: ServiceInvoice) => void;
  // Company only: record the payment
  onMarkPaid?: (invoice: ServiceInvoice) => void;
  isMarkingPaid?: boolean;
}

function ActionButton({
  testID,
  label,
  icon,
  onPress,
  variant,
  disabled = false,
  loading = false,
}: {
  testID: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  variant: 'primary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) {
  const box = {
    primary: 'bg-[#15304D]',
    outline: 'border border-[#E2E8F0] bg-white',
    danger: 'border border-[#9C1E28] bg-white',
  }[variant];
  const color = { primary: '#FFFFFF', outline: '#111111', danger: '#9C1E28' }[
    variant
  ];
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      className={`h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${box} ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <>
          <Feather name={icon} size={15} color={color} />
          <Text className="font-cairo-semibold text-[13px]" style={{ color }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// تفاصيل الفاتورة: the receipt, then تحميل / مشاركة and حذف (client) or
// تم الدفع (company, until it's paid)
const InvoiceDetailsSheet = forwardRef<BottomSheetModal, InvoiceDetailsSheetProps>(
  (
    {
      invoice,
      mode,
      isExporting,
      onDownload,
      onShare,
      onDelete,
      onMarkPaid,
      isMarkingPaid = false,
    },
    ref,
  ) => {
    const snapPoints = useMemo(() => ['88%'], []);
    const dismiss = useCallback(() => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    }, [ref]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backdropComponent={SheetBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#111111', width: 44 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <View className="flex-row items-center justify-between px-5 pb-3">
          <Text className="font-cairo-semibold text-lg text-[#111111]">
            تفاصيل الفاتورة
          </Text>
          <TouchableOpacity
            testID="invoice-details-close"
            activeOpacity={0.7}
            onPress={dismiss}
            className="p-1"
          >
            <Feather name="x" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {invoice && (
          <>
            <BottomSheetScrollView
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <InvoiceReceipt invoice={invoice} />
            </BottomSheetScrollView>

            <View className="flex-row gap-2 border-t border-[#F1F1F1] px-5 pb-8 pt-3">
              <ActionButton
                testID="invoice-details-download"
                label="تحميل"
                icon="download"
                variant="primary"
                loading={isExporting}
                onPress={() => onDownload(invoice)}
              />
              <ActionButton
                testID="invoice-details-share"
                label="مشاركة"
                icon="share-2"
                variant="outline"
                disabled={isExporting}
                onPress={() => onShare(invoice)}
              />
              {mode === 'client' && onDelete && (
                <ActionButton
                  testID="invoice-details-delete"
                  label="حذف"
                  icon="trash-2"
                  variant="danger"
                  onPress={() => onDelete(invoice)}
                />
              )}
              {mode === 'company' && onMarkPaid && !invoice.paidAt && (
                <ActionButton
                  testID="invoice-details-mark-paid"
                  label="تم الدفع"
                  icon="check-circle"
                  variant="outline"
                  loading={isMarkingPaid}
                  onPress={() => onMarkPaid(invoice)}
                />
              )}
            </View>
          </>
        )}
      </BottomSheetModal>
    );
  },
);

InvoiceDetailsSheet.displayName = 'InvoiceDetailsSheet';

export default InvoiceDetailsSheet;
