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
// pause-all toggles (persisted on the server), and delete confirmation.
export function useAlertActions({
  alerts,
  refetchAlerts,
  triggerToast,
}: UseAlertActionsParams) {
  const alertDeleteSheetRef = useRef<BottomSheetModal>(null);
  const deleteAllAlertsSheetRef = useRef<BottomSheetModal>(null);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);

  // Optimistic isActive values shown until the refetched list catches up
  const [activeOverrides, setActiveOverrides] = useState<
    Record<string, boolean>
  >({});

  const isAlertActive = (alertId: string) => {
    if (alertId in activeOverrides) return activeOverrides[alertId];
    return alerts?.find((a) => a.id === alertId)?.isActive ?? true;
  };

  const allAlertsPaused = Boolean(
    alerts && alerts.length > 0 && alerts.every((a) => !isAlertActive(a.id)),
  );

  const clearOverrides = (ids: string[]) =>
    setActiveOverrides((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });

  // Show the new state immediately, persist it, then resync from the server.
  // On failure the override is dropped, so the toggle snaps back.
  const persistActive = async (
    ids: string[],
    isActive: boolean,
    request: () => Promise<unknown>,
  ) => {
    setActiveOverrides((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((id) => [id, isActive])),
    }));
    try {
      await request();
      await refetchAlerts();
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في تحديث حالة التنبيه'));
    } finally {
      clearOverrides(ids);
    }
  };

  const handleToggleAlertActive = (alertId: string) => {
    const nextActive = !isAlertActive(alertId);
    return persistActive([alertId], nextActive, () =>
      alertsService.setActive(alertId, nextActive),
    );
  };

  const handleToggleAllAlerts = () => {
    if (!alerts || alerts.length === 0) return;
    const nextActive = allAlertsPaused;
    return persistActive(
      alerts.map((a) => a.id),
      nextActive,
      () => alertsService.setAllActive(nextActive),
    );
  };

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

  const handleOpenOptionsMenu = () => {
    setIsOptionsMenuVisible(true);
  };

  const handleCloseOptionsMenu = () => {
    setIsOptionsMenuVisible(false);
  };

  const handlePromptDeleteAllAlerts = () => {
    setIsOptionsMenuVisible(false);
    deleteAllAlertsSheetRef.current?.present();
  };

  const handleConfirmDeleteAllAlerts = async () => {
    if (!alerts || alerts.length === 0) return;
    try {
      await Promise.all(alerts.map((a) => alertsService.remove(a.id)));
      triggerToast('تم حذف جميع التنبيهات بنجاح');
      refetchAlerts();
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في حذف التنبيهات'));
    }
  };

  const handleCancelDeleteAllAlerts = () => {
    deleteAllAlertsSheetRef.current?.dismiss();
  };

  return {
    alertDeleteSheetRef,
    deleteAllAlertsSheetRef,
    isOptionsMenuVisible,
    allAlertsPaused,
    isAlertActive,
    handleDeleteAlert,
    handleConfirmDeleteAlert,
    handleCancelDeleteAlert,
    handleToggleAllAlerts,
    handleToggleAlertActive,
    handleOpenOptionsMenu,
    handleCloseOptionsMenu,
    handlePromptDeleteAllAlerts,
    handleConfirmDeleteAllAlerts,
    handleCancelDeleteAllAlerts,
  };
}
