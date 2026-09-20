'use client'

import { useState, useEffect } from 'react'
import PageHeader from '@/components/PageHeader'
import MetricsGrid, { MetricItem } from '@/components/dashboard/MetricsGrid'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import RevenueChart from '@/components/dashboard/RevenueChart'
import UsersDonutChart from '@/components/dashboard/UsersDonutChart'
import RecentRegistrationsTable from '@/components/dashboard/RecentRegistrationsTable'
import RecentActivitiesCard from '@/components/dashboard/RecentActivitiesCard'
import ReportsCard from '@/components/dashboard/ReportsCard'
import VerificationRequestsCard from '@/components/dashboard/VerificationRequestsCard'
import ReviewVerificationDrawer from '@/components/dashboard/ReviewVerificationDrawer'
import ConfirmVerificationModal from '@/components/dashboard/ConfirmVerificationModal'
import RejectVerificationModal from '@/components/dashboard/RejectVerificationModal'
import RequestEditModal from '@/components/dashboard/RequestEditModal'
import VerificationSuccessToast from '@/components/dashboard/VerificationSuccessToast'
import { useDashboardPage } from './useDashboardPage'
import {
  AdminDashboardResponse,
  AdminDashboardPendingVerification,
  updateIdentityStatus,
  requestIdentityEdit,
} from '@/lib/admin-dashboard'

