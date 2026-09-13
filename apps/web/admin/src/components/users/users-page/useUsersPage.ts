import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserCategoryTab } from '@/components/users/UserTabs'
import { UserRow } from '@/components/users/UserTable'
import {
  fetchAdminUsers,
  updateUserStatus,
  deleteUser,
  exportUsersCsv,
  AdminUsersResponse,
} from '@/lib/admin-users'
import {
  getUserCategoryConfig,
  getRoleFromTab,
  UserPageCategoryConfig,
} from './constants'
import { UserModalsState, UserModalsHandlers } from './UserModalsContainer'

export function useUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as UserCategoryTab | null

  const activeTab = useMemo<UserCategoryTab>(() => {
    if (typeParam && ['individual', 'office', 'company'].includes(typeParam)) {
      return typeParam
    }
    return 'individual'
  }, [typeParam])

  const config: UserPageCategoryConfig = useMemo(
    () => getUserCategoryConfig(activeTab),
    [activeTab],
  )

  // Filter and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [dateSort, setDateSort] = useState<'asc' | 'desc' | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Modals state for row actions
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [planModalUser, setPlanModalUser] = useState<UserRow | null>(null)
  const [notificationModalUser, setNotificationModalUser] =
    useState<UserRow | null>(null)
  const [couponModalUser, setCouponModalUser] = useState<UserRow | null>(null)
  const [suspendModalUser, setSuspendModalUser] = useState<UserRow | null>(null)
  const [reactivateModalUser, setReactivateModalUser] =
    useState<UserRow | null>(null)
  const [blockModalUser, setBlockModalUser] = useState<UserRow | null>(null)
  const [resetPasswordModalUser, setResetPasswordModalUser] =
    useState<UserRow | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null)
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setToastMessage(msg)
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const [data, setData] = useState<AdminUsersResponse>({
    data: [],
    meta: { total: 0, currentPage: 1, limit: 10, totalPages: 1 },
    stats: { total: 0, active: 0, blocked: 0, suspended: 0 },
    counts: { all: 0, individual: 0, office: 0, company: 0 },
  })

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchAdminUsers({
        search: searchQuery,
        role: getRoleFromTab(activeTab),
        status: (statusFilter as any) || undefined,
        subscriptionPlan: subscriptionFilter || undefined,
        sortOrder: dateSort,
        page: currentPage,
        limit: 10,
      })

      const enrichedData = res.data.map((u) => ({
        ...u,
        adsCount: u.adsCount !== undefined ? u.adsCount : 0,
      }))

      setData({
        ...res,
        data: enrichedData,
      })
    } catch (err: any) {
      console.error('Failed to load users:', err)
      if (err?.response?.status === 404) {
        setError(
          'مسار نقطة النهاية غير موجود (404). يرجى التأكد من تشغيل خادم الخلفية.',
        )
      } else {
        setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم الخلفية.')
      }
    } finally {
      setLoading(false)
    }
  }, [
    searchQuery,
    activeTab,
    statusFilter,
    subscriptionFilter,
    dateSort,
    currentPage,
  ])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Filters handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSubscriptionFilterChange = (plan: string) => {
    setSubscriptionFilter(plan)
    setCurrentPage(1)
  }

  const handleDateSortToggle = () => {
    setDateSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // Row and page action handlers
  const handleStatusChange = async (
    user: UserRow,
    newStatus: 'active' | 'blocked' | 'suspended',
  ) => {
    try {
      await updateUserStatus(user.id, newStatus)
      await loadUsers()
      const statusNames = {
        active: 'تفعيل',
        suspended: 'تعطيل',
        blocked: 'حظر',
      }
      showToast(`تم ${statusNames[newStatus]} الحساب بنجاح`)
    } catch (err) {
      console.error('Failed to update status:', err)
      alert(`حدث خطأ أثناء تحديث حالة حساب الـ${config.entitySingle}`)
    }
  }

  const handleDeleteUser = async (user: UserRow) => {
    if (
      confirm(
        `هل أنت متأكد من رغبتك في حذف حساب الـ${config.entitySingle} "${user.name}"؟`,
      )
    ) {
      try {
        await deleteUser(user.id)
        await loadUsers()
        showToast('تم حذف المستخدم بنجاح')
      } catch (err) {
        console.error('Failed to delete user:', err)
        alert(`حدث خطأ أثناء حذف حساب الـ${config.entitySingle}`)
      }
    }
  }

  const handleViewUser = (user: UserRow) => {
    router.push(`/users/${user.id}`)
  }

  const handleAddUser = () => {
    setAddDialogOpen(true)
  }

  const handleSendNotification = (user: UserRow) => {
    setNotificationModalUser(user)
  }

  const handleChangePlan = (user: UserRow) => {
    setPlanModalUser(user)
  }

  const handleAddCoupon = (user: UserRow) => {
    setCouponModalUser(user)
  }

  const handlePlanSuccess = (userId: string, planName: string) => {
    setData((prev) => ({
      ...prev,
      data: prev.data.map((u) =>
        u.id === userId ? { ...u, subscriptionPlan: planName } : u,
      ),
    }))
    showToast('تم تغيير الباقة بنجاح.')
  }

  const handleNotificationSuccess = (_userId: string, title: string) => {
    showToast(`تم إرسال إشعار "${title}" للمستخدم بنجاح`)
  }

  const handleCouponSuccess = (userId: string) => {
    const targetUser =
      data.data.find((u) => u.id === userId) || couponModalUser
    const userName = targetUser?.name || 'المستخدم'
    showToast(`تم اضافة كوبون خصم للمستخدم “${userName}” بنجاح.`)
  }

  const handleResetPasswordSuccess = () => {
    showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريد المستخدم بنجاح.')
  }

  const handleSuspendConfirm = async (
    user: UserRow,
    _durationDays?: number,
    _reason?: string,
  ) => {
    try {
      await updateUserStatus(user.id, 'suspended')
      await loadUsers()
      showToast(`تم إيقاف حساب “${user.name || user.email}” بنجاح`)
    } catch (err) {
      console.error('Failed to suspend user:', err)
      showToast('حدث خطأ أثناء إيقاف الحساب')
    }
  }

  const handleReactivateConfirm = async (
    user: UserRow,
    _sendNotification: boolean,
  ) => {
    try {
      await updateUserStatus(user.id, 'active')
      await loadUsers()
      showToast(`تم إعادة تفعيل حساب “${user.name || user.email}” بنجاح`)
    } catch (err) {
      console.error('Failed to reactivate user:', err)
      showToast('حدث خطأ أثناء إعادة تفعيل الحساب')
    }
  }

  const handleBlockConfirm = async (
    user: UserRow,
    _reason?: string,
    _sendEmail?: boolean,
    _preventNewAccount?: boolean,
  ) => {
    try {
      await updateUserStatus(user.id, 'blocked')
      await loadUsers()
      showToast(`تم حظر حساب “${user.name || user.email}” بنجاح`)
    } catch (err) {
      console.error('Failed to block user:', err)
      showToast('حدث خطأ أثناء حظر الحساب')
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await exportUsersCsv({
        search: searchQuery,
        role: getRoleFromTab(activeTab),
        status: (statusFilter as any) || undefined,
        subscriptionPlan: subscriptionFilter || undefined,
        sortOrder: dateSort,
      })
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: 'text/csv;charset=utf-8;' }),
      )
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${config.title}-export.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      showToast('تم تصدير ملف البيانات بنجاح')
    } catch (err) {
      console.error('Export failed:', err)
      alert('حدث خطأ أثناء تصدير البيانات')
    } finally {
      setExporting(false)
    }
  }

  const modalsState: UserModalsState = {
    addDialogOpen,
    planModalUser,
    notificationModalUser,
    couponModalUser,
    suspendModalUser,
    reactivateModalUser,
    blockModalUser,
    resetPasswordModalUser,
    toastMessage,
  }

  const modalsHandlers: UserModalsHandlers = {
    setAddDialogOpen,
    setPlanModalUser,
    setNotificationModalUser,
    setCouponModalUser,
    setSuspendModalUser,
    setReactivateModalUser,
    setBlockModalUser,
    setResetPasswordModalUser,
    setToastMessage,
    onAddUserSuccess: () => {
      loadUsers()
      showToast('تم إنشاء الحساب وارسال البيانات للمستخدم بنجاح.')
    },
    onPlanSuccess: handlePlanSuccess,
    onNotificationSuccess: handleNotificationSuccess,
    onCouponSuccess: handleCouponSuccess,
    onResetPasswordSuccess: handleResetPasswordSuccess,
    onSuspendConfirm: handleSuspendConfirm,
    onReactivateConfirm: handleReactivateConfirm,
    onBlockConfirm: handleBlockConfirm,
  }

  return {
    config,
    data,
    loading,
    error,
    exporting,
    filters: {
      searchQuery,
      statusFilter,
      subscriptionFilter,
      dateSort,
      handleSearchChange,
      handleStatusFilterChange,
      handleSubscriptionFilterChange,
      handleDateSortToggle,
    },
    pagination: {
      currentPage,
      setCurrentPage,
      totalPages: data.meta.totalPages,
      totalItems: data.meta.total,
      currentCount: data.data.length,
    },
    modalsState,
    modalsHandlers,
    tableActions: {
      handleViewUser,
      handleStatusChange,
      handleDeleteUser,
      handleSendNotification,
      handleChangePlan,
      handleAddCoupon,
    },
    pageActions: {
      handleAddUser,
      handleExport,
      loadUsers,
      showToast,
    },
  }
}
