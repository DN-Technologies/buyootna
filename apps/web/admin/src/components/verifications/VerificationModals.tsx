'use client'

import React from 'react'
import { AdminDashboardPendingVerification } from '@/lib/admin-dashboard'
import ReviewVerificationDrawer from '@/components/dashboard/ReviewVerificationDrawer'
import ConfirmVerificationModal from '@/components/dashboard/ConfirmVerificationModal'
import RejectVerificationModal from '@/components/dashboard/RejectVerificationModal'
import RequestEditModal from '@/components/dashboard/RequestEditModal'
import VerificationSuccessToast from '@/components/dashboard/VerificationSuccessToast'

interface VerificationModalsProps {
  reviewDrawerOpen: boolean
  onCloseReviewDrawer: () => void
  selectedForReview: AdminDashboardPendingVerification | null
  onApproveClick: () => void
  onRejectClick: () => void
  onRequestEditClick: () => void

  confirmModalOpen: boolean
  onCloseConfirmModal: () => void
  onConfirmApprove: (options: {
    notifyEmail: boolean
    notifyInApp: boolean
  }) => void

  rejectModalOpen: boolean
  onCloseRejectModal: () => void
  onConfirmReject: (options: {
    reason: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => void

  requestEditModalOpen: boolean
  onCloseRequestEditModal: () => void
  onConfirmRequestEdit: (options: {
    notes: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => void

  isSubmitting: boolean

  showToast: boolean
  toastMessage: string
  onCloseToast: () => void
  onUndoVerification?: () => void
}

export default function VerificationModals({
  reviewDrawerOpen,
  onCloseReviewDrawer,
  selectedForReview,
  onApproveClick,
  onRejectClick,
  onRequestEditClick,
  confirmModalOpen,
  onCloseConfirmModal,
  onConfirmApprove,
  rejectModalOpen,
  onCloseRejectModal,
  onConfirmReject,
  requestEditModalOpen,
  onCloseRequestEditModal,
  onConfirmRequestEdit,
  isSubmitting,
  showToast,
  toastMessage,
  onCloseToast,
  onUndoVerification,
}: VerificationModalsProps) {
  return (
    <>
      {/* Toast Notification */}
      <VerificationSuccessToast
        show={showToast}
        message={toastMessage}
        onUndo={onUndoVerification}
        onClose={onCloseToast}
        autoHideDuration={6000}
      />

      {/* Verification Drawer */}
      <ReviewVerificationDrawer
        isOpen={reviewDrawerOpen}
        onClose={onCloseReviewDrawer}
        request={selectedForReview}
        onApprove={onApproveClick}
        onReject={onRejectClick}
        onRequestEdit={onRequestEditClick}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmVerificationModal
        isOpen={confirmModalOpen}
        onClose={onCloseConfirmModal}
        onConfirm={onConfirmApprove}
        isLoading={isSubmitting}
      />

      {/* Reject Confirmation Modal */}
      <RejectVerificationModal
        isOpen={rejectModalOpen}
        onClose={onCloseRejectModal}
        onConfirm={onConfirmReject}
        isLoading={isSubmitting}
      />

      {/* Request Edit Modal */}
      <RequestEditModal
        isOpen={requestEditModalOpen}
        onClose={onCloseRequestEditModal}
        onConfirm={onConfirmRequestEdit}
        isLoading={isSubmitting}
      />
    </>
  )
}
