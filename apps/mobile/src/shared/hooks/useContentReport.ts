import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useRef, useState } from 'react';

import { reportsService } from '@/shared/api/reports.service';
import { showAlert } from '@/shared/utils/alert';

export type ReportableContent = { kind: 'property' | 'review'; id: string };

/**
 * Reporting a listing or a review (App Store Guideline 1.2): opens the
 * reason sheet for one item, then files the report. Same messages as the
 * account reports (useCompanyReport).
 */
export function useContentReport() {
  const reportSheetRef = useRef<BottomSheetModal>(null);
  const [target, setTarget] = useState<ReportableContent | null>(null);

  const openReport = useCallback((content: ReportableContent) => {
    setTarget(content);
    reportSheetRef.current?.present();
  }, []);

  const submitReport = useCallback(
    async (reason: string, description?: string) => {
      if (!target) return;
      try {
        if (target.kind === 'property') {
          await reportsService.reportProperty(target.id, reason, description);
        } else {
          await reportsService.reportReview(target.id, reason, description);
        }
        showAlert(
          'تم الإرسال',
          'تم إرسال البلاغ بنجاح وسيقوم فريق الدعم بمراجعته خلال 24 ساعة.',
        );
      } catch (error: any) {
        const msg = error?.response?.data?.message || 'تعذر إرسال البلاغ';
        showAlert('خطأ', msg);
      }
    },
    [target],
  );

  return { reportSheetRef, openReport, submitReport };
}
