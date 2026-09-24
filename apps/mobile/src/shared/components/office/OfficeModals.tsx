import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';
import QuoteRequestModal from '@/shared/components/company/QuoteRequestModal';
import AddReviewSheet from '@/shared/components/profile/AddReviewSheet';
import {
  FilterBottomSheet,
  SortBottomSheet,
} from '@/shared/components/profile/ProfileFilterSheet';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';

interface OfficeModalsProps {
  addReviewSheetRef: React.RefObject<BottomSheetModal | null>;
  sortSheetRef: React.RefObject<BottomSheetModal | null>;
  filterSheetRef: React.RefObject<BottomSheetModal | null>;
  quoteModalRef: React.RefObject<BottomSheetModal | null>;
  reportSheetRef: React.RefObject<BottomSheetModal | null>;
  companyName: string;
  companySubtitle?: string;
  companyLogoUrl?: string;
  services?: CompanyServiceItemData[];
  targetIdentityId?: string;
  reviewSort: string;
  propertyFilter: string;
  onSelectSort: (value: string) => void;
  onSelectPropertyFilter: (value: string) => void;
  onAddReview: (comment: string, rating: number) => Promise<void>;
  onSubmitReport: (reason: string, description?: string) => Promise<void>;
  onRequestSubmitted?: () => void;
}

export default function OfficeModals({
  addReviewSheetRef,
  sortSheetRef,
  filterSheetRef,
  quoteModalRef,
  reportSheetRef,
  companyName,
  companySubtitle,
  companyLogoUrl,
  services,
  targetIdentityId,
  reviewSort,
  propertyFilter,
  onSelectSort,
  onSelectPropertyFilter,
  onAddReview,
  onSubmitReport,
  onRequestSubmitted,
}: OfficeModalsProps) {
  return (
    <>
      <AddReviewSheet ref={addReviewSheetRef} onSubmit={onAddReview} />
      <SortBottomSheet
        ref={sortSheetRef}
        selectedValue={reviewSort}
        onSelect={onSelectSort}
      />
      <FilterBottomSheet
        ref={filterSheetRef}
        selectedValue={propertyFilter}
        onSelect={onSelectPropertyFilter}
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
