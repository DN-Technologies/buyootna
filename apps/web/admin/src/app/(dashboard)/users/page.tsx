'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import { UserCategoryTab } from '@/components/users/UserTabs'
import UserTableFilters from '@/components/users/UserTableFilters'
import UserTable, { UserRow } from '@/components/users/UserTable'
import UserPagination from '@/components/users/UserPagination'
import AddIndividualDialog from '@/components/users/AddIndividualDialog'
import {
  fetchAdminUsers,
  updateUserStatus,
  deleteUser,
  exportUsersCsv,
  AdminUsersResponse,
} from '@/lib/admin-users'

function UsersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as UserCategoryTab | null

  const activeTab = useMemo<UserCategoryTab>(() => {
    if (typeParam && ['individual', 'office', 'company'].includes(typeParam)) {
      return typeParam
    }
    return 'individual'
  }, [typeParam])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [dateSort, setDateSort] = useState<'asc' | 'desc' | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [data, setData] = useState<AdminUsersResponse>({
    data: [],
    meta: { total: 0, currentPage: 1, limit: 10, totalPages: 1 },
    stats: { total: 0, active: 0, blocked: 0, suspended: 0 },
    counts: { all: 0, individual: 0, office: 0, company: 0 },
  })

  // Dynamic terminology mapping based on active category
  const config = useMemo(() => {
    switch (activeTab) {
      case 'company':
        return {
          title: 'الشركات',
          subtitle: 'إدارة جميع حسابات الشركات والمطورين العقاريين، ومتابعة الاشتراكات والحالة والنشاط.',
          breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'الشركات'],
          addLabel: 'إضافة شركة',
          totalStatTitle: 'إجمالي الشركات',
          userLabel: 'اسم الشركة',
          entityName: 'شركات',
          entitySingle: 'شركة',
        }
      case 'office':
        return {
          title: 'المكاتب العقارية',
          subtitle: 'إدارة جميع حسابات المكاتب والوسطاء العقاريين، ومتابعة الاشتراكات والحالة والنشاط.',
          breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'المكاتب العقارية'],
          addLabel: 'إضافة مكتب عقاري',
          totalStatTitle: 'إجمالي المكاتب',
          userLabel: 'اسم المكتب',
          entityName: 'مكاتب',
          entitySingle: 'مكتب عقاري',
        }
      case 'individual':
      default:
        return {
          title: 'الأفراد',
          subtitle: 'إدارة جميع حسابات الأفراد، ومتابعة الاشتراكات والحالة والنشاط.',
          breadcrumbs: ['الرئيسية', 'إدارة الحسابات', 'الأفراد'],
          addLabel: 'إضافة فرد',
          totalStatTitle: 'إجمالي الأفراد',
          userLabel: 'اسم الفرد',
          entityName: 'أفراد',
          entitySingle: 'فرد',
        }
    }
  }, [activeTab])

  // Map category tab to Prisma Role enum string
  const getRoleFromTab = (tab: UserCategoryTab) => {
    if (tab === 'individual') return 'INDIVIDUAL'
    if (tab === 'office') return 'OFFICE'
    if (tab === 'company') return 'COMPANY'
    return undefined
  }

  const [error, setError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

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

      // Backend now provides accurate adsCount per user
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
        setError('مسار نقطة النهاية غير موجود (404). يرجى التأكد من تشغيل خادم الخلفية (http://localhost:8000).')
      } else {
        setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم الخلفية.')
      }
    } finally {
      setLoading(false)
    }
  }, [searchQuery, activeTab, statusFilter, subscriptionFilter, dateSort, currentPage])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle Search Change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  // Handle Status Filter Change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  // Handle Subscription Plan Filter Change
  const handleSubscriptionFilterChange = (plan: string) => {
    setSubscriptionFilter(plan)
    setCurrentPage(1)
  }

  // Handle Date Sort Toggle
  const handleDateSortToggle = () => {
    setDateSort((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // Handle Action Status Change (Active / Suspended / Blocked)
  const handleStatusChange = async (
    user: UserRow,
    newStatus: 'active' | 'blocked' | 'suspended',
  ) => {
    try {
      await updateUserStatus(user.id, newStatus)
      await loadUsers()
    } catch (err) {
      console.error('Failed to update status:', err)
      alert(`حدث خطأ أثناء تحديث حالة حساب الـ${config.entitySingle}`)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async (user: UserRow) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف حساب الـ${config.entitySingle} "${user.name}"؟`)) {
      try {
        await deleteUser(user.id)
        await loadUsers()
      } catch (err) {
        console.error('Failed to delete user:', err)
        alert(`حدث خطأ أثناء حذف حساب الـ${config.entitySingle}`)
      }
    }
  }

  // Handle View User Details
  const handleViewUser = (user: UserRow) => {
    router.push(`/users/${user.id}`)
  }

  const handleAddUser = () => {
    setAddDialogOpen(true)
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
    } catch (err) {
      console.error('Export failed:', err)
      alert('حدث خطأ أثناء تصدير البيانات')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Header matching Figma Node 5634:68341 */}
      <PageHeader
        breadcrumbs={config.breadcrumbs}
        title={config.title}
        subtitle={config.subtitle}
        primaryAction={{
          label: config.addLabel,
          onClick: handleAddUser,
          icon: <Plus className="w-4 h-4 text-white" />,
        }}
        secondaryAction={{
          label: 'تصدير البيانات',
          onClick: handleExport,
          icon: <Download className="w-4 h-4 text-[#111111]" />,
        }}
      />

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-['Cairo'] text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadUsers()}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-semibold cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Statistics Cards Grid matching Figma Node 5634:68353 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={config.totalStatTitle}
          count={data.stats.total}
          change="8.1%"
          trend="up"
          variant="green"
        />
        <StatCard
          title="نشط"
          count={data.stats.active}
          change="8.1%"
          trend="up"
          variant="green"
        />
        <StatCard
          title="محظور"
          count={data.stats.blocked}
          change="3.2%"
          trend="down"
          variant="red"
        />
        <StatCard
          title="موقوف"
          count={data.stats.suspended}
          change="3.2%"
          trend="down"
          variant="orange"
        />
      </div>

      {/* Main Content Area matching Figma Node 5634:68425 */}
      <div className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-0 overflow-hidden shadow-xs">
        {/* Filter and Search Bar */}
        <UserTableFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedStatus={statusFilter}
          onStatusChange={handleStatusFilterChange}
          selectedSubscription={subscriptionFilter}
          onSubscriptionChange={handleSubscriptionFilterChange}
          dateSort={dateSort}
          onDateSortToggle={handleDateSortToggle}
        />

        {/* User Data Table */}
        <UserTable
          users={data.data}
          loading={loading}
          onViewUser={handleViewUser}
          onStatusChange={handleStatusChange}
          onDeleteUser={handleDeleteUser}
          userLabel={config.userLabel}
          entityName={config.entityName}
        />

        {/* Pagination Footer */}
        <UserPagination
          currentPage={data.meta.currentPage}
          totalPages={data.meta.totalPages}
          totalItems={data.meta.total}
          currentCount={data.data.length}
          itemLabel={config.entitySingle}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Individual Modal Dialog */}
      <AddIndividualDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={() => loadUsers()}
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 text-right" dir="rtl">
          <PageHeader
            breadcrumbs={['الرئيسية', 'إدارة الحسابات', 'الأفراد']}
            title="الأفراد"
            subtitle="إدارة جميع حسابات الأفراد، ومتابعة الاشتراكات والحالة والنشاط."
          />
        </div>
      }
    >
      <UsersPageContent />
    </Suspense>
  )
}

