'use client'

import React from 'react'

export interface UserActivityDropdownProps {
  isOpen: boolean
  onClose: () => void
  accountStatus?: 'نشط' | 'محظور' | 'موقوف'
  onSendNotification: () => void
  onChangePlan: () => void
  onAddCoupon: () => void
  onToggleSuspend: () => void
  onToggleBlock: () => void
  onResetPassword?: () => void
}

export default function UserActivityDropdown({
  isOpen,
  onClose,
  accountStatus = 'نشط',
  onSendNotification,
  onChangePlan,
  onAddCoupon,
  onToggleSuspend,
  onToggleBlock,
  onResetPassword,
}: UserActivityDropdownProps) {
  if (!isOpen) return null

  const isSuspended = accountStatus === 'موقوف'
  const isBlocked = accountStatus === 'محظور'

  return (
    <>
      {/* Backdrop overlay to dismiss on click outside */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Dropdown Container matching Figma Node 5634:68317 */}
      <div
        className="absolute left-0 mt-1 min-w-36.75 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] border border-[#ECECEC]/60 py-2 px-3 flex flex-col gap-0.5 items-end z-40 text-right select-none animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
        data-node-id="5634:68317"
        data-name="activity dropdown"
      >
        {/* 1. ارسال اشعار */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onSendNotification()
          }}
          className="h-8 w-full flex items-center justify-start px-1.5 rounded-sm hover:bg-[#F8FAFC] cursor-pointer transition-colors text-right"
          data-node-id="5634:68318"
        >
          <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
            ارسال اشعار
          </span>
        </button>

        {/* 2. تغيير الباقة */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onChangePlan()
          }}
          className="h-8 w-full flex items-center justify-start px-1.5 rounded-sm hover:bg-[#F8FAFC] cursor-pointer transition-colors text-right"
          data-node-id="5634:68320"
        >
          <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
            تغيير الباقة
          </span>
        </button>

        {/* 3. اضافة كوبون خصم */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onAddCoupon()
          }}
          className="h-8 w-full flex items-center justify-start px-1.5 rounded-sm hover:bg-[#F8FAFC] cursor-pointer transition-colors text-right"
          data-node-id="5643:293486"
        >
          <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
            اضافة كوبون خصم
          </span>
        </button>

        {/* 4. إعادة تعيين كلمة المرور */}
        {onResetPassword && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onResetPassword()
            }}
            className="h-8 w-full flex items-center justify-start px-1.5 rounded-sm hover:bg-[#F8FAFC] cursor-pointer transition-colors text-right"
            data-name="reset-password"
          >
            <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
              إعادة تعيين كلمة المرور
            </span>
          </button>
        )}

        {/* 4. تعطيل الحساب / تفعيل الحساب */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onToggleSuspend()
          }}
          className="h-8 w-full flex items-center justify-start px-1.5 rounded-sm hover:bg-amber-50 cursor-pointer transition-colors text-right"
          data-node-id="5634:68322"
        >
          <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#B97500] tracking-[-0.408px]">
            {isSuspended ? 'تفعيل الحساب' : 'تعطيل الحساب'}
          </span>
        </button>

        {/* 5. حظر المستخدم / إلغاء حظر المستخدم */}
        <button
          type="button"
          onClick={() => {
            onClose()
            onToggleBlock()
          }}
          className="h-8 w-full flex items-center justify-start px-1.5 rounded-sm hover:bg-red-50 cursor-pointer transition-colors text-right"
          data-node-id="5634:68324"
        >
          <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#9C1E28] tracking-[-0.408px]">
            {isBlocked ? 'إلغاء حظر المستخدم' : 'حظر المستخدم'}
          </span>
        </button>
      </div>
    </>
  )
}
