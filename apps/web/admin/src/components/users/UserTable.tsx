'use client'

import React, { useState } from 'react'
import { Eye, MoreVertical, Check } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import UserActivityDropdown from './UserActivityDropdown'

export interface UserRow {
  id: string
  name: string
  email: string
  phone?: string
  accountType?: 'فرد' | 'شركة' | 'مكتب عقاري'
  verificationStatus?: 'موثق' | 'غير موثق' | 'قيد الانتظار' | '—'
  subscriptionPlan: string
  adsCount?: number | string
  accountStatus: 'نشط' | 'محظور' | 'موقوف'
  registrationDate: string
}

interface UserTableProps {
  users: UserRow[]
  selectedIds?: string[]
  onSelectRow?: (id: string) => void
  onSelectAll?: () => void
  onViewUser?: (user: UserRow) => void
  onStatusChange?: (
    user: UserRow,
    newStatus: 'active' | 'blocked' | 'suspended',
  ) => void
  onDeleteUser?: (user: UserRow) => void
  onSendNotification?: (user: UserRow) => void
  onChangePlan?: (user: UserRow) => void
  onAddCoupon?: (user: UserRow) => void
  onSuspendUser?: (user: UserRow) => void
  onReactivateUser?: (user: UserRow) => void
  loading?: boolean
  userLabel?: string
  entityName?: string
}

