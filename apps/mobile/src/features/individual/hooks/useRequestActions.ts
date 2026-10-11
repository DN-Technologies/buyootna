import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useState } from 'react';

import type { CompanyRequestItem } from '@/features/company/components/requests/types';
import type { OffersSort } from '@/features/individual/components/activity/offers/OffersPickerSheets';
import {
  myRequestPills,
  type MyRequestStatus,
} from '@/features/individual/components/activity/offers/requestStatus';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

interface UseRequestActionsParams {
  requests: CompanyRequestItem[];
  refetchRequests: () => unknown;
  triggerToast: (message: string, subtitle?: string | null) => unknown;
}

/** Newest first is the API's order; "oldest" reverses it by creation date. */
export function sortRequests(
  requests: CompanyRequestItem[],
  sort: OffersSort,
): CompanyRequestItem[] {
  if (sort === 'all') return requests;
  const direction = sort === 'newest' ? -1 : 1;
  return [...requests].sort(
    (a, b) =>
      direction * (Date.parse(a.createdAt) - Date.parse(b.createdAt)),
  );
}

// State and handlers of the عروضي tab: status pills, sort, service filter,
// the ⋮ menu and "delete all offers".
export function useRequestActions({
  requests,
  refetchRequests,
  triggerToast,
}: UseRequestActionsParams) {
  const [status, setStatus] = useState<MyRequestStatus>('pending');
  const [sort, setSort] = useState<OffersSort>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const sortSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const deleteAllSheetRef = useRef<BottomSheetModal>(null);

  const pills = useMemo(() => myRequestPills(requests), [requests]);

  // The filter lists the services the user actually asked for
  const categories = useMemo(
    () =>
      Array.from(
        new Set(requests.map((r) => r.category).filter((c): c is string => !!c)),
      ),
    [requests],
  );

  const visibleRequests = useMemo(
    () =>
      sortRequests(
        requests.filter(
          (r) =>
            r.status === status &&
            (selectedCategories.length === 0 ||
              (!!r.category && selectedCategories.includes(r.category))),
        ),
        sort,
      ),
    [requests, status, selectedCategories, sort],
  );

  const handleConfirmDeleteAll = async () => {
    try {
      await companyRequestsService.removeAllMine();
      triggerToast('تم حذف جميع عروضك بنجاح.');
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في حذف العروض'));
    } finally {
      refetchRequests();
    }
  };

  return {
    status,
    setStatus,
    pills,
    visibleRequests,
    hasRequests: requests.length > 0,
    sort,
    setSort,
    categories,
    selectedCategories,
    setSelectedCategories,
    isFilterActive: selectedCategories.length > 0,
    sortSheetRef,
    filterSheetRef,
    deleteAllSheetRef,
    isMenuVisible,
    openMenu: () => setIsMenuVisible(true),
    closeMenu: () => setIsMenuVisible(false),
    promptDeleteAll: () => {
      setIsMenuVisible(false);
      deleteAllSheetRef.current?.present();
    },
    handleConfirmDeleteAll,
  };
}
