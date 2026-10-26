'use client'

import { Suspense } from 'react'
import { Download, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import UserTableFilters from '@/components/users/UserTableFilters'
import SelectedUsersActions from '@/components/users/SelectedUsersActions'
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
    selection,
    pagination,
    modalsState,
    modalsHandlers,
    tableActions,
    pageActions,
  } = useUsersPage()

  return (
    <div className="space-y-6 text-right pb-10" dir="rtl">
      {/* Header matching Figma 5634:69044 */}
      <PageHeader
        breadcrumbs={config.breadcrumbs.slice(1)}
        title={config.title}
        subtitle={config.subtitle}
        primaryAction={{
          label: 'اضافة مستخدم',
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

      {/* Statistics Cards Grid matching Figma 5634:69056 */}
      <UserStatsGrid totalTitle="إجمالي المستخدمين" stats={data.stats} />

      {/* Main Content Area matching Figma 5634:69158 */}
      <div className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-0 overflow-hidden shadow-xs">
        {/* Filter and Search Bar matching Figma 5634:69126 */}
        <UserTableFilters
          searchQuery={filters.searchQuery}
          onSearchChange={filters.handleSearchChange}
          selectedType={filters.selectedType}
          onTypeChange={filters.handleTypeFilterChange}
          selectedStatus={filters.statusFilter}
          onStatusChange={filters.handleStatusFilterChange}
          selectedSubscription={filters.subscriptionFilter}
          onSubscriptionChange={filters.handleSubscriptionFilterChange}
          dateSort={filters.dateSort}
          onDateSortToggle={filters.handleDateSortToggle}
        />

        {/* Selected Users Bulk Action Toolbar matching Figma 2376:74201 / 5634:69044 */}
        <SelectedUsersActions
          selectedCount={selection.selectedIds.length}
          onClearSelection={selection.handleClearSelection}
          onBulkNotification={selection.handleBulkNotification}
          onBulkExport={selection.handleBulkExport}
          onBulkSuspend={selection.handleBulkSuspend}
          onBulkBlock={selection.handleBulkBlock}
        />

        {/* User Data Table with Figma Activity Dropdown & Multi-selection */}
        <UserTable
          users={data.data}
          selectedIds={selection.selectedIds}
          onSelectRow={selection.handleToggleSelectRow}
          onSelectAll={selection.handleToggleSelectAll}
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
          userLabel="اسم المستخدم"
          entityName="مستخدمين"
        />

        {/* Pagination Footer matching Figma 5634:69405 */}
        <UserPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          currentCount={pagination.currentCount}
          itemLabel="مستخدم"
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
            breadcrumbs={['إدارة الحسابات', 'الأفراد']}
            title="المستخدمون"
            subtitle="إدارة جميع حسابات المنصة، ومتابعة الاشتراكات والحالة والنشاط."
          />
        </div>
      }
    >
      <UsersPageContent />
    </Suspense>
  )
}