function formatChange(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}%`
}

const FIGMA_DEFAULT_DATA: AdminDashboardResponse = {
  metrics: {
    totalUsers: 500,
    totalUsersChangePct: 8.1,
    trialAccounts: 100,
    trialAccountsChangePct: 8.1,
    revenueTotal: 84800,
    revenueChangePct: 8.1,
  },
  usersByType: {
    individual: 200,
    company: 20,
    office: 50,
  },
  revenueByMonth: [
    { month: 'يناير', year: 2026, amount: 45000 },
    { month: 'فبراير', year: 2026, amount: 52000 },
    { month: 'مارس', year: 2026, amount: 48000 },
    { month: 'أبريل', year: 2026, amount: 61000 },
    { month: 'مايو', year: 2026, amount: 55000 },
    { month: 'يونيو', year: 2026, amount: 67000 },
    { month: 'يوليو', year: 2026, amount: 72000 },
    { month: 'أغسطس', year: 2026, amount: 69000 },
    { month: 'سبتمبر', year: 2026, amount: 78000 },
    { month: 'أكتوبر', year: 2026, amount: 74000 },
    { month: 'نوفمبر', year: 2026, amount: 81000 },
    { month: 'ديسمبر', year: 2026, amount: 84800 },
  ],
  recentRegistrations: [
    {
      id: 'u1',
      name: 'محمد الزهراني',
      email: 'mohammed@oasistreats.net',
      accountType: 'فرد',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      planName: 'المجاني',
    },
    {
      id: 'u2',
      name: 'شركة الأفق العقارية',
      email: 'contact@alofooq.sa',
      accountType: 'شركة',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      planName: 'الذهبية',
    },
    {
      id: 'u3',
      name: 'مكتب الصفا العقاري',
      email: 'info@alsafa.com',
      accountType: 'مكتب عقاري',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      planName: 'الفضية',
    },
    {
      id: 'u4',
      name: 'سارة العتيبي',
      email: 'sara@example.com',
      accountType: 'فرد',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      planName: 'العادية',
    },
    {
      id: 'u5',
      name: 'شركة رواء للتطوير العقاري',
      email: 'admin@rewaa.sa',
      accountType: 'شركة',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      planName: 'الذهبية',
    },
  ],
  pendingVerifications: [
    {
      identityId: 'pv1',
      name: 'المستقبل',
      type: 'مكتب عقاري',
      licenseNumber: '74978930863',
      licenseActivity: 'تنفيذ وتشطيب',
      licenseExpiry: '17 مارس 2028',
      logoUrl: null,
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      identityId: 'pv2',
      name: 'دار العقار الحديث',
      type: 'شركة',
      licenseNumber: '74978930864',
      licenseActivity: 'وساطة عقارية',
      licenseExpiry: '22 يونيو 2027',
      logoUrl: null,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      identityId: 'pv3',
      name: 'المنار',
      type: 'شركة',
      licenseNumber: '74978930865',
      licenseActivity: 'وساطة عقارية',
      licenseExpiry: '05 سبتمبر 2027',
      logoUrl: null,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      identityId: 'pv4',
      name: 'الأمل',
      type: 'مكتب عقاري',
      licenseNumber: '74978930866',
      licenseActivity: 'تنفيذ وتشطيب',
      licenseExpiry: '11 نوفمبر 2028',
      logoUrl: null,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      identityId: 'pv5',
      name: 'شركة الأفق',
      type: 'شركة',
      licenseNumber: '74978930867',
      licenseActivity: 'وساطة عقارية',
      licenseExpiry: '30 يناير 2027',
      logoUrl: null,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      identityId: 'pv6',
      name: 'مكتب الصفا',
      type: 'مكتب عقاري',
      licenseNumber: '74978930868',
      licenseActivity: 'تنفيذ وتشطيب',
      licenseExpiry: '14 ابريل 2028',
      logoUrl: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      identityId: 'pv7',
      name: 'شركة الرائد',
      type: 'شركة',
      licenseNumber: '74978930869',
      licenseActivity: 'وساطة عقارية',
      licenseExpiry: '19 ديسمبر 2027',
      logoUrl: null,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboardPage()

  // Use Figma default data when backend is unreachable or empty
  const activeData: AdminDashboardResponse =
    data && data.metrics && data.metrics.totalUsers > 0
      ? data
      : FIGMA_DEFAULT_DATA

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
  const [lastApprovedRequest, setLastApprovedRequest] =
    useState<AdminDashboardPendingVerification | null>(null)

  useEffect(() => {
    if (activeData.pendingVerifications) {
      setPendingRequests(activeData.pendingVerifications)
    }
  }, [activeData])

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
      count: '10',
      change: '-3.2%',
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
      setLastApprovedRequest(selectedRequest)
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
      setLastApprovedRequest(selectedRequest)
      setIsRejectModalOpen(false)
      setIsDrawerOpen(false)
      setToastMessage('تم رفض طلب التوثيق بنجاح.')
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
      setLastApprovedRequest(selectedRequest)
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
  const handleUndoApproval = () => {
    if (lastApprovedRequest) {
      setPendingRequests((prev) => [lastApprovedRequest, ...prev])
      setLastApprovedRequest(null)
    }
    setShowToast(false)
  }

  return (
    <div className="space-y-8 text-right select-none relative" dir="rtl">
      {/* Toast Notification matching Figma node 2734:152341 */}
      <VerificationSuccessToast
        show={showToast}
        message={toastMessage}
        onUndo={handleUndoApproval}
        onClose={() => setShowToast(false)}
        autoHideDuration={6000}
      />

      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        showExport={true}
      />

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg font-['Cairo'] text-sm flex items-center justify-between">
          <span>{error} - يتم عرض البيانات التجريبية للمعاينة</span>
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
        <ReportsCard />
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

      {/* Slide-over Verification Drawer matching Figma node 2732:151741 & 2734:152868 */}
      <ReviewVerificationDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        request={selectedRequest}
        onApprove={handleApproveClick}
        onRequestEdit={handleRequestEditClick}
        onReject={handleRejectClick}
      />

      {/* Approval Confirmation Modal matching Figma node 2734:152314 */}
      <ConfirmVerificationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmBadge}
        isLoading={isSubmittingDecision}
      />

      {/* Reject Confirmation Modal matching Figma node 2734:152236 */}
      <RejectVerificationModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        isLoading={isSubmittingDecision}
      />

      {/* Request Edit Modal matching Figma node 2804:65127 */}
      <RequestEditModal
        isOpen={isRequestEditModalOpen}
        onClose={() => setIsRequestEditModalOpen(false)}
        onConfirm={handleConfirmRequestEdit}
        isLoading={isSubmittingDecision}
      />
    </div>
  )
}
