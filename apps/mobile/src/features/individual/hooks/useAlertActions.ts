import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef, useState } from 'react';

import { AlertItem, alertsService } from '@/shared/api/alerts.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

interface UseAlertActionsParams {
  alerts: AlertItem[] | undefined;
  refetchAlerts: () => unknown;
  triggerToast: (message: string, subtitle?: string | null) => unknown;
}

// State, sheet ref and handlers for the "تنبيهاتي" tab: per-alert and
// pause-all toggles, and delete confirmation.
export function useAlertActions({
  alerts,
  refetchAlerts,
  triggerToast,
}: UseAlertActionsParams) {
  const alertDeleteSheetRef = useRef<BottomSheetModal>(null);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [pausedAlertIds, setPausedAlertIds] = useState<string[]>([]);

  const handleDeleteAlert = (alertId: string) => {
    setAlertToDelete(alertId);
    alertDeleteSheetRef.current?.present();
  };

  const handleConfirmDeleteAlert = async () => {
    if (!alertToDelete) return;
    try {
      await alertsService.remove(alertToDelete);
      triggerToast('تم حذف التنبيه بنجاح.');
      refetchAlerts();
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في حذف التنبيه'));
    } finally {
      setAlertToDelete(null);
    }
  };

  const handleCancelDeleteAlert = () => {
    setAlertToDelete(null);
  };

  const allAlertsPaused = Boolean(
    alerts &&
      alerts.length > 0 &&
      alerts.every((a) => pausedAlertIds.includes(a.id)),
  );

  const handleToggleAllAlerts = () => {
    if (!alerts || alerts.length === 0) return;
    if (allAlertsPaused) {
      setPausedAlertIds([]);
    } else {
      setPausedAlertIds(alerts.map((a) => a.id));
    }
  };

  const handleToggleAlertActive = (alertId: string) => {
    setPausedAlertIds((prev) =>
      prev.includes(alertId)
        ? prev.filter((id) => id !== alertId)
        : [...prev, alertId],
    );
  };

  const isAlertActive = (alertId: string) => !pausedAlertIds.includes(alertId);

  return {
    alertDeleteSheetRef,
    allAlertsPaused,
    isAlertActive,
    handleDeleteAlert,
    handleConfirmDeleteAlert,
    handleCancelDeleteAlert,
    handleToggleAllAlerts,
    handleToggleAlertActive,
  };
}