export default function UserTable({
  users,
  selectedIds: externalSelectedIds,
  onSelectRow,
  onSelectAll,
  onViewUser,
  onStatusChange,
  onDeleteUser,
  onSendNotification,
  onChangePlan,
  onAddCoupon,
  onSuspendUser,
  onReactivateUser,
  loading = false,
  userLabel = 'اسم المستخدم',
  entityName = 'مستخدمين',
}: UserTableProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>([])
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const selectedIds = externalSelectedIds ?? internalSelectedIds

  const handleToggleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll()
    } else {
      if (selectedIds.length === users.length) {
        setInternalSelectedIds([])
      } else {
        setInternalSelectedIds(users.map((u) => u.id))
      }
    }
  }

  const handleToggleSelectRow = (id: string) => {
    if (onSelectRow) {
      onSelectRow(id)
    } else {
      setInternalSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      )
    }
  }

  const renderSubscriptionBadge = (plan: UserRow['subscriptionPlan']) => {
    if (!plan || plan === '—' || plan === 'ـــــــ') {
      return <span className="text-[#6B6A6A]">ـــــــ</span>
    }

    const styles: Record<string, string> = {
      الفضية: 'bg-[#F2F4F7] text-[#344054]',
      السنوية: 'bg-[rgba(255,228,21,0.1)] text-[#C27912]',
      الذهبية: 'bg-[rgba(255,228,21,0.1)] text-[#C27912]',
      العادية: 'bg-[#F7F2F6] text-[#344054]',
    }

    return (
      <span
        className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[12px] font-medium leading-[16.5px] ${
          styles[plan] || 'bg-[#F2F4F7] text-[#344054]'
        }`}
      >
        {plan}
      </span>
    )
  }

  const renderStatusBadge = (status: UserRow['accountStatus']) => {
    if (status === 'نشط') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[rgba(18,194,129,0.1)] text-[#018B1B] text-[12px] font-medium leading-[16.5px]">
          نشط
        </span>
      )
    }

    if (status === 'محظور') {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#FEF3F2] text-[#9C1E28] text-[12px] font-medium leading-[16.5px]">
          محظور
        </span>
      )
    }

    return (
      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[rgba(245,184,70,0.1)] text-[#DB9718] text-[12px] font-medium leading-[16.5px]">
        موقوف
      </span>
    )
  }

  const allSelected = users.length > 0 && selectedIds.length === users.length

  return (
    <div className="w-full overflow-x-auto bg-white font-['Cairo'] relative select-none">
      <table className="w-full text-right border-collapse" dir="rtl">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#FBFBFB] border-b border-[#ECECEC] text-[12px] font-semibold text-[#6B6A6A] h-11">
            <th className="py-3 px-4 text-right">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors ${
                    allSelected
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#CBD5E1] bg-white hover:border-gray-400'
                  }`}
                  aria-label="تحديد الكل"
                >
                  {allSelected && <Check className="w-3 h-3 stroke-3" />}
                </button>
                <span className="font-semibold text-[12px] text-[#6B6A6A]">
                  {userLabel}
                </span>
              </div>
            </th>
            <th className="py-3 px-4 font-semibold text-[12px] text-[#6B6A6A]">
              الاشتراك
            </th>
            <th className="py-3 px-4 font-semibold text-[12px] text-[#6B6A6A]">
              الاعلانات
            </th>
            <th className="py-3 px-4 font-semibold text-[12px] text-[#6B6A6A]">
              الحالة
            </th>
            <th className="py-3 px-4 font-semibold text-[12px] text-[#6B6A6A]">
              تاريخ التسجيل
            </th>
            <th className="py-3 px-4 text-center font-semibold text-[12px] text-[#6B6A6A]">
              الاجراءات
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#ECECEC] text-[13px]">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="h-12 border-b border-[#ECECEC]">
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4.5 w-4.5 rounded-xs" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-2.5 px-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="py-2.5 px-4">
                  <Skeleton className="h-5 w-14 rounded-full" />
                </td>
                <td className="py-2.5 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-2.5 px-4 text-center">
                  <Skeleton className="h-6 w-14 rounded-md mx-auto" />
                </td>
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-12 text-center text-[#6B6A6A]">
                لا يوجد {entityName} مطابقون للبحث
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isSelected = selectedIds.includes(user.id)
              const isMenuOpen = activeMenuId === user.id

              return (
                <tr
                  key={user.id}
                  className={`h-12 border-b border-[#ECECEC]/70 hover:bg-[#F8FAFC] transition-colors ${
                    isSelected ? 'bg-[#F9FAFE]' : 'bg-white'
                  }`}
                >
                  {/* User Checkbox + Name & Email */}
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectRow(user.id)}
                        className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-[#CBD5E1] bg-white hover:border-gray-400'
                        }`}
                        aria-label={`تحديد ${user.name}`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-3" />}
                      </button>

                      <div className="flex flex-col text-right">
                        <span className="font-semibold text-[#111111] text-[13px] leading-tight">
                          {user.name}
                        </span>
                        <span className="text-[#6B6A6A] text-[12px] font-normal leading-tight mt-0.5">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Subscription Plan Badge */}
                  <td className="py-2 px-4">
                    {renderSubscriptionBadge(user.subscriptionPlan)}
                  </td>

                  {/* Ads Count */}
                  <td className="py-2 px-4 text-[#111111] font-normal text-[13px]">
                    {user.adsCount !== undefined && user.adsCount !== null
                      ? user.adsCount
                      : 'ـــــــ'}
                  </td>

                  {/* Account Status Badge */}
                  <td className="py-2 px-4">
                    {renderStatusBadge(user.accountStatus)}
                  </td>

                  {/* Registration Date */}
                  <td className="py-2 px-4 text-[#6B6A6A] text-[12px] whitespace-nowrap">
                    {user.registrationDate}
                  </td>

                  {/* Actions Column */}
                  <td className="py-2 px-4 relative">
                    <div className="flex items-center justify-center gap-1">
                      {/* View Details Eye */}
                      <button
                        type="button"
                        onClick={() => onViewUser?.(user)}
                        className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>

                      {/* Figma Activity Dropdown Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : user.id)
                          }
                          className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                          title="المزيد من الإجراءات"
                        >
                          <MoreVertical className="w-4.5 h-4.5" />
                        </button>

                        {/* Figma Node 5634:68317 Activity Dropdown */}
                        <UserActivityDropdown
                          isOpen={isMenuOpen}
                          onClose={() => setActiveMenuId(null)}
                          accountStatus={user.accountStatus}
                          onSendNotification={() => onSendNotification?.(user)}
                          onChangePlan={() => onChangePlan?.(user)}
                          onAddCoupon={() => onAddCoupon?.(user)}
                          onToggleSuspend={() => {
                            if (user.accountStatus === 'موقوف') {
                              onReactivateUser?.(user)
                            } else {
                              onSuspendUser?.(user)
                            }
                          }}
                          onToggleBlock={() => {
                            const newStatus =
                              user.accountStatus === 'محظور'
                                ? 'active'
                                : 'blocked'
                            onStatusChange?.(user, newStatus)
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
