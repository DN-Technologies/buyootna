import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';
import QuoteRequestModal from '@/shared/components/company/QuoteRequestModal';
import AddReviewSheet from '@/shared/components/profile/AddReviewSheet';
import { SortBottomSheet } from '@/shared/components/profile/ProfileFilterSheet';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';

interface CompanyModalsProps {
  addReviewSheetRef: React.RefObject<BottomSheetModal | null>;
  sortSheetRef: React.RefObject<BottomSheetModal | null>;
  quoteModalRef: React.RefObject<BottomSheetModal | null>;
  reportSheetRef: React.RefObject<BottomSheetModal | null>;
  companyName: string;
  companySubtitle?: string;
  companyLogoUrl?: string;
  services?: CompanyServiceItemData[];
  targetIdentityId?: string;
  reviewSort: string;
  onSelectSort: (value: string) => void;
  onAddReview: (comment: string, rating: number) => Promise<void>;
  onSubmitReport: (reason: string, description?: string) => Promise<void>;
  onRequestSubmitted?: () => void;
}

export default function CompanyModals({
  addReviewSheetRef,
  sortSheetRef,
  quoteModalRef,
  reportSheetRef,
  companyName,
  companySubtitle,
  companyLogoUrl,
  services,
  targetIdentityId,
  reviewSort,
  onSelectSort,
  onAddReview,
  onSubmitReport,
  onRequestSubmitted,
}: CompanyModalsProps) {
  return (
    <>
      <AddReviewSheet ref={addReviewSheetRef} onSubmit={onAddReview} />
      <SortBottomSheet
        ref={sortSheetRef}
        selectedValue={reviewSort}
        onSelect={onSelectSort}
      />
      <QuoteRequestModal
        ref={quoteModalRef}
        companyName={companyName}
        companySubtitle={companySubtitle}
        companyLogoUrl={companyLogoUrl}
        services={services}
        targetIdentityId={targetIdentityId}
        onRequestSubmitted={onRequestSubmitted ?? (() => {})}
      />
      <ReportReasonSheet ref={reportSheetRef} onSubmit={onSubmitReport} />
    </>
  );
}
