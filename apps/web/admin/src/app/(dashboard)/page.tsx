'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import MetricsGrid, { MetricItem } from '@/components/dashboard/MetricsGrid'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import RevenueChart from '@/components/dashboard/RevenueChart'
import UsersDonutChart from '@/components/dashboard/UsersDonutChart'
import RecentRegistrationsTable from '@/components/dashboard/RecentRegistrationsTable'
import RecentActivitiesCard from '@/components/dashboard/RecentActivitiesCard'
import ReportsCard, { ReportCardItem } from '@/components/dashboard/ReportsCard'
import VerificationRequestsCard from '@/components/dashboard/VerificationRequestsCard'
import ReviewVerificationDrawer from '@/components/dashboard/ReviewVerificationDrawer'
import ConfirmVerificationModal from '@/components/dashboard/ConfirmVerificationModal'
import RejectVerificationModal from '@/components/dashboard/RejectVerificationModal'
import RequestEditModal from '@/components/dashboard/RequestEditModal'
import VerificationSuccessToast from '@/components/dashboard/VerificationSuccessToast'
import { useDashboardPage } from './useDashboardPage'
import { getStoredUser } from '@/lib/auth'
import {
  AdminDashboardResponse,
  AdminDashboardPendingVerification,
  updateIdentityStatus,
  requestIdentityEdit,
  formatRelativeArabicTime,
} from '@/lib/admin-dashboard'
import { fetchReports } from '@/lib/admin-reports'
import { MAIN_PRIORITY_LABEL, reportTypeLabel } from '@/lib/report-labels'

