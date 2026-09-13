'use client'

import { Suspense } from 'react'
import { Download, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import UserTableFilters from '@/components/users/UserTableFilters'
import UserTable from '@/components/users/UserTable'
import UserPagination from '@/components/users/UserPagination'
import {
  useUsersPage,
  UserStatsGrid,
  UserModalsContainer,
} from '@/components/users/users-page'

function UsersPageContent() {
  const {
    config,
    data,
    loading,
    error,
    filters,
    pagination,
    modalsState,
    modalsHandlers,
    tableActions,
    pageActions,
  } = useUsersPage()

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Header */}
      <PageHeader
        breadcrumbs={config.breadcrumbs}
        title={config.title}
        subtitle={config.subtitle}
        primaryAction={{
          label: config.addLabel,
          onClick: pageActions.handleAddUser,
          icon: <Plus className="w-4 h-4 text-white" />,
        }}
        secondaryAction={{
          label: 'تصدير البيانات',
          onClick: pageActions.handleExport,
          icon: <Download className="w-4 h-4 text-[#111111]" />,
        }}
      />

      {/* Floating Action Modals and Success Toast */}
      <UserModalsContainer state={modalsState} handlers={modalsHandlers} />

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-['Cairo'] text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => pageActions.loadUsers()}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-semibold cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <UserStatsGrid
        totalTitle={config.totalStatTitle}
        stats={data.stats}
      />

      {/* Main Content Area */}
      <div className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-0 overflow-hidden shadow-xs">
        {/* Filter and Search Bar */}
        <UserTableFilters
          searchQuery={filters.searchQuery}
          onSearchChange={filters.handleSearchChange}
          selectedStatus={filters.statusFilter}
          onStatusChange={filters.handleStatusFilterChange}
          selectedSubscription={filters.subscriptionFilter}
          onSubscriptionChange={filters.handleSubscriptionFilterChange}
          dateSort={filters.dateSort}
          onDateSortToggle={filters.handleDateSortToggle}
        />

        {/* User Data Table with Figma Activity Dropdown */}
        <UserTable
          users={data.data}
          loading={loading}
          onViewUser={tableActions.handleViewUser}
          onStatusChange={tableActions.handleStatusChange}
          onDeleteUser={tableActions.handleDeleteUser}
          onSendNotification={tableActions.handleSendNotification}
          onChangePlan={tableActions.handleChangePlan}
          onAddCoupon={tableActions.handleAddCoupon}
          onSuspendUser={modalsHandlers.setSuspendModalUser}
          onReactivateUser={modalsHandlers.setReactivateModalUser}
          onBlockUser={modalsHandlers.setBlockModalUser}
          onResetPassword={modalsHandlers.setResetPasswordModalUser}
          userLabel={config.userLabel}
          entityName={config.entityName}
        />

        {/* Pagination Footer */}
        <UserPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          currentCount={pagination.currentCount}
          itemLabel={config.entitySingle}
          onPageChange={pagination.setCurrentPage}
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
