'use client'

import {
  AdminDashboardPendingVerification,
  formatRelativeArabicTime,
} from '@/lib/admin-dashboard'
import {
  LicenseFilePreview,
  ReviewDrawerActions,
  ReviewDrawerHeader,
  ReviewInfoField,
  verificationStatusStyle,
} from './review-verification'

export interface ReviewVerificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  request: AdminDashboardPendingVerification | null
  onApprove: (request: AdminDashboardPendingVerification) => void
  onRequestEdit?: (request: AdminDashboardPendingVerification) => void
  onReject?: (request: AdminDashboardPendingVerification) => void
  onRevoke?: (request: AdminDashboardPendingVerification) => void
}

/** مراجعة طلب التوثيق: a company's/office's licence and the decision (Figma 2772:54184). */
export default function ReviewVerificationDrawer({
  isOpen,
  onClose,
  request,
  onApprove,
  onRequestEdit,
  onReject,
  onRevoke,
}: ReviewVerificationDrawerProps) {
  if (!isOpen || !request) return null

  const status = verificationStatusStyle(request.status)
  const sentLabel = formatRelativeArabicTime(request.sentAt || request.createdAt)
  const withRequest =
    (handler?: (request: AdminDashboardPendingVerification) => void) =>
      handler ? () => handler(request) : undefined

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" dir="rtl">
      {/* Backdrop matching Figma 2769:53170 */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-125 max-w-[100vw] bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 border-l border-[#ECECEC]">
          <div className="flex flex-col flex-1 overflow-y-auto">
            <ReviewDrawerHeader
              name={request.name}
              sentLabel={sentLabel}
              status={status}
              onClose={onClose}
            />

            <div className="px-5 py-6 flex flex-col gap-6">
              <ReviewInfoField label="رقم الرخصة" value={request.licenseNumber} />
              <ReviewInfoField label="نشاط الرخصة" value={request.licenseActivity} />
              <ReviewInfoField
                label="تاريخ انتهاء الرخصة"
                value={request.licenseExpiry}
              />
              <LicenseFilePreview url={request.licenseFileUrl} />
            </div>
          </div>

          <ReviewDrawerActions
            verified={status.label === 'موثق'}
            onApprove={() => onApprove(request)}
            onRequestEdit={withRequest(onRequestEdit)}
            onReject={withRequest(onReject)}
            onRevoke={withRequest(onRevoke)}
          />
        </div>
      </div>
    </div>
  )
}
