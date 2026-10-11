import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';

import { reportsService } from '@/shared/api/reports.service';
import { showAlert } from '@/shared/utils/alert';

export function useOfficeReport(targetUserId?: string) {
  const reportSheetRef = useRef<BottomSheetModal>(null);

  const handleOpenReport = useCallback(() => {
    reportSheetRef.current?.present();
  }, []);

  const handleSubmitReport = useCallback(
    async (reason: string, description?: string) => {
      if (!targetUserId) return;
      try {
        await reportsService.submitReport(targetUserId, reason, description);
        showAlert(
          'تم الإرسال',
          'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.',
        );
      } catch (error: any) {
        const msg = error.response?.data?.message || 'تعذر إرسال البلاغ';
        showAlert('خطأ', msg);
      }
    },
    [targetUserId],
  );

  return {
    reportSheetRef,
    handleOpenReport,
    handleSubmitReport,
  };
}