function formatChange(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}%`
}

const EMPTY_DASHBOARD: AdminDashboardResponse = {
  metrics: {
    totalUsers: 0,
    totalUsersChangePct: 0,
    trialAccounts: 0,
    trialAccountsChangePct: 0,
    revenueTotal: 0,
    revenueChangePct: 0,
    newReportsCount: 0,
  },
  usersByType: { individual: 0, company: 0, office: 0 },
  revenueByMonth: [],
  recentRegistrations: [],
  pendingVerifications: [],
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboardPage()

  // Real numbers only: zeros until the first account, nothing on an error
  const activeData: AdminDashboardResponse = data ?? EMPTY_DASHBOARD
  const adminName = getStoredUser()?.name

  const [pendingRequests, setPendingRequests] = useState<
    AdminDashboardPendingVerification[]
  >(activeData.pendingVerifications)
  const [selectedRequest, setSelectedRequest] =
    useState<AdminDashboardPendingVerification | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isRequestEditModalOpen, setIsRequestEditModalOpen] = useState(false)
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('تم اعتماد التوثيق بنجاح.')
  const [pendingReports, setPendingReports] = useState<ReportCardItem[]>([])

  useEffect(() => {
    if (activeData.pendingVerifications) {
      setPendingRequests(activeData.pendingVerifications)
    }
  }, [activeData])

  useEffect(() => {
    fetchReports({ status: 'PENDING', limit: 4 })
      .then((res) => {
        setPendingReports(
          res.data.map((row) => ({
            id: row.id,
            title: row.against?.name || reportTypeLabel(row.targetType, row.against?.role ?? null),
            reason: row.reason,
            timeAgo: formatRelativeArabicTime(row.createdAt),
            priority: MAIN_PRIORITY_LABEL[row.priority],
          })),
        )
      })
      .catch((err) => console.error('Failed to load pending reports:', err))
  }, [])

  const metrics: MetricItem[] = [
    {
      id: 'revenue',
      title: 'إجمالي الإيرادات',
      count: `${activeData.metrics.revenueTotal.toLocaleString('en-US')} د.ك`,
      change: formatChange(activeData.metrics.revenueChangePct),
      variant: activeData.metrics.revenueChangePct < 0 ? 'red' : 'green',
    },
    {
      id: 'reports',
      title: 'البلاغات الجديدة',
      count: activeData.metrics.newReportsCount.toLocaleString('en-US'),
      variant: 'red',
    },
    {
      id: 'demo',
      title: 'الحسابات التجريبية',
      count: activeData.metrics.trialAccounts.toLocaleString('en-US'),
      change: formatChange(activeData.metrics.trialAccountsChangePct),
      variant: activeData.metrics.trialAccountsChangePct < 0 ? 'red' : 'green',
    },
    {
      id: 'users',
      title: 'إجمالي المستخدمين',
      count: activeData.metrics.totalUsers.toLocaleString('en-US'),
      change: formatChange(activeData.metrics.totalUsersChangePct),
      variant: activeData.metrics.totalUsersChangePct < 0 ? 'red' : 'green',
    },
  ]

  // Handlers for Drawer & Modal
  const handleReviewRequest = (req: AdminDashboardPendingVerification) => {
    setSelectedRequest(req)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
  }

  const handleApproveClick = (_req: AdminDashboardPendingVerification) => {
    setIsConfirmModalOpen(true)
  }

  const handleRejectClick = (_req: AdminDashboardPendingVerification) => {
    setIsRejectModalOpen(true)
  }

  const handleRequestEditClick = (_req: AdminDashboardPendingVerification) => {
    setIsRequestEditModalOpen(true)
  }

  const handleConfirmBadge = async (options: {
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedRequest) return
    setIsSubmittingDecision(true)
    try {
      await updateIdentityStatus(selectedRequest.identityId, {
        status: 'APPROVED',
        ...options,
      })
      setIsConfirmModalOpen(false)
      setIsDrawerOpen(false)
      setToastMessage('تم اعتماد التوثيق بنجاح.')
      setShowToast(true)
      reload()
    } catch (err) {
      console.error('Failed to approve identity:', err)
      window.alert('تعذر اعتماد التوثيق. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const handleConfirmReject = async (options: {
    reason: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedRequest) return
    setIsSubmittingDecision(true)
    try {
      await updateIdentityStatus(selectedRequest.identityId, {
        status: 'REJECTED',
        ...options,
      })
      const isRevoking = selectedRequest.status === 'موثق'
      setIsRejectModalOpen(false)
      setIsDrawerOpen(false)
      setToastMessage(isRevoking ? 'تم إلغاء التوثيق بنجاح.' : 'تم رفض طلب التوثيق بنجاح.')
      setShowToast(true)
      reload()
    } catch (err) {
      console.error('Failed to reject identity:', err)
      window.alert('تعذر رفض الطلب. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  const handleConfirmRequestEdit = async (options: {
    notes: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedRequest) return
    setIsSubmittingDecision(true)
    try {
      await requestIdentityEdit(selectedRequest.identityId, options)
      setIsRequestEditModalOpen(false)
      setIsDrawerOpen(false)
      setToastMessage('تم إرسال طلب التعديل بنجاح.')
      setShowToast(true)
      reload()
    } catch (err) {
      console.error('Failed to request identity edit:', err)
      window.alert('تعذر إرسال طلب التعديل. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsSubmittingDecision(false)
    }
  }

  // "Undo" is intentionally local-only: by the time this toast shows, the
  // approve/reject/request-edit call above has already persisted and a
  // notification may already have been sent, so a true backend reversal
  // would need its own "never mind" notification. This just restores the
  // item to the on-screen list for this session -- it will NOT reappear as
  // pending after a page refresh, since the backend decision already stuck.

  return (
    <div className="space-y-8 text-right select-none relative" dir="rtl">
      {/* Toast Notification matching Figma node 2734:152341 */}
      <VerificationSuccessToast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
        autoHideDuration={6000}
      />

      <PageHeader
        breadcrumbs={['الرئيسية']}
        title={adminName ? `مرحبا ${adminName} !` : 'مرحبا !'}
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        showExport={false}
      />

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg font-['Cairo'] text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => reload()}
            className="px-3 py-1 bg-primary text-white text-xs rounded hover:bg-primary/90 font-semibold cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Metrics Row matching Figma */}
      <MetricsGrid metrics={metrics} />

      {!loading && data && data.metrics.totalUsers === 0 && (
        <DashboardEmptyState />
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={activeData.revenueByMonth} />
        <UsersDonutChart
          individual={activeData.usersByType.individual}
          company={activeData.usersByType.company}
          office={activeData.usersByType.office}
        />
      </div>

      {/* Data Cards Row 1: Reports + Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <ReportsCard reports={pendingReports} />
        <RecentRegistrationsTable
          registrations={activeData.recentRegistrations}
        />
      </div>

      {/* Data Cards Row 2: Verification Requests + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <VerificationRequestsCard
          requests={pendingRequests}
          onReview={handleReviewRequest}
        />
        <RecentActivitiesCard />
      </div>

      {/* Slide-over Verification Drawer matching Figma node 2732:151741 & 2772:54236 */}
      <ReviewVerificationDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        request={selectedRequest}
        onApprove={handleApproveClick}
        onRequestEdit={handleRequestEditClick}
        onReject={handleRejectClick}
        onRevoke={handleRejectClick}
      />

      {/* Approval Confirmation Modal matching Figma node 2734:152314 */}
      <ConfirmVerificationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmBadge}
        isLoading={isSubmittingDecision}
      />

      {/* Reject / Revoke Confirmation Modal matching Figma node 2734:152236 & 2772:54805 */}
      <RejectVerificationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        isLoading={isSubmittingDecision}
        isRevoke={selectedRequest?.status === 'موثق'}
        targetName={
          selectedRequest
            ? `${selectedRequest.type === 'شركة' ? 'شركة' : 'مكتب'} "${selectedRequest.name}"`
            : undefined
        }
      />

      {/* Request Edit Modal matching Figma node 2804:65078 */}
      <RequestEditModal
        isOpen={isRequestEditModalOpen}
        onClose={() => setIsRequestEditModalOpen(false)}
        onConfirm={handleConfirmRequestEdit}
        isLoading={isSubmittingDecision}
      />
    </div>
  )
}
