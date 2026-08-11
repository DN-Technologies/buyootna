'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { SubscriptionRecord } from './billing.types'

export interface SubscriptionsTableProps {
  subscriptions: SubscriptionRecord[]
  selectedIds: string[]
  onToggleSelectAll: () => void
  onToggleSelectOne: (id: string) => void
  onActionClick: (
    action: 'view' | 'invoice' | 'rebuy',
    sub: SubscriptionRecord,
  ) => void
}

export default function SubscriptionsTable({
  subscriptions,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectOne,
  onActionClick,
}: SubscriptionsTableProps) {
  const [activeRowActionId, setActiveRowActionId] = useState<string | null>(
    null,
  )
  const actionMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActiveRowActionId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="bg-white border border-[#ECECEC] rounded-2xl shadow-xs overflow-hidden font-['Cairo'] text-right">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#ECECEC] text-[12px] font-bold text-[#6B6A6A]">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={
                    subscriptions.length > 0 &&
                    selectedIds.length === subscriptions.length
                  }
                  onChange={onToggleSelectAll}
                  className="size-4 rounded border-[#CBD5E1] text-primary focus:ring-primary"
                />
              </th>
              <th className="p-4">اسم المستخدم</th>
              <th className="p-4">نوع الباقة</th>
              <th className="p-4">السعر</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ البدء</th>
              <th className="p-4">تاريخ الانتهاء</th>
              <th className="p-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECEC] text-[13px]">
            {subscriptions.map((sub) => {
              const isSelected = selectedIds.includes(sub.id)
              const isActionOpen = activeRowActionId === sub.id

              return (
                <tr
                  key={sub.id}
                  className="hover:bg-slate-50/70 transition-colors text-[#111111]"
                >
                  {/* Checkbox */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectOne(sub.id)}
                      className="size-4 rounded border-[#CBD5E1] text-primary focus:ring-primary"
                    />
                  </td>

                  {/* User Avatar + Name & Email */}
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold text-[13px] shrink-0">
                        {sub.userName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#111111]">
                          {sub.userName}
                        </span>
                        <span className="text-[11px] text-[#6B6A6A]">
                          {sub.userEmail}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Package Name Pill */}
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[12px] font-bold ${
                        sub.packageName === 'الذهبية'
                          ? 'bg-[#FFFBEB] text-[#B45309]'
                          : sub.packageName === 'الفضية'
                            ? 'bg-[#F0F9FF] text-[#0369A1]'
                            : 'bg-[#F1F5F9] text-[#475569]'
                      }`}
                    >
                      {sub.packageName}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4 font-bold text-[#111111]">{sub.price}</td>

                  {/* Status Pill */}
                  <td className="p-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        sub.status === 'نشط'
                          ? 'bg-[#E6F4EA] text-[#137333]'
                          : sub.status === 'ملغي'
                            ? 'bg-[#FEF3F2] text-[#9C1E28]'
                            : 'bg-[#F1F5F9] text-[#6B6A6A]'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>

                  {/* Start Date */}
                  <td className="p-4 text-[#6B6A6A] font-medium">
                    {sub.startDate}
                  </td>

                  {/* End Date */}
                  <td className="p-4 text-[#6B6A6A] font-medium">
                    {sub.endDate}
                  </td>

                  {/* Action 3-dots Menu (Figma Node 4534:53681) */}
                  <td className="p-4 text-center relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveRowActionId(isActionOpen ? null : sub.id)
                      }
                      className="size-8 rounded-full flex items-center justify-center text-[#6B6A6A] hover:bg-slate-100 transition-colors mx-auto cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu (Figma Node 4534:53681) */}
                    {isActionOpen && (
                      <div
                        ref={actionMenuRef}
                        className="absolute left-4 top-12 w-44 bg-white border border-[#ECECEC] rounded-xl shadow-lg p-1.5 z-40 flex flex-col gap-0.5 text-right font-['Cairo']"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onActionClick('view', sub)
                            setActiveRowActionId(null)
                          }}
                          className="w-full px-3 py-2 text-[13px] font-medium text-[#111111] hover:bg-slate-50 rounded-lg text-right transition-colors"
                        >
                          عرض التفاصيل
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onActionClick('invoice', sub)
                            setActiveRowActionId(null)
                          }}
                          className="w-full px-3 py-2 text-[13px] font-medium text-[#111111] hover:bg-slate-50 rounded-lg text-right transition-colors"
                        >
                          تحميل الفاتورة
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onActionClick('rebuy', sub)
                            setActiveRowActionId(null)
                          }}
                          className="w-full px-3 py-2 text-[13px] font-medium text-[#111111] hover:bg-slate-50 rounded-lg text-right transition-colors"
                        >
                          شراء الباقة مجددا
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
