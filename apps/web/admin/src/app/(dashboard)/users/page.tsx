'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Download, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import UserTabs, { UserCategoryTab } from '@/components/users/UserTabs'
import UserTableFilters from '@/components/users/UserTableFilters'
import UserTable, { UserRow } from '@/components/users/UserTable'
import UserPagination from '@/components/users/UserPagination'
import {
  fetchAdminUsers,
  updateUserStatus,
  deleteUser,
  AdminUsersResponse,
} from '@/lib/admin-users'

function UsersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as UserCategoryTab | null

  const [activeTab, setActiveTab] = useState<UserCategoryTab>(() => {
    if (typeParam && ['individual', 'office', 'company', 'all'].includes(typeParam)) {
      return typeParam
    }
    return 'all'
  })

  // Synchronize activeTab when query parameter in URL changes
  useEffect(() => {
    if (typeParam && ['individual', 'office', 'company', 'all'].includes(typeParam)) {
      setActiveTab(typeParam)
    } else if (!typeParam) {
      setActiveTab('all')
    }
  }, [typeParam])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [data, setData] = useState<AdminUsersResponse>({
    data: [],
    meta: { total: 0, currentPage: 1, limit: 10, totalPages: 1 },
    stats: { total: 0, active: 0, blocked: 0, suspended: 0 },
    counts: { all: 0, individual: 0, office: 0, company: 0 },
  })

  // Map category tab to Prisma Role enum string
  const getRoleFromTab = (tab: UserCategoryTab) => {
    if (tab === 'individual') return 'INDIVIDUAL'
    if (tab === 'office') return 'OFFICE'
    if (tab === 'company') return 'COMPANY'
    return undefined
  }

  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchAdminUsers({
        search: searchQuery,
        role: getRoleFromTab(activeTab),
        status: (statusFilter as any) || undefined,
        page: currentPage,
        limit: 10,
      })
      setData(res)
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
  }, [searchQuery, activeTab, statusFilter, currentPage])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  // Handle Tab Change
  const handleTabChange = (tab: UserCategoryTab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    if (tab === 'all') {
      router.push('/users')
    } else {
      router.push(`/users?type=${tab}`)
    }
  }

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
      alert('حدث خطأ أثناء تحديث حالة الحساب')
    }
  }

  // Handle Delete User
  const handleDeleteUser = async (user: UserRow) => {
    if (confirm(`هل أنت تأكد من رغبتك في حذف حساب "${user.name}"؟`)) {
      try {
        await deleteUser(user.id)
        await loadUsers()
      } catch (err) {
        console.error('Failed to delete user:', err)
        alert('حدث خطأ أثناء حذف الحساب')
      }
    }
  }

  // Handle View User Details
  const handleViewUser = (user: UserRow) => {
    router.push(`/users/${user.id}`)
  }

  const handleAddUser = () => {
    alert('إضافة مستخدم جديد')
  }

  const handleExport = () => {
    alert('جاري تصدير بيانات إدارة المستخدمين...')
  }

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Header matching Figma Node 2558-88544 */}
      <PageHeader
        breadcrumbs={['الرئيسية', 'إدارة الحسابات', 'المستخدمون']}
        title="المستخدمون"
        subtitle="إدارة جميع حسابات المنصة، ومتابعة الاشتراكات والحالة والنشاط."
        primaryAction={{
          label: 'اضافة مستخدم',
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

      {/* Statistics Cards Grid matching Figma Node 2558-88544 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
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

      {/* Main Content Area matching Figma Node 2373-3533 */}
      <div className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-0 overflow-hidden">
        {/* Category Tabs */}
        <UserTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={data.counts}
        />

        {/* Filter and Search Bar */}
        <UserTableFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedStatus={statusFilter}
          onStatusChange={handleStatusFilterChange}
        />

        {/* User Data Table */}
        <UserTable
          users={data.data}
          loading={loading}
          onViewUser={handleViewUser}
          onStatusChange={handleStatusChange}
          onDeleteUser={handleDeleteUser}
        />

        {/* Pagination Footer */}
        <UserPagination
          currentPage={data.meta.currentPage}
          totalPages={data.meta.totalPages}
          totalItems={data.meta.total}
          currentCount={data.data.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 text-right" dir="rtl">
          <PageHeader
            breadcrumbs={['الرئيسية', 'إدارة الحسابات', 'المستخدمون']}
            title="إدارة الحسابات والمستخدمين"
            subtitle="عرض وتحليل وإدارة حسابات الأفراد، الشركات، والمكاتب العقارية المسجلة."
          />
        </div>
      }
    >
      <UsersPageContent />
    </Suspense>
  )
}
