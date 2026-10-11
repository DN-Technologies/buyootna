import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef } from 'react';

import { reportsService } from '@/shared/api/reports.service';
import { showAlert } from '@/shared/utils/alert';

export function useChatReport(otherUserId?: string) {
  const reportSheetRef = useRef<BottomSheetModal>(null);

  const handleReportUser = useCallback(() => {
    reportSheetRef.current?.present();
  }, []);

  const handleSubmitReport = useCallback(
    async (reason: string, description?: string) => {
      if (!otherUserId) return;
      try {
        await reportsService.submitReport(otherUserId, reason, description);
        showAlert(
          'تم الإرسال',
          'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته.',
        );
      } catch (error: any) {
        const msg = error.response?.data?.message || 'تعذر إرسال البلاغ';
        showAlert('خطأ', msg);
      }
    },
    [otherUserId],
  );

  return {
    reportSheetRef,
    handleReportUser,
    handleSubmitReport,
  };
}
