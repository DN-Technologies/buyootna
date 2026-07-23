'use client'

import React, { useState } from 'react'
import { Download, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import UserTabs, { UserCategoryTab } from '@/components/users/UserTabs'
import UserTableFilters from '@/components/users/UserTableFilters'
import UserTable, { UserRow } from '@/components/users/UserTable'
import UserPagination from '@/components/users/UserPagination'

const INITIAL_USERS: UserRow[] = [
  {
    id: '1',
    name: 'أحمد سعيد',
    email: 'Ahmed@gmail.com',
    accountType: 'فرد',
    verificationStatus: '—',
    subscriptionPlan: 'الفضية',
    accountStatus: 'محظور',
    registrationDate: '5 ابريل 2026',
  },
  {
    id: '2',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    verificationStatus: 'غير موثق',
    subscriptionPlan: 'السنوية',
    accountStatus: 'نشط',
    registrationDate: 'منذ ساعتين',
  },
  {
    id: '3',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    verificationStatus: 'موثق',
    subscriptionPlan: 'الفضية',
    accountStatus: 'نشط',
    registrationDate: 'منذ ساعتين',
  },
  {
    id: '4',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    verificationStatus: 'قيد الانتظار',
    subscriptionPlan: 'الفضية',
    accountStatus: 'نشط',
    registrationDate: 'منذ ساعتين',
  },
  {
    id: '5',
    name: 'دار العقار الحديث',
    email: 'dar@gmail.com',
    accountType: 'شركة',
    verificationStatus: 'غير موثق',
    subscriptionPlan: 'الفضية',
    accountStatus: 'نشط',
    registrationDate: 'منذ ساعتين',
  },
  {
    id: '6',
    name: 'أحمد سعيد',
    email: 'Ahmed@gmail.com',
    accountType: 'فرد',
    verificationStatus: '—',
    subscriptionPlan: 'الفضية',
    accountStatus: 'نشط',
    registrationDate: '5 ابريل 2026',
  },
  {
    id: '7',
    name: 'أحمد سعيد',
    email: 'Ahmed@gmail.com',
    accountType: 'فرد',
    verificationStatus: '—',
    subscriptionPlan: 'العادية',
    accountStatus: 'نشط',
    registrationDate: 'منذ ساعتين',
  },
  {
    id: '8',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    verificationStatus: 'قيد الانتظار',
    subscriptionPlan: 'العادية',
    accountStatus: 'موقوف',
    registrationDate: '5 ابريل 2026',
  },
  {
    id: '9',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    verificationStatus: 'موثق',
    subscriptionPlan: 'الذهبية',
    accountStatus: 'موقوف',
    registrationDate: '5 ابريل 2026',
  },
  {
    id: '10',
    name: 'المنار',
    email: 'almanar@gmail.com',
    accountType: 'مكتب عقاري',
    verificationStatus: 'موثق',
    subscriptionPlan: 'الذهبية',
    accountStatus: 'موقوف',
    registrationDate: '5 ابريل 2026',
  },
]

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<UserCategoryTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const handleAddUser = () => {
    alert('إضافة مستخدم جديد')
  }

  const handleExport = () => {
    alert('جاري تصدير بيانات إدارة المستخدمين...')
  }

  // Filter logic based on active tab and search query
  const filteredUsers = INITIAL_USERS.filter((user) => {
    // Tab filter
    if (activeTab === 'individual' && user.accountType !== 'فرد') return false
    if (activeTab === 'office' && user.accountType !== 'مكتب عقاري') return false
    if (activeTab === 'company' && user.accountType !== 'شركة') return false

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = user.name.toLowerCase().includes(q)
      const matchEmail = user.email.toLowerCase().includes(q)
      return matchName || matchEmail
    }

    return true
  })

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

      {/* Statistics Cards Grid matching Figma Node 2558-88544 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
          count={500}
          change="8.1%"
          trend="up"
          variant="green"
        />
        <StatCard
          title="نشط"
          count={100}
          change="8.1%"
          trend="up"
          variant="green"
        />
        <StatCard
          title="محظور"
          count={10}
          change="3.2%"
          trend="down"
          variant="red"
        />
        <StatCard
          title="موقوف"
          count={10}
          change="3.2%"
          trend="down"
          variant="orange"
        />
      </div>

      {/* Main Content Area matching Figma Node 2373-3533 */}
      <div className="bg-white border border-[#ECECEC] rounded-[8px] flex flex-col gap-0 overflow-hidden">
        {/* Category Tabs */}
        <UserTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Filter and Search Bar */}
        <UserTableFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* User Data Table */}
        <UserTable
          users={filteredUsers}
          onViewUser={(user) => alert(`عرض بيانات المستخدم: ${user.name}`)}
          onActionClick={(user) => alert(`خيارات المستخدم: ${user.name}`)}
        />

        {/* Pagination Footer */}
        <UserPagination
          currentPage={currentPage}
          totalPages={3}
          totalItems={100}
          currentCount={filteredUsers.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

