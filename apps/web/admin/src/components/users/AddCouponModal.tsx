'use client'

import React, { useState } from 'react'
import { X, Tag, Check } from 'lucide-react'
import { UserRow } from './UserTable'

interface AddCouponModalProps {
  user: UserRow | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (userId: string, code: string, discount: string) => void
}

export default function AddCouponModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: AddCouponModalProps) {
  const [couponCode, setCouponCode] = useState('BYT-')
  const [discountValue, setDiscountValue] = useState('20%')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    setLoading(true)
    setTimeout(() => {
      onSuccess(user.id, couponCode, discountValue)
      setLoading(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#ECECEC] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECECEC]">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111]">
              إضافة كوبون خصم
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B6A6A] hover:bg-[#F8FAFC] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-['Cairo']">
          {/* User Info Snippet */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#ECECEC] text-right">
            <p className="font-semibold text-[14px] text-[#111111]">المستخدم: {user.name}</p>
            <p className="text-[12px] text-[#6B6A6A] mt-0.5">{user.email}</p>
          </div>

          {/* Coupon Code Input */}
          <div className="space-y-1 text-right">
            <label className="block text-[13px] font-semibold text-[#111111]">
              رمز الكوبون
            </label>
            <input
              type="text"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="مثال: SUMMER2026"
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-[14px] outline-none focus:border-primary transition-colors text-right font-mono"
            />
          </div>

          {/* Discount Value */}
          <div className="space-y-1 text-right">
            <label className="block text-[13px] font-semibold text-[#111111]">
              قيمة الخصم
            </label>
            <select
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#E2E8F0] text-[14px] outline-none focus:border-primary transition-colors text-right bg-white cursor-pointer"
            >
              <option value="10%">خصم 10%</option>
              <option value="20%">خصم 20%</option>
              <option value="30%">خصم 30%</option>
              <option value="50%">خصم 50%</option>
              <option value="100%">مجاني بالكامل (100%)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#ECECEC]">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-[#10243B] text-white py-2.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'جاري التطبيق...' : 'تطبيق الكوبون'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#111111] font-medium text-[14px] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
