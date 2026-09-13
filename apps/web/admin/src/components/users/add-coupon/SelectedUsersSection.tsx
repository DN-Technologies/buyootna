import React from 'react'
import { ChevronUp, X } from 'lucide-react'
import { CouponModalTargetUser } from './types'

interface SelectedUsersSectionProps {
  users: CouponModalTargetUser[]
  isExpanded: boolean
  onToggleExpand: () => void
  onRemoveUser: (userId: string) => void
}

export const SelectedUsersSection: React.FC<SelectedUsersSectionProps> = ({
  users,
  isExpanded,
  onToggleExpand,
  onRemoveUser,
}) => {
  if (users.length <= 1) return null

  return (
    <div className="bg-[#f9fafe] flex flex-col gap-3 items-end justify-center px-4 py-2 rounded-lg shrink-0 w-full transition-all">
      {/* Banner Bar */}
      <div className="flex items-center justify-between w-full">
        {/* Toggle List Button */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 h-8 px-2 py-1 rounded-3xl cursor-pointer hover:opacity-80 transition-opacity"
        >
          {isExpanded && <ChevronUp className="size-3.5 text-primary" />}
          <span className="font-['Cairo'] font-bold text-[14px] text-primary tracking-[-0.408px]">
            {isExpanded ? 'اخفاء القائمة' : 'عرض القائمة'}
          </span>
        </button>

        {/* Selected Count Text */}
        <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
          تم تحديد {users.length} مستخدمًا
        </span>
      </div>

      {/* Expanded User Cards Accordion (Figma 5634:71700) */}
      {isExpanded && (
        <div className="bg-white border border-[#ececec] rounded-lg shrink-0 w-full max-h-52 overflow-y-auto p-2 flex flex-col gap-2">
          {users.map((u) => {
            const initial = (u.name || u.email || 'م').trim().charAt(0)
            const role = (u as any).accountType || (u as any).role || 'فرد'
            return (
              <div
                key={u.id}
                className="flex items-center justify-between py-1.5 px-2 hover:bg-[#F9FAFE] rounded-md transition-colors"
              >
                {/* Remove button (X) */}
                <button
                  type="button"
                  onClick={() => onRemoveUser(u.id)}
                  className="p-1 rounded-sm text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  aria-label={`إزالة ${u.name || u.email}`}
                >
                  <X className="size-3.5" />
                </button>

                {/* User info & avatar */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5 items-end text-right">
                    <span className="font-['Cairo'] font-semibold text-[14px] text-[#111111] leading-normal">
                      {u.name || u.email}
                    </span>
                    <span className="font-['Cairo'] font-medium text-[12px] text-[#6b6a6a]">
                      {role}
                    </span>
                  </div>

                  {/* Avatar circle */}
                  <div className="size-8 rounded-full bg-[#beefb9] flex items-center justify-center shrink-0 text-[#0f1828] font-['Cairo'] font-medium text-[12px]">
                    {initial}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SelectedUsersSection
