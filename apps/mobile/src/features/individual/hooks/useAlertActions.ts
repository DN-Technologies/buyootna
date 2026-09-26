import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useMemo, useRef, useState } from 'react';

import { AlertItem, alertsService } from '@/shared/api/alerts.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

interface UseAlertActionsParams {
  alerts: AlertItem[] | undefined;
  refetchAlerts: () => unknown;
  triggerToast: (message: string, subtitle?: string | null) => unknown;
}

// State, sheet ref and handlers for the "تنبيهاتي" tab: per-alert and
// pause-all toggles (persisted on the server), delete confirmation, and details sheet.
export function useAlertActions({
  alerts,
  refetchAlerts,
  triggerToast,
}: UseAlertActionsParams) {
  const alertDeleteSheetRef = useRef<BottomSheetModal>(null);
  const deleteAllAlertsSheetRef = useRef<BottomSheetModal>(null);
  const alertDetailsSheetRef = useRef<BottomSheetModal>(null);

  const [selectedAlertForDetails, setSelectedAlertForDetails] =
    useState<AlertItem | null>(null);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);

  // Undo delete toast state
  const [isDeleteToastVisible, setIsDeleteToastVisible] = useState(false);
  const [pendingDeleteAlert, setPendingDeleteAlert] = useState<AlertItem | null>(
    null,
  );
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Optimistic isActive values shown until the refetched list catches up
  const [activeOverrides, setActiveOverrides] = useState<
    Record<string, boolean>
  >({});

  const isAlertActive = (alertId: string) => {
    if (alertId in activeOverrides) return activeOverrides[alertId];
    return alerts?.find((a) => a.id === alertId)?.isActive ?? true;
  };

  const displayedAlerts = useMemo(() => {
    if (!alerts) return [];
    if (!pendingDeleteAlert) return alerts;
    return alerts.filter((a) => a.id !== pendingDeleteAlert.id);
  }, [alerts, pendingDeleteAlert]);

  const allAlertsPaused = Boolean(
    displayedAlerts.length > 0 && displayedAlerts.every((a) => !isAlertActive(a.id)),
  );

  const clearOverrides = (ids: string[]) =>
    setActiveOverrides((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });

  // Show the new state immediately, persist it, then resync from the server.
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
    if (!displayedAlerts || displayedAlerts.length === 0) return;
    const nextActive = allAlertsPaused;
    return persistActive(
      displayedAlerts.map((a) => a.id),
      nextActive,
      () => alertsService.setAllActive(nextActive),
    );
  };

  // Open & Close Details Bottom Sheet
  const handleOpenAlertDetails = (alert: AlertItem) => {
    setSelectedAlertForDetails(alert);
    alertDetailsSheetRef.current?.present();
  };

  const handleCloseAlertDetails = () => {
    alertDetailsSheetRef.current?.dismiss();
    setSelectedAlertForDetails(null);
  };

  // Actual backend delete execution
  const commitDeleteAlert = async (alertId: string) => {
    try {
      await alertsService.remove(alertId);
      refetchAlerts();
    } catch (err) {
      showAlert('خطأ', getApiErrorMessage(err, 'فشل في حذف التنبيه'));
    }
  };

  // Delete with Undo Toast flow (matching node 1864:120272)
  const handleDeleteWithUndo = (alert: AlertItem) => {
    if (pendingDeleteAlert && deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      commitDeleteAlert(pendingDeleteAlert.id);
    }

    setPendingDeleteAlert(alert);
    setIsDeleteToastVisible(true);

    deleteTimerRef.current = setTimeout(() => {
      commitDeleteAlert(alert.id);
      setPendingDeleteAlert(null);
      setIsDeleteToastVisible(false);
      deleteTimerRef.current = null;
    }, 4000);
  };

  const handleUndoDeleteAlert = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    setPendingDeleteAlert(null);
    setIsDeleteToastVisible(false);
  };

  const handleDismissDeleteToast = () => {
    if (pendingDeleteAlert) {
      if (deleteTimerRef.current) {
        clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = null;
      }
      commitDeleteAlert(pendingDeleteAlert.id);
      setPendingDeleteAlert(null);
    }
    setIsDeleteToastVisible(false);
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlertToDelete(alertId);
    alertDeleteSheetRef.current?.present();
  };

  const handleConfirmDeleteAlert = async () => {
    if (!alertToDelete) return;
    const target = alerts?.find((a) => a.id === alertToDelete);
    setAlertToDelete(null);
    if (target) {
      handleDeleteWithUndo(target);
    } else {
      await commitDeleteAlert(alertToDelete);
    }
  };

  const handleCancelDeleteAlert = () => {
    setAlertToDelete(null);
  };

  const handleDeleteFromDetails = (alert: AlertItem) => {
    handleCloseAlertDetails();
    handleDeleteWithUndo(alert);
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
    if (!displayedAlerts || displayedAlerts.length === 0) return;
    try {
      await Promise.all(displayedAlerts.map((a) => alertsService.remove(a.id)));
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
    alertDetailsSheetRef,
    selectedAlertForDetails,
    isOptionsMenuVisible,
    allAlertsPaused,
    displayedAlerts,
    isAlertActive,
    handleOpenAlertDetails,
    handleCloseAlertDetails,
    handleDeleteFromDetails,
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
    // Undo delete toast
    isDeleteToastVisible,
    handleUndoDeleteAlert,
    handleDismissDeleteToast,
  };
}
