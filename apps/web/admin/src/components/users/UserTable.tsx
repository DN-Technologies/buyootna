'use client'

import React, { useState } from 'react'
import { Eye, MoreVertical, ShieldAlert, ShieldCheck, Ban, Trash2 } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'

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
  onViewUser?: (user: UserRow) => void
  onStatusChange?: (user: UserRow, newStatus: 'active' | 'blocked' | 'suspended') => void
  onDeleteUser?: (user: UserRow) => void
  loading?: boolean
  userLabel?: string
  entityName?: string
}

export default function UserTable({
  users,
  onViewUser,
  onStatusChange,
  onDeleteUser,
  loading = false,
  userLabel = 'اسم الفرد',
  entityName = 'أفراد',
}: UserTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

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

  const renderSubscriptionBadge = (plan: UserRow['subscriptionPlan']) => {
    if (!plan || plan === '—' || plan === 'ـــــــ') {
      return <span className="text-[#6B6A6A]">ـــــــ</span>
    }

    const styles: Record<string, string> = {
      الفضية: 'bg-[#F2F4F7] text-[#344054]',
      السنوية: 'bg-[rgba(255,228,21,0.1)] text-[#C27912]',
      الذهبية: 'bg-[rgba(255,228,21,0.1)] text-[#C27912]',
      العادية: 'bg-[#F8FAFC] text-[#64748B]',
    }

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
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
        <span className="px-2.5 py-0.5 rounded-full bg-[rgba(18,194,129,0.1)] text-[#018B1B] text-[12px] font-medium">
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
      <span className="px-2.5 py-0.5 rounded-full bg-[rgba(255,228,21,0.1)] text-[#C27912] text-[12px] font-medium">
        موقوف
      </span>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-white border border-[#ECECEC] rounded-lg font-['Cairo'] relative">
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
            <th className="py-3 px-4">{userLabel}</th>
            <th className="py-3 px-4">الاشتراك</th>
            <th className="py-3 px-4">الاعلانات</th>
            <th className="py-3 px-4">الحالة</th>
            <th className="py-3 px-4">تاريخ التسجيل</th>
            <th className="py-3 px-4 text-center">الاجراءات</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#ECECEC] text-[13px]">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="h-13.5">
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-4 rounded-xs" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-10" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-5 w-14 rounded-full" />
                </td>
                <td className="py-3 px-4">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="py-3 px-4 text-center">
                  <Skeleton className="h-6 w-12 rounded-md mx-auto" />
                </td>
              </tr>
            ))
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-[#6B6A6A]">
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
                      <span className="font-semibold text-[#111111] text-[13px]">
                        {user.name}
                      </span>
                      <span className="text-[#6B6A6A] text-[12px] font-normal">
                        {user.email}
                      </span>
                    </div>
                  </td>

                  {/* Subscription Plan */}
                  <td className="py-3 px-4">
                    {renderSubscriptionBadge(user.subscriptionPlan)}
                  </td>

                  {/* Ads Count */}
                  <td className="py-3 px-4 text-[#111111] font-normal text-[13px]">
                    {user.adsCount !== undefined ? user.adsCount : 'ـــــــ'}
                  </td>

                  {/* Account Status */}
                  <td className="py-3 px-4">
                    {renderStatusBadge(user.accountStatus)}
                  </td>

                  {/* Registration Date */}
                  <td className="py-3 px-4 text-[#6B6A6A] text-[12px]">
                    {user.registrationDate}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 relative">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewUser?.(user)}
                        className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : user.id)
                          }
                          className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                          title="المزيد من الإجراءات"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Menu */}
                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute left-0 mt-1 w-44 bg-white border border-[#ECECEC] rounded-lg shadow-lg py-1 z-20 text-right font-['Cairo']">
                              {user.accountStatus !== 'نشط' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    onStatusChange?.(user, 'active')
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-green-700 hover:bg-green-50 flex items-center justify-end gap-2 font-medium"
                                >
                                  <span>تفعيل الحساب</span>
                                  <ShieldCheck className="w-4 h-4" />
                                </button>
                              )}

                              {user.accountStatus !== 'موقوف' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    onStatusChange?.(user, 'suspended')
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-amber-700 hover:bg-amber-50 flex items-center justify-end gap-2 font-medium"
                                >
                                  <span>إيقاف الحساب</span>
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}

                              {user.accountStatus !== 'محظور' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    onStatusChange?.(user, 'blocked')
                                  }}
                                  className="w-full px-3 py-2 text-[13px] text-red-700 hover:bg-red-50 flex items-center justify-end gap-2 font-medium"
                                >
                                  <span>حظر الحساب</span>
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              )}

                              <div className="my-1 border-t border-[#ECECEC]" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  onDeleteUser?.(user)
                                }}
                                className="w-full px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 flex items-center justify-end gap-2 font-medium"
                              >
                                <span>حذف المستخدم</span>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
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
