'use client'

import { useEffect, useState } from 'react'
import { EyeOff, RefreshCw, Star } from 'lucide-react'
import AdDetailHeader, { AdDetailTab } from './AdDetailHeader'
import AdDetailInfo from './AdDetailInfo'
import {
  initialMockReports,
  MockReport,
  ReportDetailView,
  ReportsList,
} from './AdReportsTab'
import AssignReportDialog, { MockAdmin } from './AssignReportDialog'
import ReportActionToast, { ToastState } from './ReportActionToast'
import ConfirmActionDialog, {
  ConfirmActionType,
} from './ConfirmActionDialog'
import FeatureAdDialog from './FeatureAdDialog'
import type { AdminUserProperty } from '@/lib/admin-users'
import { getAdCode, getAdLabel } from '@/lib/property-labels'

function notImplemented(action: string) {
  alert(`"${action}" — لم يتم تفعيل هذا الإجراء بعد.`)
}

export default function AdDetailSheet({
  property,
  onClose,
}: {
  property: AdminUserProperty
  onClose: () => void
}) {
  const [activeTab, setActiveTab] = useState<AdDetailTab>('details')
  const [reports, setReports] = useState<MockReport[]>(initialMockReports)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [assigningReport, setAssigningReport] = useState<MockReport | null>(
    null,
  )
  const [toast, setToast] = useState<ToastState | null>(null)
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType | null>(
    null,
  )
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)

  const adLabel = getAdLabel(property)
  const code = getAdCode(property.referenceNumber)
  const isExpiredOrClosed =
    property.status === 'EXPIRED' || property.status === 'CLOSED'

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) || null

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleCloseReport(report: MockReport) {
    const previousStatus = report.status
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: 'مغلقة' } : r)),
    )
    setToast({
      message: 'تم وضع علامة تم الحل (مغلق) للبلاغ بنجاح.',
      onUndo: () =>
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id ? { ...r, status: previousStatus } : r,
          ),
        ),
    })
  }

  function handleConfirmAssign(admin: MockAdmin) {
    setAssigningReport(null)
    setToast({ message: `تم اسناد البلاغ إلى ${admin.name} بنجاح.` })
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {toast && (
          <ReportActionToast toast={toast} onDismiss={() => setToast(null)} />
        )}

        {selectedReport ? (
          <ReportDetailView
            report={selectedReport}
            onBack={() => setSelectedReportId(null)}
            onCloseReport={handleCloseReport}
            onAssignReport={setAssigningReport}
          />
        ) : (
          <>
            <AdDetailHeader
              property={property}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={onClose}
            />

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'details' ? (
                <AdDetailInfo property={property} />
              ) : (
                <ReportsList
                  reports={reports}
                  onSelect={(report) => setSelectedReportId(report.id)}
                  onCloseReport={handleCloseReport}
                  onAssignReport={setAssigningReport}
                />
              )}
            </div>

            <div className="border-t border-[#ECECEC] flex items-center gap-3 px-5 py-4 w-full font-['Cairo']">
              {!property.isFeatured && (
                <button
                  type="button"
                  onClick={() => setShowFeatureDialog(true)}
                  className="flex-1 h-12 flex items-center justify-center gap-1.5 rounded-full bg-linear-to-l from-[#FF8D28] to-[#FACC15] text-[14px] font-semibold text-[#111111] cursor-pointer"
                >
                  تمييز
                  <Star className="w-3.5 h-3.5" />
                </button>
              )}

              {isExpiredOrClosed ? (
                <button
                  type="button"
                  onClick={() => setConfirmAction('republish')}
                  className="flex-1 h-11.5 flex items-center justify-center gap-1.5 rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer"
                >
                  اعادة النشر
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    property.isHidden
                      ? notImplemented('إظهار')
                      : setConfirmAction('hide')
                  }
                  className="flex-1 h-11.5 flex items-center justify-center gap-1.5 rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer"
                >
                  {property.isHidden ? 'إظهار' : 'اخفاء'}
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmAction('delete')}
                className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#9C1E28] text-[#9C1E28] text-[14px] font-semibold cursor-pointer"
              >
                حذف
              </button>
            </div>
          </>
        )}
      </div>

      {assigningReport && (
        <AssignReportDialog
          onClose={() => setAssigningReport(null)}
          onConfirm={handleConfirmAssign}
        />
      )}

      {confirmAction && (
        <ConfirmActionDialog
          type={confirmAction}
          adLabel={adLabel}
          code={code}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            setConfirmAction(null)
            notImplemented(
              confirmAction === 'delete'
                ? 'حذف'
                : confirmAction === 'hide'
                  ? 'اخفاء'
                  : 'اعادة النشر',
            )
          }}
        />
      )}

      {showFeatureDialog && (
        <FeatureAdDialog
          adLabel={adLabel}
          code={code}
          onClose={() => setShowFeatureDialog(false)}
          onConfirm={() => {
            setShowFeatureDialog(false)
            notImplemented('تمييز')
          }}
        />
      )}
    </div>
  )
}
