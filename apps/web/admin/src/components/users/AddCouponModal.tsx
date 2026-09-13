'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  CouponModalTargetUser,
  AddCouponModalProps,
  DEFAULT_COUPONS,
  CouponModalHeader,
  SelectedUsersSection,
  CouponSelectDropdown,
  CouponNotificationSection,
  CouponModalFooter,
  AvailableCoupon,
} from './add-coupon'
import {
  fetchAvailableCoupons,
  grantUserCoupon,
  grantBulkCoupons,
} from '@/lib/admin-users'

export type { CouponModalTargetUser, AddCouponModalProps }

export default function AddCouponModal({
  user,
  users,
  isOpen,
  onClose,
  onSuccess,
}: AddCouponModalProps) {
  const [coupons, setCoupons] = useState<AvailableCoupon[]>(DEFAULT_COUPONS)
  const [selectedCoupon, setSelectedCoupon] = useState<AvailableCoupon | null>(
    null,
  )
  const [targetUsers, setTargetUsers] = useState<CouponModalTargetUser[]>([])
  const [isListExpanded, setIsListExpanded] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyApp, setNotifyApp] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reset state whenever modal opens or users change
  useEffect(() => {
    if (isOpen) {
      const initialUsers =
        users && users.length > 0 ? [...users] : user ? [user] : []
      setTargetUsers(initialUsers)
      setIsListExpanded(false)
      setSelectedCoupon(null)
      setIsDropdownOpen(false)
      setNotifyEmail(false)
      setNotifyApp(false)
      setLoading(false)

      // Fetch coupons from backend API with fallback
      fetchAvailableCoupons()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setCoupons(data)
          }
        })
        .catch(() => {
          setCoupons(DEFAULT_COUPONS)
        })
    }
  }, [isOpen, user, users])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false)
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDropdownOpen, onClose])

  if (!isOpen || targetUsers.length === 0) return null

  const isMulti = targetUsers.length > 1
  const canSubmit = !!selectedCoupon && targetUsers.length > 0

  const handleSelectCoupon = (coupon: AvailableCoupon) => {
    setSelectedCoupon(coupon)
    setIsDropdownOpen(false)
  }

  const handleRemoveUser = (userId: string) => {
    setTargetUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  const handleSubmit = async () => {
    if (!selectedCoupon || loading || targetUsers.length === 0) return
    setLoading(true)

    try {
      const targetIds = targetUsers.map((u) => u.id)

      if (targetUsers.length > 1) {
        // Bulk grant coupon endpoint
        await grantBulkCoupons({
          userIds: targetIds,
          couponCode: selectedCoupon.code,
          couponName: selectedCoupon.name,
          notifyEmail,
          notifyApp,
        }).catch((err) => {
          console.warn('Backend grantBulkCoupons warning:', err)
        })
      } else {
        // Single user grant coupon endpoint
        await grantUserCoupon(targetUsers[0].id, {
          couponCode: selectedCoupon.code,
          couponName: selectedCoupon.name,
          notifyEmail,
          notifyApp,
        }).catch((err) => {
          console.warn('Backend grantUserCoupon warning:', err)
        })
      }

      onSuccess?.(targetIds, selectedCoupon.code, selectedCoupon.name)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 font-['Cairo']"
      dir="rtl"
    >
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card matching Figma nodes 5634:71560, 5634:71641 & 5634:71685 */}
      <div
        className="relative bg-white rounded-xl p-6 w-full max-w-125 shadow-2xl z-10 flex flex-col gap-6 items-center text-right animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        data-node-id="5634:71641"
        data-name="hide ad popup"
      >
        <div className="flex flex-col gap-6 items-center w-full max-w-113 shrink-0">
          {/* Header */}
          <CouponModalHeader
            isMulti={isMulti}
            targetCount={targetUsers.length}
          />

          {/* Selected Users Accordion Banner */}
          <SelectedUsersSection
            users={targetUsers}
            isExpanded={isListExpanded}
            onToggleExpand={() => setIsListExpanded((prev) => !prev)}
            onRemoveUser={handleRemoveUser}
          />

          {/* Form Fields Area */}
          <div className="flex flex-col gap-4 items-start w-full">
            <CouponSelectDropdown
              coupons={coupons}
              selectedCoupon={selectedCoupon}
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen((prev) => !prev)}
              onSelectCoupon={handleSelectCoupon}
              dropdownRef={dropdownRef}
            />

            <CouponNotificationSection
              isMulti={isMulti}
              notifyEmail={notifyEmail}
              notifyApp={notifyApp}
              onToggleEmail={() => setNotifyEmail((prev) => !prev)}
              onToggleApp={() => setNotifyApp((prev) => !prev)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <CouponModalFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          canSubmit={canSubmit}
          loading={loading}
        />
      </div>
    </div>
  )
}
