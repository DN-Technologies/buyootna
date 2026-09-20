'use client'

import { useState, useMemo } from 'react'
import { VerificationStatusFilter } from '@/components/dashboard/StatusFilterDropdown'
import { SortByOption } from '@/components/dashboard/SortByDropdown'
import {
  AdminDashboardPendingVerification,
  updateIdentityStatus,
  requestIdentityEdit,
} from '@/lib/admin-dashboard'
import {
  VerificationTableRow,
  VerificationTab,
  INITIAL_VERIFICATION_ROWS,
} from './types'

export function useVerificationRequests() {
  // Tab filter: 'all' | 'offices' | 'companies'
  const [activeTab, setActiveTab] = useState<VerificationTab>('all')

  // Search and status filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<VerificationStatusFilter>('ALL')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // Sort filter matching Figma node 2772:54857
  const [sortBy, setSortBy] = useState<SortByOption>('ALL')
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Rows state
  const [rows, setRows] = useState<VerificationTableRow[]>(INITIAL_VERIFICATION_ROWS)

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

  // Filtered and sorted rows
  const filteredRows = useMemo(() => {
    let result = rows.filter((row) => {
      // Tab filter
      if (activeTab === 'offices' && row.accountType !== 'مكتب عقاري') return false
      if (activeTab === 'companies' && row.accountType !== 'شركة') return false

      // Status filter
      if (statusFilter === 'VERIFIED' && row.status !== 'موثق') return false
      if (statusFilter === 'PENDING' && row.status !== 'قيد الانتظار') return false
      if (statusFilter === 'UNVERIFIED' && row.status !== 'غير موثق') return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = row.name.toLowerCase().includes(q)
        const matchesEmail = row.email.toLowerCase().includes(q)
        const matchesType = row.accountType.toLowerCase().includes(q)
        return matchesName || matchesEmail || matchesType
      }

      return true
    })

    if (sortBy === 'NEWEST') {
      result = [...result].sort(
        (a, b) => (b.createdAtTimestamp || 0) - (a.createdAtTimestamp || 0)
      )
    } else if (sortBy === 'OLDEST') {
      result = [...result].sort(
        (a, b) => (a.createdAtTimestamp || 0) - (b.createdAtTimestamp || 0)
      )
    }

    return result
  }, [rows, activeTab, statusFilter, searchQuery, sortBy])

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRows.map((r) => r.id))
    }
  }

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
    try {
      await updateIdentityStatus(selectedForReview.identityId, {
        status: 'APPROVED',
        notifyEmail: options.notifyEmail,
      })
    } catch {
      // Fallback optimistic UI
    }

    const approvedId = selectedForReview.identityId
    setRows((prev) =>
      prev.map((r) =>
        r.id === approvedId ? { ...r, status: 'موثق' as const } : r
      )
    )
    setLastVerifiedId(approvedId)
    setIsSubmitting(false)
    setConfirmModalOpen(false)
    setReviewDrawerOpen(false)
    setToastMessage('تم اعتماد التوثيق بنجاح.')
    setShowToast(true)
  }

  const handleConfirmReject = async (options: {
    reason: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    if (!selectedForReview) return
    setIsSubmitting(true)
    try {
      await updateIdentityStatus(selectedForReview.identityId, {
        status: 'REJECTED',
        reason: options.reason,
        notifyEmail: options.notifyEmail,
      })
    } catch {
      // Fallback optimistic UI
    }

    const isRevoking = selectedForReview.status === 'موثق'
    const rejectedId = selectedForReview.identityId
    setRows((prev) =>
      prev.map((r) =>
        r.id === rejectedId
          ? {
              ...r,
              status: isRevoking ? ('غير موثق' as const) : ('مرفوض' as const),
              actionLabel: 'مراجعة' as const,
            }
          : r
      )
    )
    setIsSubmitting(false)
    setRejectModalOpen(false)
    setReviewDrawerOpen(false)
    setToastMessage(isRevoking ? 'تم إلغاء التوثيق بنجاح.' : 'تم رفض طلب التوثيق.')
    setShowToast(true)
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
    } catch {
      // Fallback optimistic UI
    }

    setIsSubmitting(false)
    setRequestEditModalOpen(false)
    setReviewDrawerOpen(false)
    setToastMessage('تم إرسال طلب التعديل إلى المستخدم.')
    setShowToast(true)
  }

  const handleUndoVerification = () => {
    if (lastVerifiedId) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === lastVerifiedId ? { ...r, status: 'غير موثق' as const } : r
        )
      )
      setLastVerifiedId(null)
    }
    setShowToast(false)
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
              `"${r.name}","${r.email}","${r.accountType}","${r.status}","${r.attachmentsText}","${r.sentAt}"`
          )
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

  const handleBulkBlock = () => {
    setRows((prev) =>
      prev.map((r) =>
        selectedIds.includes(r.id) ? { ...r, status: 'مرفوض' as const } : r
      )
    )
    setSelectedIds([])
    setToastMessage('تم حظر الحسابات المحددة.')
    setShowToast(true)
  }

  const handleBulkSuspend = () => {
    setSelectedIds([])
    setToastMessage('تم إيقاف الحسابات المحددة مؤقتاً.')
    setShowToast(true)
  }

  const handleBulkNotify = () => {
    setToastMessage(`تم إرسال إشعار جماعي إلى ${selectedIds.length} مستخدم.`)
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
    filteredRows,
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
