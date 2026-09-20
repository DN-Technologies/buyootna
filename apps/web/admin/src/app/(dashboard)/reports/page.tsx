'use client'

import React from 'react'
import {
  ReportsHeader,
  ReportsToolbar,
  ReportsTable,
  ReportReviewDrawer,
  ConfirmResolveModal,
  useReportsPage,
} from '@/components/reports'
import { ToastSuccessRosetteIcon } from '@/components/icons/AdminIcons'

export default function ReportsPage() {
  const {
    reports,
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
    handleBulkResolve,
    isConfirmModalOpen,
    resolveModalCount,
    handleCloseConfirmModal,
    handleConfirmResolution,
    handleResolveReport,
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
  } = useReportsPage()

  return (
    <div className="space-y-6 text-right pb-10 select-none" dir="rtl">
      {/* Toast Notification (Figma Node 4940:87791) */}
      {toastMessage && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#15A72B] rounded-[8px] px-4 py-2.5 shadow-[0px_2px_1px_rgba(33,37,41,0.06),0px_0px_0.5px_rgba(33,37,41,0.08)] flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200"
          data-node-id="4940:87791"
          data-name="mess"
        >
          <ToastSuccessRosetteIcon className="size-6 shrink-0" />
          <span className="font-['Cairo'] font-semibold text-[14px] text-[#111111] tracking-[0.28px]">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#6B6A6A] hover:text-[#111111] mr-1 text-xs cursor-pointer p-1"
            aria-label="إغلاق الإشعار"
          >
            ✕
          </button>
        </div>
      )}

      {/* Review Slide-over Drawer */}
      <ReportReviewDrawer
        report={selectedReport}
        isOpen={isDrawerOpen}
        onClose={handleCloseReview}
        onResolve={handleResolveReport}
        onDismiss={handleDismissReport}
      />

      {/* Confirm Resolve Reports Modal (Figma Node 4940:87775 for single, 4881:16818 for bulk) */}
      <ConfirmResolveModal
        isOpen={isConfirmModalOpen}
        count={resolveModalCount}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmResolution}
      />

      {/* Page Header (Breadcrumbs, Title, 3 Stat Cards) */}
      <ReportsHeader stats={stats} />

      {/* Toolbar (Search pill, filters popover, bulk actions) */}
      <ReportsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        selectedCount={selectedIds.length}
        onBulkResolve={handleBulkResolve}
        onClearSelection={clearSelection}
      />

      {/* Main Reports Table */}
      <ReportsTable
        reports={reports}
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectRow={toggleSelectRow}
        onOpenReview={handleOpenReview}
        pagination={pagination}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
