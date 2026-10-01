import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  type ServiceInvoice,
  serviceInvoicesService,
} from '@/shared/api/serviceInvoices.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';
import {
  exportServiceInvoicePdf,
  exportServiceInvoicesPdf,
} from '@/shared/utils/serviceInvoicePdf';

import type { InvoicesMode,InvoiceSortOption } from '../types';

const SEARCH_DEBOUNCE_MS = 350;

/**
 * The فواتير الخدمات list: search (debounced) and sort go to the API; the
 * client can delete from their own list, the company can mark paid; both
 * export PDFs.
 */
export function useServiceInvoices(mode: InvoicesMode) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [sort, setSort] = useState<InvoiceSortOption>('all');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const queryKey = ['service-invoices', mode, debounced.trim(), sort];
  const query = useQuery({
    queryKey,
    queryFn: () => {
      const params = {
        search: debounced,
        sort: sort === 'all' ? undefined : sort,
      };
      return mode === 'client'
        ? serviceInvoicesService.list(params)
        : serviceInvoicesService.listIssued(params);
    },
  });
  const invoices = query.data ?? [];

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['service-invoices', mode] });

  const remove = async (invoice: ServiceInvoice) => {
    try {
      await serviceInvoicesService.remove(invoice.id);
      // Gone at once; the refetch confirms
      queryClient.setQueryData<ServiceInvoice[]>(queryKey, (list) =>
        (list ?? []).filter((inv) => inv.id !== invoice.id),
      );
      void refresh();
      return true;
    } catch (e) {
      showAlert('خطأ', getApiErrorMessage(e, 'تعذر حذف الفاتورة'));
      return false;
    }
  };

  const markPaid = async (invoice: ServiceInvoice) => {
    try {
      const paid = await serviceInvoicesService.markPaid(invoice.id);
      queryClient.setQueryData<ServiceInvoice[]>(queryKey, (list) =>
        (list ?? []).map((inv) => (inv.id === paid.id ? paid : inv)),
      );
      return paid;
    } catch (e) {
      showAlert('خطأ', getApiErrorMessage(e, 'تعذر تأكيد الدفع'));
      return null;
    }
  };

  const runExport = async (work: () => Promise<boolean>) => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await work();
    } catch {
      showAlert('خطأ', 'حدث خطأ أثناء تصدير الفاتورة. يرجى المحاولة لاحقاً');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOne = (invoice: ServiceInvoice) =>
    runExport(() => exportServiceInvoicePdf(invoice));

  const exportAll = () => {
    if (invoices.length === 0) {
      showAlert('تنبيه', 'لا توجد فواتير لتصديرها حالياً');
      return Promise.resolve();
    }
    return runExport(() => exportServiceInvoicesPdf(invoices));
  };

  return {
    invoices,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    search,
    setSearch,
    // Searching with no results shows "no results", not the empty state
    isSearching: debounced.trim().length > 0,
    sort,
    setSort,
    isExporting,
    remove,
    markPaid,
    exportOne,
    exportAll,
  };
}
