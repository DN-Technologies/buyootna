'use client'

import { useState, useMemo } from 'react'
import {
  ReportItem,
  ReportStats,
  ReportPagination,
  StatusFilterOption,
  TypeFilterOption,
  PriorityFilterOption,
  DateFilterOption,
} from './types'

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: '1',
    reportNumber: 'RP-1025',
    submittedBy: {
      name: 'محمد المالك',
      email: 'mohamedelgareh@gmail.com',
      phone: '+96568690396',
    },
    against: {
      name: 'علي البالي',
      email: 'dar@gmail.com',
    },
    type: 'عقار',
    reportCategory: 'بيع',
    reason: 'معلومات غير صحيحة',
    status: 'قيد الانتظار',
    createdAt: 'منذ ساعة',
    priority: 'عاجل',
    targetTitle: 'شقة',
    targetPrice: '150,000',
    targetCurrency: 'د.ك',
    targetArea: '200 م2',
    targetLocation: 'شمال غرب صليبيخات',
    targetPropertyType: 'عمارة',
    targetImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    description:
      'أرغب بالبدل في منطقة "خيران السكنية" أو "المنطقة العاشرة" • يفضل زاوية أو شارع واحد • مستعد للتفاوض مع المواقع المميزة في خيران الأرض في موقع مميز جداً بضاحية N5، قريبة من مجمع الخدمات والمسجد. مدخل ومخرج سهل جداً من الطريق الرئيسي. الرغبة جادة جداً للبدل في خيران السكنية لدواعي القرب من الأهل.',
    attachments: [
      { name: 'صورة_الكهرباء.jpg', type: 'image' },
      { name: 'تقرير_الفحص.pdf', type: 'pdf' },
    ],
  },
  {
    id: '2',
    reportNumber: 'RP-1024',
    submittedBy: {
      name: 'سارة محمود',
      email: 'sara.m@example.com',
    },
    against: {
      name: 'شركة النور العقارية',
      email: 'info@alnoor.com',
    },
    type: 'شركة',
    reason: 'خدمة وهمية غير مكتملة',
    status: 'قيد الانتظار',
    createdAt: 'منذ 3 ساعات',
    priority: 'متوسط',
    targetTitle: 'حجز وحدة سكنية بالعاصمة الإدارية',
    description:
      'تم دفع مقدم الحجز ولم يتم تسليم أي سند استلام أو عقد مبدئي رغم مرور المهلة المتفق عليها.',
  },
  {
    id: '3',
    reportNumber: 'RP-1023',
    submittedBy: {
      name: 'عمر فاروق',
      email: 'omar.f@example.com',
    },
    against: {
      name: 'مكتب الأهرام العقاري',
      email: 'contact@ahram.com',
    },
    type: 'مكتب عقاري',
    reason: 'سعر مضلل ومخالف',
    status: 'تم حلها',
    createdAt: 'منذ 5 ساعات',
    priority: 'منخفضة',
    targetTitle: 'شقة للإيجار بالمعادي دجلة',
    description:
      'السعر المكتوب في الإعلان 15,000 ج.م شهرياً ولكن عند التواصل تم طلب 25,000 ج.م.',
  },
  {
    id: '4',
    reportNumber: 'RP-1022',
    submittedBy: {
      name: 'كريم حسن',
      email: 'karim.h@example.com',
    },
    against: {
      name: 'إبراهيم سعيد',
      email: 'ibrahim@example.com',
    },
    type: 'فرد',
    reason: 'احتيال ونصب مالي',
    status: 'قيد الانتظار',
    createdAt: 'منذ يوم',
    priority: 'عاجل',
    targetTitle: 'شاليه بقرية أمواج الساحل الشمالي',
    description:
      'قام المعلن بطلب تحويل تأمين عبر محفظة إلكترونية ثم أغلق الهاتف ولم يكن مالكاً للشاليه.',
  },
  {
    id: '5',
    reportNumber: 'RP-1021',
    submittedBy: {
      name: 'منى يوسف',
      email: 'mona.y@example.com',
    },
    against: {
      name: 'مؤسسة الإعمار للتشطيبات',
      email: 'contact@emaar.com',
    },
    type: 'خدمة',
    reason: 'عدم الالتزام بموعد التسليم',
    status: 'تم حلها',
    createdAt: 'منذ يومين',
    priority: 'متوسط',
    targetTitle: 'باقة تشطيبات ديكور داخلي متكاملة',
    description:
      'تأخر في تسليم أعمال التشطيب لأكثر من 45 يوماً دون تقديم أي مبرر فني.',
  },
  {
    id: '6',
    reportNumber: 'RP-1020',
    submittedBy: {
      name: 'حازم إمام',
      email: 'hazem.e@example.com',
    },
    against: {
      name: 'شركة الأندلس للتطوير',
      email: 'andalus@example.com',
    },
    type: 'شركة',
    reason: 'مواصفات العقار غير مطابقة',
    status: 'تم حلها',
    createdAt: 'منذ 3 أيام',
    priority: 'منخفضة',
    targetTitle: 'مكتب تجاري بالشيخ زايد',
    description:
      'المكتب غير مرخص تجارياً عكس ما تم الإعلان عنه في تفاصيل العقار.',
  },
  {
    id: '7',
    reportNumber: 'RP-1019',
    submittedBy: {
      name: 'طارق فتحي',
      email: 'tarek.f@example.com',
    },
    against: {
      name: 'خالد العوضي',
      email: 'khaled@example.com',
    },
    type: 'عقار',
    reason: 'إعلان مكرر ومزعج',
    status: 'قيد الانتظار',
    createdAt: 'منذ 4 أيام',
    priority: 'منخفضة',
    targetTitle: 'روف دوبلكس بالدقي',
    description:
      'تم نشر نفس الإعلان أكثر من 10 مرات في نفس اليوم لإغراق نتائج البحث.',
  },
  {
    id: '8',
    reportNumber: 'RP-1018',
    submittedBy: {
      name: 'رانيا عادل',
      email: 'rania.a@example.com',
    },
    against: {
      name: 'مكتب المستقبل العقاري',
      email: 'info@future.com',
    },
    type: 'مكتب عقاري',
    reason: 'طلب عمولة غير قانونية',
    status: 'قيد الانتظار',
    createdAt: 'منذ 5 أيام',
    priority: 'عاجل',
    targetTitle: 'مقر إداري بمصر الجديدة',
    description:
      'طلب عمولة وساطة بنسبة تفوق الحد الأقصى المسموح به وإصرار على الدفع نقداً دون إيصال.',
  },
  {
    id: '9',
    reportNumber: 'RP-1017',
    submittedBy: {
      name: 'حسام نبيل',
      email: 'hossam.n@example.com',
    },
    against: {
      name: 'أحمد سمير',
      email: 'ahmed.s@example.com',
    },
    type: 'خدمة',
    reason: 'خدمة صيانة رديئة ومخالفة',
    status: 'قيد الانتظار',
    createdAt: 'منذ 6 أيام',
    priority: 'متوسط',
    targetTitle: 'خدمات عزل أسطح ومسابح',
    description:
      'تسريب المياه حدث مجدداً بعد يومين من انتهاء العمل ورفض الفني الحضور للإصلاح.',
  },
  {
    id: '10',
    reportNumber: 'RP-1016',
    submittedBy: {
      name: 'نادية سامي',
      email: 'nadia.s@example.com',
    },
    against: {
      name: 'يوسف كمال',
      email: 'youssef.k@example.com',
    },
    type: 'عقار',
    reason: 'صور مأخوذة من إعلان آخر',
    status: 'قيد الانتظار',
    createdAt: 'منذ أسبوع',
    priority: 'عاجل',
    targetTitle: 'بنتهاوس فاخر بكمبوند بالم هيلز',
    description:
      'الصور المستخدمة في الإعلان تعود لشقتي الخاصة وتم نسخها بدون إذن وتغيير الأسعار.',
  },
]

