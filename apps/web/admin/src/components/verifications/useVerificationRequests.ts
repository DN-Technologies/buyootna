'use client'

import { useState, useEffect, useCallback } from 'react'
import { VerificationStatusFilter } from '@/components/dashboard/StatusFilterDropdown'
import { SortByOption } from '@/components/dashboard/SortByDropdown'
import {
  AdminDashboardPendingVerification,
  updateIdentityStatus,
  requestIdentityEdit,
} from '@/lib/admin-dashboard'
import {
  fetchVerifications,
  notifyUsers as notifyUsersApi,
  AdminVerificationsResponse,
} from '@/lib/admin-verifications'
import { updateUserStatus } from '@/lib/admin-users'
import { VerificationTableRow, VerificationTab } from './types'

const EMPTY_RESPONSE: AdminVerificationsResponse = {
  data: [],
  meta: { total: 0, currentPage: 1, limit: 10, totalPages: 1 },
  counts: { all: 0, companies: 0, offices: 0 },
  stats: { pendingCount: 0, approvedTodayCount: 0, rejectedTodayCount: 0 },
}

function toAccountType(
  tab: VerificationTab,
): 'شركة' | 'مكتب عقاري' | undefined {
  if (tab === 'companies') return 'شركة'
  if (tab === 'offices') return 'مكتب عقاري'
  return undefined
}

