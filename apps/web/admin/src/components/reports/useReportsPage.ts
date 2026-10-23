'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AdminReportRow,
  AdminReportsResponse,
  BackendReportPriority,
  BackendReportStatus,
  bulkDismissReports,
  bulkResolveReports,
  enforceReport,
  fetchReport,
  fetchReports,
  updateReport,
} from '@/lib/admin-reports'
import {
  MAIN_PRIORITY_LABEL,
  MAIN_STATUS_LABEL,
  reportTypeLabel,
  TYPE_FILTER_TO_BACKEND,
} from '@/lib/report-labels'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'
import {
  ReportItem,
  ReportStats,
  ReportPagination,
  StatusFilterOption,
  TypeFilterOption,
  PriorityFilterOption,
  DateFilterOption,
} from './types'

const EMPTY_RESPONSE: AdminReportsResponse = {
  data: [],
  meta: { total: 0, currentPage: 1, limit: 10, totalPages: 1 },
  stats: { total: 0, pending: 0, resolved: 0, dismissed: 0 },
}

const STATUS_LABEL_TO_BACKEND: Record<
  Exclude<StatusFilterOption, 'الكل'>,
  BackendReportStatus
> = {
  'قيد الانتظار': 'PENDING',
  'تم حلها': 'RESOLVED',
  مرفوض: 'DISMISSED',
}

const PRIORITY_LABEL_TO_BACKEND: Record<
  Exclude<PriorityFilterOption, 'الكل'>,
  BackendReportPriority
> = {
  منخفض: 'LOW',
  متوسط: 'MEDIUM',
  عاجل: 'URGENT',
}

const DATE_LABEL_TO_BACKEND: Record<
  Exclude<DateFilterOption, 'الكل'>,
  'TODAY' | 'WEEK' | 'MONTH'
> = {
  اليوم: 'TODAY',
  'هذا الأسبوع': 'WEEK',
  'هذا الشهر': 'MONTH',
}

function toReportItem(row: AdminReportRow): ReportItem {
  return {
    id: row.id,
    reportNumber: row.reportNumber,
    submittedBy: row.submittedBy
      ? {
          id: row.submittedBy.id,
          name: row.submittedBy.name,
          email: row.submittedBy.email || '—',
          phone: row.submittedBy.phone || undefined,
        }
      : { name: 'مستخدم بيوتنا', email: '—' },
    against: row.against
      ? {
          id: row.against.id,
          name: row.against.name,
          email: row.against.email || '—',
          phone: row.against.phone || undefined,
        }
      : { name: 'مستخدم محذوف', email: '—' },
    targetType: row.targetType,
    type: reportTypeLabel(row.targetType, row.against?.role ?? null),
    reason: row.reason,
    status: MAIN_STATUS_LABEL[row.status],
    createdAt: formatRelativeArabicTime(row.createdAt),
    priority: MAIN_PRIORITY_LABEL[row.priority],
    description: row.description || undefined,
    ...reportedContent(row),
  }
}

const CONTENT_LABEL = {
  PROPERTY: 'الإعلان المبلغ عنه',
  REVIEW: 'التقييم المبلغ عنه',
  STORY: 'القصة المبلغ عنها',
} as const

// A reported review's comment or story's caption, for the drawer
function reportedContent(row: AdminReportRow) {
  if (!row.content) return {}
  const snap = row.content.snapshot ?? {}
  const text =
    typeof snap.comment === 'string'
      ? snap.comment
      : typeof snap.caption === 'string'
        ? snap.caption
        : undefined
  return {
    contentLabel: CONTENT_LABEL[row.content.kind],
    contentText: text || undefined,
  }
}