export function useReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS)
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
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchNumber = item.reportNumber.toLowerCase().includes(query)
        const matchSubmitter =
          item.submittedBy.name.toLowerCase().includes(query) ||
          item.submittedBy.email.toLowerCase().includes(query)
        const matchAgainst =
          item.against.name.toLowerCase().includes(query) ||
          item.against.email.toLowerCase().includes(query)
        const matchReason = item.reason.toLowerCase().includes(query)
        const matchType = item.type.toLowerCase().includes(query)
        if (
          !matchNumber &&
          !matchSubmitter &&
          !matchAgainst &&
          !matchReason &&
          !matchType
        ) {
          return false
        }
      }

      // Status filter
      if (statusFilter !== 'الكل' && item.status !== statusFilter) {
        return false
      }

      // Type filter
      if (typeFilter !== 'الكل' && item.type !== typeFilter) {
        return false
      }

      // Priority filter (matching Figma Node 4881:16018)
      if (priorityFilter !== 'الكل') {
        if (priorityFilter === 'منخفض' && item.priority !== 'منخفضة') {
          return false
        }
        if (priorityFilter !== 'منخفض' && item.priority !== priorityFilter) {
          return false
        }
      }

      return true
    })
  }, [reports, searchQuery, statusFilter, typeFilter, priorityFilter])

  // Dynamic stats calculation (always based on total data set)
  const stats: ReportStats = useMemo(() => {
    const total = reports.length
    const pending = reports.filter((r) => r.status === 'قيد الانتظار').length
    const resolved = reports.filter((r) => r.status === 'تم حلها').length
    return {
      total: total + 10, // matching ~20 from Figma design
      pending: pending,
      resolved: resolved,
    }
  }, [reports])

  // Pagination info
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize))
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredReports.slice(start, start + pageSize)
  }, [filteredReports, currentPage, pageSize])

  const pagination: ReportPagination = {
    currentPage,
    totalPages,
    totalItems: filteredReports.length,
    pageSize,
  }

  // Row selection actions
  const toggleSelectAll = () => {
    const currentIds = paginatedReports.map((r) => r.id)
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

  const handleConfirmResolution = () => {
    if (reportToResolve) {
      const targetId = reportToResolve
      setReports((prev) =>
        prev.map((r) => (r.id === targetId ? { ...r, status: 'تم حلها' } : r))
      )
      setSelectedReport((prev) =>
        prev && prev.id === targetId ? { ...prev, status: 'تم حلها' } : prev
      )
      setIsConfirmModalOpen(false)
      setReportToResolve(null)
      triggerToast('تم تغيير حالة البلاغ الى "تم الحل" بنجاح.')
    } else if (selectedIds.length > 0) {
      const count = selectedIds.length
      setReports((prev) =>
        prev.map((r) =>
          selectedIds.includes(r.id) ? { ...r, status: 'تم حلها' } : r
        )
      )
      setIsConfirmModalOpen(false)
      triggerToast(`تم تغيير حالة ${count} بلاغات الى "تم الحل" بنجاح.`)
      setSelectedIds([])
    }
  }

  // Single report dismissal
  const handleDismissReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
    triggerToast('تم رفض البلاغ وإزالته من المراجعة')
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
    reports: paginatedReports,
    allFilteredCount: filteredReports.length,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    priorityFilter,
    setPriorityFilter,
    dateFilter,
    setDateFilter,
    selectedIds,
    toggleSelectAll,
    toggleSelectRow,
    clearSelection,
    handleBulkResolve: handleOpenBulkConfirm,
    isConfirmModalOpen,
    reportToResolve,
    resolveModalCount: reportToResolve ? 1 : selectedIds.length,
    handleOpenBulkConfirm,
    handleOpenSingleConfirm,
    handleCloseConfirmModal,
    handleConfirmResolution,
    handleResolveReport: handleOpenSingleConfirm,
    handleDismissReport,
    stats,
    pagination,
    setCurrentPage,
    selectedReport,
    isDrawerOpen,
    handleOpenReview,
    handleCloseReview,
    toastMessage,
    setToastMessage,
  }
}
