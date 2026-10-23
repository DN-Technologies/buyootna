import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';
import { useContentReport } from '@/shared/hooks/useContentReport';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { showAlert } from '@/shared/utils/alert';

/**
 * «إبلاغ» on a review (Guideline 1.2), for the lists that show reviews:
 * `reportReview` opens the reason sheet for one, `reportSheet` is that sheet
 * to render once beside the list (as useImageViewer's viewer).
 */
export function useReviewReport() {
  const isSignedIn = useAuthStore((s) => !!s.token);
  const { reportSheetRef, openReport, submitReport } = useContentReport();

  const reportReview = (reviewId: string) => {
    if (!isSignedIn) {
      showAlert('تسجيل الدخول', 'سجّل الدخول للإبلاغ عن هذا التقييم');
      return;
    }
    openReport({ kind: 'review', id: reviewId });
  };

  const reportSheet = (
    <ReportReasonSheet ref={reportSheetRef} onSubmit={submitReport} />
  );

  return { reportReview, reportSheet };
}
