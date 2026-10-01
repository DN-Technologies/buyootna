import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ServiceInvoice } from '@/shared/api/serviceInvoices.service';
import ConnectionErrorModal from '@/shared/components/feedback/ConnectionErrorModal';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';

import DeleteInvoiceSheet from './components/DeleteInvoiceSheet';
import InvoiceDetailsSheet from './components/InvoiceDetailsSheet';
import ServiceInvoiceCard from './components/ServiceInvoiceCard';
import ServiceInvoicesEmpty from './components/ServiceInvoicesEmpty';
import ServiceInvoicesHeader from './components/ServiceInvoicesHeader';
import ServiceInvoicesSearchBar from './components/ServiceInvoicesSearchBar';
import SortSheet from './components/SortSheet';
import { useServiceInvoices } from './hooks/useServiceInvoices';
import type { InvoicesMode } from './types';

/**
 * فواتير الخدمات. The client (individual) sees invoices companies addressed
 * to them and can remove one from their record; the company sees what it
 * issued, marks invoices paid and starts a new one.
 */
export default function ServiceInvoicesScreen({ mode }: { mode: InvoicesMode }) {
  const router = useRouter();
  const list = useServiceInvoices(mode);

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [selected, setSelected] = useState<ServiceInvoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // The error modal can be dismissed without forcing a retry
  const [errorDismissed, setErrorDismissed] = useState(false);
  useEffect(() => {
    if (list.isError) setErrorDismissed(false);
  }, [list.isError]);

  const openDetails = (invoice: ServiceInvoice) => {
    setSelected(invoice);
    detailsSheetRef.current?.present();
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setIsDeleting(true);
    const ok = await list.remove(selected);
    setIsDeleting(false);
    if (ok) {
      deleteSheetRef.current?.dismiss();
      detailsSheetRef.current?.dismiss();
      setSelected(null);
    }
  };

  const markPaid = async (invoice: ServiceInvoice) => {
    setIsMarkingPaid(true);
    const paid = await list.markPaid(invoice);
    setIsMarkingPaid(false);
    if (paid) setSelected(paid);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ServiceInvoicesHeader
        onBack={() => router.back()}
        onExportAll={list.exportAll}
        isExporting={list.isExporting}
      />
      <ServiceInvoicesSearchBar
        value={list.search}
        onChange={list.setSearch}
        onOpenSort={() => sortSheetRef.current?.present()}
      />

      {list.isLoading ? (
        <View className="px-5 pt-2">
          {[1, 2, 3].map((key) => (
            <ListRowSkeleton key={key} showIcon={false} />
          ))}
        </View>
      ) : list.invoices.length === 0 ? (
        <ServiceInvoicesEmpty mode={mode} isSearching={list.isSearching} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: mode === 'company' ? 110 : 40,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={list.isRefetching}
              onRefresh={list.refetch}
            />
          }
        >
          {list.invoices.map((invoice) => (
            <ServiceInvoiceCard
              key={invoice.id}
              invoice={invoice}
              mode={mode}
              onPress={() => openDetails(invoice)}
              onDownload={() => list.exportOne(invoice)}
            />
          ))}
        </ScrollView>
      )}

      {mode === 'company' && (
        <View className="absolute bottom-0 left-0 right-0 border-t border-[#F1F1F1] bg-white px-5 pb-8 pt-3">
          <TouchableOpacity
            testID="service-invoices-new"
            activeOpacity={0.8}
            onPress={() => router.push('/create-invoice')}
            className="h-12 items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-semibold text-[14px] text-white">
              + فاتورة جديدة
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <SortSheet ref={sortSheetRef} selected={list.sort} onSelect={list.setSort} />
      <InvoiceDetailsSheet
        ref={detailsSheetRef}
        invoice={selected}
        mode={mode}
        isExporting={list.isExporting}
        onDownload={list.exportOne}
        onShare={list.exportOne}
        onDelete={
          mode === 'client'
            ? () => deleteSheetRef.current?.present()
            : undefined
        }
        onMarkPaid={mode === 'company' ? markPaid : undefined}
        isMarkingPaid={isMarkingPaid}
      />
      {mode === 'client' && (
        <DeleteInvoiceSheet
          ref={deleteSheetRef}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      )}

      <ConnectionErrorModal
        visible={list.isError && !errorDismissed}
        onRetry={() => {
          setErrorDismissed(true);
          void list.refetch();
        }}
        onClose={() => setErrorDismissed(true)}
      />
    </SafeAreaView>
  );
}