export function useReportsPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('الكل')
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>('الكل')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilterOption>('الكل')
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('الكل')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [reportToResolve, setReportToResolve] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [response, setResponse] = useState<AdminReportsResponse>(EMPTY_RESPONSE)
  const [loading, setLoading] = useState(true)

  // "خدمة" (service) has no real backend entity to match -- short-circuit
  // to an empty result instead of sending a nonsensical filter.
  const isServiceTypeFilter = typeFilter === 'خدمة'

  const loadReports = useCallback(async () => {
    if (isServiceTypeFilter) {
      setResponse(EMPTY_RESPONSE)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const typeMapping =
        typeFilter !== 'الكل' ? TYPE_FILTER_TO_BACKEND[typeFilter] : undefined
      const res = await fetchReports({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'الكل' ? STATUS_LABEL_TO_BACKEND[statusFilter] : undefined,
        priority:
          priorityFilter !== 'الكل' ? PRIORITY_LABEL_TO_BACKEND[priorityFilter] : undefined,
        targetType: typeMapping?.targetType,
        targetRole: typeMapping?.targetRole,
        dateFilter: dateFilter !== 'الكل' ? DATE_LABEL_TO_BACKEND[dateFilter] : undefined,
        page: currentPage,
        limit: 10,
      })
      setResponse(res)
    } catch (err) {
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }, [
    isServiceTypeFilter,
    searchQuery,
    statusFilter,
    typeFilter,
    priorityFilter,
    dateFilter,
    currentPage,
  ])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Deep-link support for the dashboard ReportsCard's "التفاصيل" button
  // (?open=<reportId>): fetch that one report and open the review drawer.
  useEffect(() => {
    const openId = searchParams.get('open')
    if (!openId) return
    fetchReport(openId)
      .then((row) => {
        setSelectedReport(toReportItem(row))
        setIsDrawerOpen(true)
      })
      .catch((err) => console.error('Failed to open linked report:', err))
    // Only run once on mount for the id present at load time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reports: ReportItem[] = response.data.map(toReportItem)

  const handleSetSearchQuery = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }
  const handleSetStatusFilter = (status: StatusFilterOption) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }
  const handleSetTypeFilter = (type: TypeFilterOption) => {
    setTypeFilter(type)
    setCurrentPage(1)
  }
  const handleSetPriorityFilter = (priority: PriorityFilterOption) => {
    setPriorityFilter(priority)
    setCurrentPage(1)
  }
  const handleSetDateFilter = (date: DateFilterOption) => {
    setDateFilter(date)
    setCurrentPage(1)
  }

  const stats: ReportStats = {
    total: response.stats.total,
    pending: response.stats.pending,
    resolved: response.stats.resolved,
    dismissed: response.stats.dismissed,
  }

  const pagination: ReportPagination = {
    currentPage,
    totalPages: response.meta.totalPages,
    totalItems: response.meta.total,
    pageSize: response.meta.limit,
  }

  // Row selection actions
  const toggleSelectAll = () => {
    const currentIds = reports.map((r) => r.id)
    const allSelected = currentIds.every((id) => selectedIds.includes(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const triggerToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Resolution Confirmations (Single: Node 4940:87775, Bulk: Node 4881:16818)
  const handleOpenBulkConfirm = () => {
    if (selectedIds.length === 0) return
    setReportToResolve(null)
    setIsConfirmModalOpen(true)
  }

  const handleOpenSingleConfirm = (id: string) => {
    setReportToResolve(id)
    setIsConfirmModalOpen(true)
  }

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setReportToResolve(null)
  }

  const handleConfirmResolution = async () => {
    setIsSubmitting(true)
    try {
      if (reportToResolve) {
        await updateReport(reportToResolve, { status: 'RESOLVED' })
        setSelectedReport((prev) =>
          prev && prev.id === reportToResolve ? { ...prev, status: 'تم حلها' } : prev,
        )
        triggerToast('تم تغيير حالة البلاغ الى "تم الحل" بنجاح.')
      } else if (selectedIds.length > 0) {
        const count = selectedIds.length
        await bulkResolveReports(selectedIds)
        triggerToast(`تم تغيير حالة ${count} بلاغات الى "تم الحل" بنجاح.`)
        setSelectedIds([])
      }
      setIsConfirmModalOpen(false)
      setReportToResolve(null)
      await loadReports()
    } catch (err) {
      console.error('Failed to resolve report(s):', err)
      triggerToast('حدث خطأ أثناء تحديث حالة البلاغ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Single report dismissal
  // «حذف المحتوى وإيقاف الحساب»: the 24-hour action on a report
  const handleEnforceReport = async (id: string) => {
    if (
      !window.confirm(
        'سيتم حذف المحتوى المبلغ عنه وإيقاف حساب ناشره وإغلاق البلاغ. متابعة؟',
      )
    ) {
      return
    }
    try {
      await enforceReport(id)
      triggerToast('تم حذف المحتوى وإيقاف الحساب')
      await loadReports()
    } catch (err) {
      console.error('Failed to enforce report:', err)
      triggerToast('حدث خطأ أثناء حذف المحتوى وإيقاف الحساب.')
    }
  }

  const handleDismissReport = async (id: string) => {
    try {
      await updateReport(id, { status: 'DISMISSED' })
      triggerToast('تم رفض البلاغ وإزالته من المراجعة')
      await loadReports()
    } catch (err) {
      console.error('Failed to dismiss report:', err)
      triggerToast('حدث خطأ أثناء رفض البلاغ.')
    }
  }

  // Drawer handlers
  const handleOpenReview = (report: ReportItem) => {
    setSelectedReport(report)
    setIsDrawerOpen(true)
  }

  const handleCloseReview = () => {
    setIsDrawerOpen(false)
    setSelectedReport(null)
  }

  return {
    reports,
    allFilteredCount: pagination.totalItems,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    statusFilter,
    setStatusFilter: handleSetStatusFilter,
    typeFilter,
    setTypeFilter: handleSetTypeFilter,
    priorityFilter,
    setPriorityFilter: handleSetPriorityFilter,
    dateFilter,
    setDateFilter: handleSetDateFilter,
    selectedIds,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
    handleBulkResolve: handleOpenBulkConfirm,
    isConfirmModalOpen,
    reportToResolve,
    resolveModalCount: reportToResolve ? 1 : selectedIds.length,
    isSubmitting,
    handleOpenBulkConfirm,
    handleOpenSingleConfirm,
    handleCloseConfirmModal,
    handleConfirmResolution,
    handleResolveReport: handleOpenSingleConfirm,
    handleDismissReport,
    handleEnforceReport,
    stats,
    pagination,
    setCurrentPage,
    loading,
    selectedReport,
    isDrawerOpen,
    handleOpenReview,
    handleCloseReview,
    toastMessage,
    setToastMessage,
  }
}