export function useVerificationRequests() {
  // Tab filter: 'all' | 'offices' | 'companies'
  const [activeTab, setActiveTabState] = useState<VerificationTab>('all')

  // Search and status filters
  const [searchQuery, setSearchQueryState] = useState('')
  const [statusFilter, setStatusFilterState] =
    useState<VerificationStatusFilter>('ALL')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // Sort filter matching Figma node 2772:54857
  const [sortBy, setSortByState] = useState<SortByOption>('ALL')
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Fetched data
  const [response, setResponse] =
    useState<AdminVerificationsResponse>(EMPTY_RESPONSE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Review & Modal States
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false)
  const [selectedForReview, setSelectedForReview] =
    useState<AdminDashboardPendingVerification | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [requestEditModalOpen, setRequestEditModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toast
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('تم اعتماد التوثيق بنجاح.')
  const [lastVerifiedId, setLastVerifiedId] = useState<string | null>(null)

  const loadVerifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchVerifications({
        search: searchQuery.trim() || undefined,
        accountType: toAccountType(activeTab),
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortOrder: sortBy === 'ALL' ? undefined : sortBy,
        page: currentPage,
        limit: 10,
      })
      setResponse(res)
    } catch (err) {
      console.error('Failed to load verification requests:', err)
      setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم الخلفية.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeTab, statusFilter, sortBy, currentPage])

  useEffect(() => {
    loadVerifications()
  }, [loadVerifications])

  const rows: VerificationTableRow[] = response.data.map((r) => ({
    id: r.identityId,
    userId: r.userId,
    name: r.name,
    email: r.email,
    accountType: r.accountType,
    status: r.status,
    accountStatus: r.accountStatus,
    attachmentsText: r.attachmentsText,
    sentAt: r.sentAt,
    actionLabel: r.actionLabel,
    licenseNumber: r.licenseNumber || undefined,
    licenseActivity: r.licenseActivity || undefined,
    licenseExpiry: r.licenseExpiry || undefined,
    logoUrl: r.logoUrl || undefined,
  }))

  // Filter/tab/sort setters reset back to page 1
  const setActiveTab = (tab: VerificationTab) => {
    setActiveTabState(tab)
    setCurrentPage(1)
  }
  const setSearchQuery = (query: string) => {
    setSearchQueryState(query)
    setCurrentPage(1)
  }
  const setStatusFilter = (status: VerificationStatusFilter) => {
    setStatusFilterState(status)
    setCurrentPage(1)
  }
  const setSortBy = (sort: SortByOption) => {
    setSortByState(sort)
    setCurrentPage(1)
  }

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === rows.length && rows.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(rows.map((r) => r.id))
    }
  }

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  // Row Action (Review / View)
  const handleOpenReview = (row: VerificationTableRow) => {
    const pendingItem: AdminDashboardPendingVerification = {
      identityId: row.id,
      name: row.name,
      type: row.accountType,
      licenseNumber: row.licenseNumber || null,
      licenseActivity: row.licenseActivity || null,
      licenseExpiry: row.licenseExpiry || null,
      logoUrl: row.logoUrl || null,
      createdAt: new Date().toISOString(),
      status: row.status,
      sentAt: row.sentAt,
    }
    setSelectedForReview(pendingItem)
    setReviewDrawerOpen(true)
  }

  // Drawer Action Triggers
  const handleApproveClick = () => {
    setConfirmModalOpen(true)
  }

  const handleRejectClick = () => {
    setRejectModalOpen(true)
  }

  const handleRequestEditClick = () => {
    setRequestEditModalOpen(true)
  }

  // Modal Confirmations
  const handleConfirmApprove = async (options: {
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedForReview) return
    setIsSubmitting(true)
    const approvedId = selectedForReview.identityId
    try {
      await updateIdentityStatus(approvedId, {
        status: 'APPROVED',
        notifyEmail: options.notifyEmail,
      })
      setLastVerifiedId(approvedId)
      setToastMessage('تم اعتماد التوثيق بنجاح.')
      setShowToast(true)
      await loadVerifications()
    } catch (err) {
      console.error('Failed to approve identity:', err)
      setToastMessage('حدث خطأ أثناء اعتماد التوثيق.')
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
      setConfirmModalOpen(false)
      setReviewDrawerOpen(false)
    }
  }

  const handleConfirmReject = async (options: {
    reason: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedForReview) return
    setIsSubmitting(true)
    const isRevoking = selectedForReview.status === 'موثق'
    try {
      await updateIdentityStatus(selectedForReview.identityId, {
        status: 'REJECTED',
        reason: options.reason,
        notifyEmail: options.notifyEmail,
      })
      setToastMessage(
        isRevoking ? 'تم إلغاء التوثيق بنجاح.' : 'تم رفض طلب التوثيق.',
      )
      setShowToast(true)
      await loadVerifications()
    } catch (err) {
      console.error('Failed to reject identity:', err)
      setToastMessage('حدث خطأ أثناء رفض طلب التوثيق.')
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
      setRejectModalOpen(false)
      setReviewDrawerOpen(false)
    }
  }

  const handleConfirmRequestEdit = async (options: {
    notes: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedForReview) return
    setIsSubmitting(true)
    try {
      await requestIdentityEdit(selectedForReview.identityId, {
        notes: options.notes,
        notifyEmail: options.notifyEmail,
      })
      setToastMessage('تم إرسال طلب التعديل إلى المستخدم.')
      setShowToast(true)
      await loadVerifications()
    } catch (err) {
      console.error('Failed to request identity edit:', err)
      setToastMessage('حدث خطأ أثناء إرسال طلب التعديل.')
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
      setRequestEditModalOpen(false)
      setReviewDrawerOpen(false)
    }
  }

  // Undo re-uses the reject flow, since revoking a verification is the same
  // backend operation as rejecting it (see ../../../CLAUDE plan notes: there
  // is no separate "revoked" state in the schema).
  const handleUndoVerification = async () => {
    const approvedId = lastVerifiedId
    if (!approvedId) return
    setShowToast(false)
    setLastVerifiedId(null)
    try {
      await updateIdentityStatus(approvedId, { status: 'REJECTED' })
      await loadVerifications()
    } catch (err) {
      console.error('Failed to undo verification:', err)
    }
  }

  // Bulk Actions
  const handleBulkExport = () => {
    const selectedRows =
      selectedIds.length > 0
        ? rows.filter((r) => selectedIds.includes(r.id))
        : rows
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['الاسم,البريد الإلكتروني,نوع الحساب,الحالة,المرفقات,تاريخ الإرسال']
        .concat(
          selectedRows.map(
            (r) =>
              `"${r.name}","${r.email}","${r.accountType}","${r.status}","${r.attachmentsText}","${r.sentAt}"`,
          ),
        )
        .join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `verification_requests_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBulkBlock = async () => {
    const targets = rows.filter((r) => selectedIds.includes(r.id) && r.userId)
    for (const row of targets) {
      try {
        await updateUserStatus(row.userId as string, 'blocked')
      } catch (err) {
        console.error(`Failed to block user for row ${row.id}:`, err)
      }
    }
    setSelectedIds([])
    setToastMessage('تم حظر الحسابات المحددة.')
    setShowToast(true)
    await loadVerifications()
  }

  const handleBulkSuspend = async () => {
    const targets = rows.filter((r) => selectedIds.includes(r.id) && r.userId)
    for (const row of targets) {
      try {
        await updateUserStatus(row.userId as string, 'suspended')
      } catch (err) {
        console.error(`Failed to suspend user for row ${row.id}:`, err)
      }
    }
    setSelectedIds([])
    setToastMessage('تم إيقاف الحسابات المحددة مؤقتاً.')
    setShowToast(true)
    await loadVerifications()
  }

  const handleBulkNotify = async () => {
    if (selectedIds.length === 0) return
    const title = window.prompt('عنوان الإشعار:')
    if (!title) return
    const message = window.prompt('نص الإشعار:')
    if (!message) return

    const userIds = rows
      .filter((r) => selectedIds.includes(r.id) && r.userId)
      .map((r) => r.userId as string)

    try {
      const res = await notifyUsersApi({ userIds, title, message })
      setToastMessage(res.message)
    } catch (err) {
      console.error('Failed to send bulk notification:', err)
      setToastMessage('حدث خطأ أثناء إرسال الإشعار الجماعي.')
    }
    setShowToast(true)
  }

  return {
    tab: {
      activeTab,
      setActiveTab,
    },
    filters: {
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      showStatusMenu,
      setShowStatusMenu,
      sortBy,
      setSortBy,
      showSortMenu,
      setShowSortMenu,
    },
    selection: {
      selectedIds,
      handleToggleSelectAll,
      handleToggleSelectRow,
      handleClearSelection,
    },
    rows,
    filteredRows: rows,
    loading,
    error,
    counts: response.counts,
    stats: response.stats,
    pagination: {
      currentPage,
      setCurrentPage,
      totalPages: response.meta.totalPages,
      totalItems: response.meta.total,
      currentCount: rows.length,
    },
    review: {
      reviewDrawerOpen,
      setReviewDrawerOpen,
      selectedForReview,
      handleOpenReview,
      handleApproveClick,
      handleRejectClick,
      handleRequestEditClick,
    },
    modals: {
      confirmModalOpen,
      setConfirmModalOpen,
      rejectModalOpen,
      setRejectModalOpen,
      requestEditModalOpen,
      setRequestEditModalOpen,
      isSubmitting,
      handleConfirmApprove,
      handleConfirmReject,
      handleConfirmRequestEdit,
    },
    toast: {
      showToast,
      setShowToast,
      toastMessage,
      lastVerifiedId,
      handleUndoVerification,
    },
    bulk: {
      handleBulkExport,
      handleBulkBlock,
      handleBulkSuspend,
      handleBulkNotify,
    },
  }
}
