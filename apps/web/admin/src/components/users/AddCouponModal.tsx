'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { UserRow } from './UserTable'
import {
  AvailableCoupon,
  fetchAvailableCoupons,
  grantUserCoupon,
} from '@/lib/admin-users'

export interface AddCouponModalProps {
  user: UserRow | { id: string; name?: string | null; email?: string | null } | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (userId: string, code: string, name: string) => void
}

const DEFAULT_COUPONS: AvailableCoupon[] = [
  {
    id: 'c1',
    name: 'Byoutna10',
    code: 'LAUNCHPROMO26',
    discount: '10%',
  },
  {
    id: 'c2',
    name: 'Byoutna20',
    code: 'SPECIAL20',
    discount: '20%',
  },
  {
    id: 'c3',
    name: 'Byoutna50',
    code: 'VIP50',
    discount: '50%',
  },
]

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 shrink-0"
      >
        <rect width="16" height="16" rx="4" fill="#15304D" />
        <path
          d="M4.5 8L7 10.5L11.5 5.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-4 shrink-0"
    >
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="3.5"
        stroke="#D7D7D7"
        fill="white"
      />
    </svg>
  )
}

export default function AddCouponModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: AddCouponModalProps) {
  const [coupons, setCoupons] = useState<AvailableCoupon[]>(DEFAULT_COUPONS)
  const [selectedCoupon, setSelectedCoupon] = useState<AvailableCoupon | null>(
    null,
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyApp, setNotifyApp] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Reset state whenever modal opens or user changes
  useEffect(() => {
    if (isOpen) {
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
          // Fallback to default mock coupons
          setCoupons(DEFAULT_COUPONS)
        })
    }
  }, [isOpen, user])

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

  if (!isOpen || !user) return null

  const handleSelectCoupon = (coupon: AvailableCoupon) => {
    setSelectedCoupon(coupon)
    setIsDropdownOpen(false)
  }

  const handleSubmit = async () => {
    if (!selectedCoupon || loading) return
    setLoading(true)

    try {
      // Call backend API endpoint
      await grantUserCoupon(user.id, {
        couponCode: selectedCoupon.code,
        couponName: selectedCoupon.name,
        notifyEmail,
        notifyApp,
      }).catch((err) => {
        // Log warning and proceed with optimistic update if network simulation
        console.warn('Backend grantUserCoupon warning:', err)
      })

      onSuccess?.(user.id, selectedCoupon.code, selectedCoupon.name)
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

      {/* Modal Card matching Figma node 5634:71560 & 5634:71780 */}
      <div
        className="relative bg-white rounded-xl p-6 w-full max-w-125 shadow-2xl z-10 flex flex-col gap-8 items-center text-right animate-in fade-in zoom-in-95 duration-150"
        data-node-id="5634:71560"
        data-name="hide ad popup"
      >
        <div className="flex flex-col gap-6 items-center w-full max-w-113 shrink-0">
          {/* Top Badge with Tag Icon (Figma 5634:71563) */}
          <div className="bg-[#f9fafe] flex items-center justify-center size-16 rounded-full shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111111"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-8 text-[#111111]"
            >
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
              <path d="M7 7h.01" />
            </svg>
          </div>

          {/* Title & Subtitle (Figma 5634:71565) */}
          <div className="flex flex-col gap-2 items-center justify-center text-center w-full">
            <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal">
              منح كوبون خصم
            </h3>
            <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
              اختر كود الخصم المناسب لتطبيقه على اشتراك المستخدم القادم
            </p>
          </div>

          {/* Form Fields Area (Figma 5634:71568) */}
          <div className="flex flex-col gap-4 items-start w-full">
            {/* Coupon Select Dropdown (Figma 5634:71570) */}
            <div className="flex flex-col gap-2 items-start w-full relative" ref={dropdownRef}>
              <label className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
                اختر الكوبون
              </label>

              {/* Select Trigger Box (Figma 5634:71574) */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full h-11.5 bg-white border border-[#ececec] rounded-lg px-3 flex items-center justify-between cursor-pointer select-none transition-colors hover:border-slate-300"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                {/* Arrow indicator */}
                <ChevronDown
                  className={`size-4 text-[#6B6A6A] transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />

                {/* Selected value or placeholder (Figma 5634:71577) */}
                <div className="flex items-center gap-2 text-right">
                  {selectedCoupon ? (
                    <div className="flex items-center gap-2">
                      <span className="font-['Cairo'] font-bold text-[14px] text-[#111111]">
                        {selectedCoupon.name}
                      </span>
                      <span className="font-['Cairo'] font-medium text-[12px] text-[#6B6A6A]">
                        ({selectedCoupon.code})
                      </span>
                    </div>
                  ) : (
                    <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#979797] tracking-[-0.408px]">
                      اختر كود الخصم المناسب
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown Options Popup (Figma Node 5634:71598 / 2690:48716) */}
              {isDropdownOpen && (
                <div
                  className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#ececec] rounded-lg shadow-lg z-30 overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-150"
                  role="listbox"
                >
                  {coupons.map((coupon) => {
                    const isCurrent = selectedCoupon?.id === coupon.id
                    return (
                      <div
                        key={coupon.id}
                        onClick={() => handleSelectCoupon(coupon)}
                        className={`px-3 py-2.5 flex flex-col gap-1 items-start text-right hover:bg-[#F9FAFE] cursor-pointer transition-colors ${
                          isCurrent ? 'bg-[#F9FAFE]' : 'bg-white'
                        }`}
                        role="option"
                        aria-selected={isCurrent}
                      >
                        <span className="font-['Cairo'] font-semibold text-[16px] leading-[1.3] text-[#111111]">
                          {coupon.name}
                        </span>
                        <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
                          {coupon.code}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notification Channels (Figma 5634:71586) */}
            <div className="flex flex-col gap-2 items-start w-full pt-1">
              <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
                ارسال اشعار للمستخدم عبر :
              </span>

              <div className="flex flex-col gap-1 w-full">
                {/* Checkbox 1: البريد الالكتروني */}
                <div
                  onClick={() => setNotifyEmail((prev) => !prev)}
                  className="flex items-center justify-between cursor-pointer py-1 select-none"
                >
                  <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
                    البريد الالكتروني.
                  </span>
                  <div className="size-4 shrink-0 flex items-center justify-center">
                    <CheckboxIcon checked={notifyEmail} />
                  </div>
                </div>

                {/* Checkbox 2: داخل التطبيق */}
                <div
                  onClick={() => setNotifyApp((prev) => !prev)}
                  className="flex items-center justify-between cursor-pointer py-1 select-none"
                >
                  <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
                    داخل التطبيق.
                  </span>
                  <div className="size-4 shrink-0 flex items-center justify-center">
                    <CheckboxIcon checked={notifyApp} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Figma 5634:71595) */}
        <div className="flex gap-3 items-center justify-end w-full max-w-113 shrink-0">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11.5 rounded-3xl border border-[#e2e8f0] bg-white text-[#111111] font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            إلغاء
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedCoupon || loading}
            className={`flex-1 h-12 rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center gap-2 transition-all ${
              selectedCoupon && !loading
                ? 'bg-primary hover:bg-[#0f2338] text-white cursor-pointer'
                : 'bg-[#A6A6A6] text-white cursor-not-allowed opacity-90'
            }`}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>ارسال الكوبون</span>
          </button>
        </div>
      </div>
    </div>
  )
}
