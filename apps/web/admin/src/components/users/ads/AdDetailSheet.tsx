'use client'

import { useCallback, useEffect, useState } from 'react'
import { EyeOff, RefreshCw, Star } from 'lucide-react'
import AdDetailHeader, { AdDetailTab } from './AdDetailHeader'
import AdDetailInfo from './AdDetailInfo'
import { MockReport, ReportDetailView, ReportsList } from './AdReportsTab'
import AssignReportDialog from './AssignReportDialog'
import ReportActionToast, { ToastState } from './ReportActionToast'
import ConfirmActionDialog, {
  ConfirmActionType,
} from './ConfirmActionDialog'
import FeatureAdDialog, { featuredUntilFromDuration } from './FeatureAdDialog'
import type { AdminUserProperty } from '@/lib/admin-users'
import { getAdCode, getAdLabel } from '@/lib/property-labels'
import {
  AdminModerator,
  AdminReportRow,
  deleteReportedProperty,
  fetchPropertyReports,
  updateReport,
} from '@/lib/admin-reports'
import { updateProperty } from '@/lib/admin-properties'
import { AD_TAB_PRIORITY_LABEL, AD_TAB_STATUS_LABEL } from '@/lib/report-labels'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'

function toMockReport(row: AdminReportRow): MockReport {
  return {
    id: row.id,
    code: row.reportNumber,
    reason: row.reason,
    reporterName: row.submittedBy?.name || 'مستخدم بيوتنا',
    reporterPhone: row.submittedBy?.phone || '',
    reporterEmail: row.submittedBy?.email || '',
    timeAgo: formatRelativeArabicTime(row.createdAt),
    priority: AD_TAB_PRIORITY_LABEL[row.priority],
    status: AD_TAB_STATUS_LABEL[row.status],
    details: row.description || '',
    attachments: [],
  }
}

export default function AdDetailSheet({
  property,
  onClose,
  onRefresh,
}: {
  property: AdminUserProperty
  onClose: () => void
  onRefresh?: () => void
}) {
  const [activeTab, setActiveTab] = useState<AdDetailTab>('details')
  const [reports, setReports] = useState<MockReport[]>([])
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

  const loadReports = useCallback(async () => {
    try {
      const rows = await fetchPropertyReports(property.id)
      setReports(rows.map(toMockReport))
    } catch (err) {
      console.error('Failed to load property reports:', err)
    }
  }, [property.id])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  async function handleCloseReport(report: MockReport) {
    try {
      await updateReport(report.id, { status: 'RESOLVED' })
      setToast({ message: 'تم وضع علامة تم الحل (مغلق) للبلاغ بنجاح.' })
      setSelectedReportId(null)
      await loadReports()
    } catch (err) {
      console.error('Failed to close report:', err)
      setToast({ message: 'حدث خطأ أثناء إغلاق البلاغ.' })
    }
  }

  async function handleDeleteAd() {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الإعلان "${adLabel}"؟`)) return
    try {
      await deleteReportedProperty(property.id, 'تم حذف الإعلان استجابةً لبلاغ')
      setToast({ message: 'تم حذف الإعلان بنجاح.' })
      onRefresh?.()
      onClose()
    } catch (err) {
      console.error('Failed to delete reported property:', err)
      setToast({ message: 'حدث خطأ أثناء حذف الإعلان.' })
    }
  }

  async function handleUnhide() {
    try {
      await updateProperty(property.id, { isHidden: false })
      setToast({ message: 'تم إظهار الإعلان بنجاح.' })
      onRefresh?.()
    } catch (err) {
      console.error('Failed to unhide property:', err)
      setToast({ message: 'حدث خطأ أثناء إظهار الإعلان.' })
    }
  }

  async function handleConfirmAssign(admin: AdminModerator) {
    const report = assigningReport
    if (!report) return
    try {
      await updateReport(report.id, { assignedAdminId: admin.id })
      setAssigningReport(null)
      setToast({ message: `تم اسناد البلاغ إلى ${admin.name} بنجاح.` })
      await loadReports()
    } catch (err) {
      console.error('Failed to assign report:', err)
      setToast({ message: 'حدث خطأ أثناء اسناد البلاغ.' })
    }
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
            onDeleteAd={handleDeleteAd}
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

            <div className="border-t border-[#ECECEC] flex items-center gap-3 px-5 py-4 w-full font-['Cairo']" dir="rtl">
              {activeTab === 'details' && !property.isFeatured && property.status !== 'DELETED' && (
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
              ) : property.status !== 'DELETED' ? (
                <button
                  type="button"
                  onClick={() =>
                    property.isHidden ? handleUnhide() : setConfirmAction('hide')
                  }
                  className="flex-1 h-11.5 flex items-center justify-center gap-1.5 rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer"
                >
                  {property.isHidden ? 'إظهار' : 'اخفاء'}
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              ) : null}

              {property.status !== 'DELETED' && (
                <button
                  type="button"
                  onClick={() => setConfirmAction('delete')}
                  className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#9C1E28] text-[#9C1E28] text-[14px] font-semibold cursor-pointer"
                >
                  حذف
                </button>
              )}
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
          onConfirm={async ({ reason }) => {
            setConfirmAction(null)
            try {
              if (confirmAction === 'delete') {
                await deleteReportedProperty(property.id, reason)
                setToast({ message: 'تم حذف الإعلان بنجاح.' })
                onRefresh?.()
                onClose()
                return
              }
              if (confirmAction === 'hide') {
                await updateProperty(property.id, { isHidden: true })
                setToast({ message: 'تم اخفاء الإعلان بنجاح.' })
              } else {
                await updateProperty(property.id, { status: 'ACTIVE' })
                setToast({ message: 'تم اعادة نشر الإعلان بنجاح.' })
              }
              onRefresh?.()
            } catch (err) {
              console.error(`Failed to ${confirmAction} property:`, err)
              setToast({ message: 'حدث خطأ أثناء تنفيذ الإجراء.' })
            }
          }}
        />
      )}

      {showFeatureDialog && (
        <FeatureAdDialog
          adLabel={adLabel}
          code={code}
          onClose={() => setShowFeatureDialog(false)}
          onConfirm={async ({ duration }) => {
            setShowFeatureDialog(false)
            try {
              await updateProperty(property.id, {
                isFeatured: true,
                featuredUntil: featuredUntilFromDuration(duration),
              })
              setToast({ message: 'تم تمييز الإعلان بنجاح.' })
              onRefresh?.()
            } catch (err) {
              console.error('Failed to feature property:', err)
              setToast({ message: 'حدث خطأ أثناء تمييز الإعلان.' })
            }
          }}
        />
      )}
    </div>
  )
}
