import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useMemo } from 'react';

import { getAlertDetails } from '@/features/individual/utils/alertDetails';
import { AlertItem } from '@/shared/api/alerts.service';

import AlertDetailsActions from './alert-details/AlertDetailsActions';
import AlertDetailsGrid from './alert-details/AlertDetailsGrid';
import AlertDetailsHeader from './alert-details/AlertDetailsHeader';

export interface AlertDetailsSheetProps {
  alert: AlertItem | null;
  isActive?: boolean;
  onToggleActive?: (id: string, nextActive: boolean) => void;
  onClose?: () => void;
  onDeletePress?: (alert: AlertItem) => void;
  onEditPress?: (alert: AlertItem) => void;
  onViewMatchesPress?: (alert: AlertItem) => void;
}

const AlertDetailsSheet = forwardRef<BottomSheetModal, AlertDetailsSheetProps>(
  function AlertDetailsSheet(
    {
      alert,
      isActive = true,
      onToggleActive,
      onClose,
      onDeletePress,
      onEditPress,
      onViewMatchesPress,
    },
    ref,
  ) {
    const snapPoints = useMemo(() => ['62%'], []);

    if (!alert) return null;

    const { title, rows } = getAlertDetails(alert);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.4}
          />
        )}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
      >
        <BottomSheetView className="flex-1 justify-between px-5 pb-6 pt-2">
          <AlertDetailsHeader
            title={title}
            isActive={isActive}
            onToggle={() => onToggleActive?.(alert.id, !isActive)}
            onClose={onClose}
          />

          <AlertDetailsGrid rows={rows} />

          <AlertDetailsActions
            matchCount={alert.matchCount}
            lastMatchedAt={alert.lastMatchedAt}
            onViewMatchesPress={() => onViewMatchesPress?.(alert)}
            onEditPress={() => onEditPress?.(alert)}
            onDeletePress={() => onDeletePress?.(alert)}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

export default AlertDetailsSheet;
