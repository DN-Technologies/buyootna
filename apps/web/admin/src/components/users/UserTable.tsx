'use client'

import React, { useState } from 'react'
import { Eye, MoreVertical } from 'lucide-react'

export interface UserRow {
  id: string
  name: string
  email: string
  accountType: 'فرد' | 'شركة' | 'مكتب عقاري'
  verificationStatus: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—'
  subscriptionPlan: 'الفضية' | 'السنوية' | 'العادية' | 'الذهبية'
  accountStatus: 'نشط' | 'محظور' | 'موقوف'
  registrationDate: string
}

interface UserTableProps {
  users: UserRow[]
  onViewUser?: (user: UserRow) => void
  onActionClick?: (user: UserRow) => void
}

export default function UserTable({
  users,
  onViewUser,
  onActionClick,
}: UserTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(users.map((u) => u.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const renderVerificationBadge = (status: UserRow['verificationStatus']) => {
    if (status === '—') return <span className="text-[#A0A0A0]">—</span>

    if (status === 'موثق') {
      return (
        <span className="flex items-center justify-end gap-1.5 text-[#007AFF] font-medium text-[12px]">
          <span>موثق</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
        </span>
      )
    }

    if (status === 'قيد الانتظار') {
      return (
        <span className="flex items-center justify-end gap-1.5 text-[#D97706] font-medium text-[12px]">
          <span>قيد الانتظار</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
        </span>
      )
    }

    return (
      <span className="flex items-center justify-end gap-1.5 text-[#6B6A6A] font-medium text-[12px]">
        <span>غير موثق</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
      </span>
    )
  }

  const renderSubscriptionBadge = (plan: UserRow['subscriptionPlan']) => {
    const styles = {
      الفضية: 'bg-[#F1F5F9] text-[#334155]',
      السنوية: 'bg-[#FEF9C3] text-[#854D0E]',
      العادية: 'bg-[#F8FAFC] text-[#64748B]',
      الذهبية: 'bg-[#FEF3C7] text-[#B45309]',
    }

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
          styles[plan] || 'bg-[#F1F5F9] text-[#334155]'
        }`}
      >
        {plan}
      </span>
    )
  }

  const renderStatusBadge = (status: UserRow['accountStatus']) => {
    if (status === 'نشط') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
          نشط
        </span>
      )
    }

    if (status === 'محظور') {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3F2] text-[#9C1E28] text-[12px] font-medium">
          محظور
        </span>
      )
    }

    return (
      <span className="px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] text-[12px] font-medium">
        موقوف
      </span>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-white border border-[#ECECEC] rounded-lg font-['Cairo']">
      <table className="w-full text-right border-collapse" dir="rtl">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#FBFBFB] border-b border-[#ECECEC] text-[12px] font-semibold text-[#6B6A6A] h-11">
            <th className="py-3 px-4 w-10">
              <input
                type="checkbox"
                checked={
                  users.length > 0 && selectedIds.length === users.length
                }
                onChange={toggleSelectAll}
                className="rounded border-[#CBD5E1] cursor-pointer"
              />
            </th>
            <th className="py-3 px-4">اسم المستخدم</th>
            <th className="py-3 px-4">نوع الحساب</th>
            <th className="py-3 px-4">التوثيق</th>
            <th className="py-3 px-4">الاشتراك</th>
            <th className="py-3 px-4">الحالة</th>
            <th className="py-3 px-4">تاريخ التسجيل</th>
            <th className="py-3 px-4 text-center">الاجراءات</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#ECECEC] text-[13px]">
          {users.map((user) => {
            const isSelected = selectedIds.includes(user.id)
            return (
              <tr
                key={user.id}
                className={`h-13.5 hover:bg-[#F8FAFC] transition-colors ${
                  isSelected ? 'bg-[#F1F5F9]/50' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectRow(user.id)}
                    className="rounded border-[#CBD5E1] cursor-pointer"
                  />
                </td>

                {/* User Name & Email */}
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#111111] text-[14px]">
                      {user.name}
                    </span>
                    <span className="text-[#6B6A6A] text-[12px] font-normal">
                      {user.email}
                    </span>
                  </div>
                </td>

                {/* Account Type */}
                <td className="py-3 px-4 text-[#111111] font-medium">
                  {user.accountType}
                </td>

                {/* Verification Status */}
                <td className="py-3 px-4">
                  {renderVerificationBadge(user.verificationStatus)}
                </td>

                {/* Subscription Plan */}
                <td className="py-3 px-4">
                  {renderSubscriptionBadge(user.subscriptionPlan)}
                </td>

                {/* Account Status */}
                <td className="py-3 px-4">
                  {renderStatusBadge(user.accountStatus)}
                </td>

                {/* Registration Date */}
                <td className="py-3 px-4 text-[#6B6A6A]">
                  {user.registrationDate}
                </td>

                {/* Action Buttons */}
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewUser?.(user)}
                      className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] cursor-pointer"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onActionClick?.(user)}
                      className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] cursor-pointer"
                      title="المزيد من الخيارات"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
