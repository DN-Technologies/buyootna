'use client'

import { useRouter } from 'next/navigation'
import {
  useVerificationRequests,
  VerificationHeader,
  VerificationToolbar,
  VerificationTable,
  VerificationModals,
} from '@/components/verifications'

export default function VerificationRequestsPage() {
  const router = useRouter()
  const {
    tab,
    filters,
    selection,
    filteredRows,
    loading,
    counts,
    stats,
    pagination,
    review,
    modals,
    toast,
    bulk,
  } = useVerificationRequests()

  return (
    <div className="space-y-5 text-right pb-10 select-none" dir="rtl">
      {/* Modals, Drawers & Toast Notifications */}
      <VerificationModals
        reviewDrawerOpen={review.reviewDrawerOpen}
        onCloseReviewDrawer={() => review.setReviewDrawerOpen(false)}
        selectedForReview={review.selectedForReview}
        onApproveClick={review.handleApproveClick}
        onRejectClick={review.handleRejectClick}
        onRequestEditClick={review.handleRequestEditClick}
        confirmModalOpen={modals.confirmModalOpen}
        onCloseConfirmModal={() => modals.setConfirmModalOpen(false)}
        onConfirmApprove={modals.handleConfirmApprove}
        rejectModalOpen={modals.rejectModalOpen}
        onCloseRejectModal={() => modals.setRejectModalOpen(false)}
        onConfirmReject={modals.handleConfirmReject}
        requestEditModalOpen={modals.requestEditModalOpen}
        onCloseRequestEditModal={() => modals.setRequestEditModalOpen(false)}
        onConfirmRequestEdit={modals.handleConfirmRequestEdit}
        isSubmitting={modals.isSubmitting}
        showToast={toast.showToast}
        toastMessage={toast.toastMessage}
        onCloseToast={() => toast.setShowToast(false)}
        onUndoVerification={
          toast.lastVerifiedId ? toast.handleUndoVerification : undefined
        }
      />

      {/* Breadcrumbs, Title, Export, Metrics & Tabs */}
      <VerificationHeader
        activeTab={tab.activeTab}
        onTabChange={tab.setActiveTab}
        onExport={bulk.handleBulkExport}
        onBack={() => router.back()}
        counts={counts}
        stats={stats}
      />

      {/* Search, Filter Toolbar & Bulk Actions Bar */}
      <VerificationToolbar
        searchQuery={filters.searchQuery}
        onSearchChange={filters.setSearchQuery}
        statusFilter={filters.statusFilter}
        onStatusFilterChange={filters.setStatusFilter}
        showStatusMenu={filters.showStatusMenu}
        onToggleStatusMenu={() => {
          filters.setShowStatusMenu(!filters.showStatusMenu)
          filters.setShowSortMenu(false)
        }}
        onCloseStatusMenu={() => filters.setShowStatusMenu(false)}
        sortBy={filters.sortBy}
        onSortByChange={filters.setSortBy}
        showSortMenu={filters.showSortMenu}
        onToggleSortMenu={() => {
          filters.setShowSortMenu(!filters.showSortMenu)
          filters.setShowStatusMenu(false)
        }}
        onCloseSortMenu={() => filters.setShowSortMenu(false)}
        selectedCount={selection.selectedIds.length}
        onBulkBlock={bulk.handleBulkBlock}
        onBulkSuspend={bulk.handleBulkSuspend}
        onBulkExport={bulk.handleBulkExport}
        onBulkNotify={bulk.handleBulkNotify}
        onClearSelection={selection.handleClearSelection}
      />

      {/* Main Data Table & Pagination */}
      <VerificationTable
        rows={filteredRows}
        selectedIds={selection.selectedIds}
        onToggleSelectAll={selection.handleToggleSelectAll}
        onToggleSelectRow={selection.handleToggleSelectRow}
        onOpenReview={review.handleOpenReview}
        pagination={pagination}
        onPageChange={pagination.setCurrentPage}
        loading={loading}
      />
    </div>
  )
}
