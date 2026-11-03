import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { officeService } from '@/shared/api/office.service';
import { useMyActivity } from '@/shared/hooks/properties/useMyActivity';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { splitByTab } from './officeProperties';
import {
  type BulkAction,
  officePropertiesService,
} from './officeProperties.service';

/**
 * The office's own ads (all statuses, one request) split into its three tabs,
 * and the dashboard the stat tiles read (shared with the office home).
 */
export function useOfficeProperties() {
  const identityId = useAuthStore((s) => s.activeIdentity?.id);
  const token = useAuthStore((s) => s.token);
  const activity = useMyActivity();
  const dashboard = useQuery({
    queryKey: ['officeHome', 'dashboard', identityId],
    queryFn: officeService.getDashboard,
    enabled: !!token && !!identityId,
  });

  const tabs = useMemo(() => splitByTab(activity.data), [activity.data]);

  return {
    ...tabs,
    isLoading: activity.isLoading,
    error: activity.error,
    refetch: () => Promise.all([activity.refetch(), dashboard.refetch()]),
    dashboard: dashboard.data,
    freeAdsRemaining: activity.freeAdsRemaining,
  };
}

/** Hide, show or delete many ads, then refresh what shows them. */
export function useOfficeBulkActions() {
  const queryClient = useQueryClient();
  const [isWorking, setIsWorking] = useState(false);

  const refresh = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myActivity'] }),
        queryClient.invalidateQueries({ queryKey: ['officeHome'] }),
      ]),
    [queryClient],
  );

  const run = useCallback(
    async (action: BulkAction, ids: string[]) => {
      if (ids.length === 0) return false;
      setIsWorking(true);
      try {
        await officePropertiesService.bulk(action, ids);
        await refresh();
        return true;
      } catch (error) {
        showAlert('خطأ', getApiErrorMessage(error, 'تعذر تنفيذ العملية'));
        return false;
      } finally {
        setIsWorking(false);
      }
    },
    [refresh],
  );

  const markDone = useCallback(
    async (propertyId: string) => {
      try {
        await officePropertiesService.markDone(propertyId);
        await refresh();
        return true;
      } catch (error) {
        showAlert('خطأ', getApiErrorMessage(error, 'تعذر نقل الإعلان'));
        return false;
      }
    },
    [refresh],
  );

  return { run, markDone, isWorking };
}
