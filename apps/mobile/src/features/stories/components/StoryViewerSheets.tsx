import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

import { WarningTriangleIcon } from '@/assets/icons/activity';
import ConfirmActionSheet from '@/features/individual/components/activity/offers/ConfirmActionSheet';
import ReportReasonSheet from '@/shared/components/report/ReportReasonSheet';

import StoryViewersSheet from './StoryViewersSheet';

interface StoryViewerSheetsProps {
  isMine: boolean;
  viewersSheet: RefObject<BottomSheetModal | null>;
  deleteSheet: RefObject<BottomSheetModal | null>;
  reportSheet: RefObject<BottomSheetModal | null>;
  // The story whose viewer list is open (it loads only then)
  viewersFor: string | null;
  onViewersClosed: () => void;
  onDelete: () => void;
  onReport: (reason: string, description?: string) => void;
  // Any sheet closed without acting: the story resumes
  onDismiss: () => void;
}

/**
 * The viewer's sheets: the author's own stories get the viewer list and
 * delete; everyone else's get report.
 */
export default function StoryViewerSheets({
  isMine,
  viewersSheet,
  deleteSheet,
  reportSheet,
  viewersFor,
  onViewersClosed,
  onDelete,
  onReport,
  onDismiss,
}: StoryViewerSheetsProps) {
  if (!isMine) {
    return <ReportReasonSheet ref={reportSheet} onSubmit={onReport} onClose={onDismiss} />;
  }
  return (
    <>
      <StoryViewersSheet ref={viewersSheet} storyId={viewersFor} onClose={onViewersClosed} />
      <ConfirmActionSheet
        ref={deleteSheet}
        variant="danger"
        icon={<WarningTriangleIcon color="#15304D" />}
        iconBackground="#F9FAFE"
        title="حذف القصة؟"
        description="ستختفي القصة من حسابك ومن قصص المتابعين فوراً."
        confirmLabel="حذف"
        onConfirm={onDelete}
        onCancel={onDismiss}
      />
    </>
  );
}
