'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { AdminModerator, fetchAssignableAdmins } from '@/lib/admin-reports'

export type AdminOption = AdminModerator

export interface AssignUserReportDialogProps {
  open: boolean
  onClose: () => void
  onAssignSuccess?: (admin: AdminOption) => void
}

export default function AssignUserReportDialog({
  open,
  onClose,
  onAssignSuccess,
}: AssignUserReportDialogProps) {
  const [admins, setAdmins] = useState<AdminOption[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminOption | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
      fetchAssignableAdmins()
        .then(setAdmins)
        .catch((err) => console.error('Failed to load admins:', err))
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleAssign = () => {
    if (!selectedAdmin) {
      alert('يرجى اختيار مشرف أولاً')
      return
    }
    onAssignSuccess?.(selectedAdmin)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Dialog Box */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6 text-right z-10"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-5 top-5 size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Subtitle */}
        <div className="flex flex-col gap-1.5 text-center w-full pt-2">
          <h2 className="text-[20px] font-bold text-[#111111]">اسناد البلاغ</h2>
          <p className="text-[14px] font-medium text-[#6B6A6A]">
            قم باختيار احد المشرفين ليقوم متابعة وحل هذا البلاغ
          </p>
        </div>

        {/* Select Admin Input Field */}
        <div className="flex flex-col gap-2 w-full relative">
          <label className="text-[14px] font-bold text-[#111111]">
            اختر المشرف
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full h-11 px-4 bg-white border border-[#ECECEC] rounded-xl flex items-center justify-between text-right cursor-pointer hover:border-[#CBD5E1]"
          >
            {selectedAdmin ? (
              <span className="text-[14px] font-semibold text-[#111111]">
                {selectedAdmin.email
                  ? `${selectedAdmin.name} (${selectedAdmin.email})`
                  : selectedAdmin.name}
              </span>
            ) : (
              <span className="text-[14px] font-medium text-[#94A3B8]">
                اختر أو اكتب اسم او بريد المشرف
              </span>
            )}
            <ChevronDown className="w-5 h-5 text-[#6B6A6A] shrink-0" />
          </button>

          {/* Admin Selector Dropdown List (Nodes 4043:136676 & 4043:136772) */}
          {dropdownOpen && (
            <div className="absolute top-20 right-0 left-0 bg-white border border-[#ECECEC] rounded-xl shadow-lg p-2 z-20 flex flex-col gap-1 max-h-60 overflow-y-auto">
              {admins.length === 0 ? (
                <p className="text-[13px] text-[#6B6A6A] text-center py-2">
                  لا يوجد مشرفون متاحون
                </p>
              ) : (
                admins.map((admin) => (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => {
                      setSelectedAdmin(admin)
                      setDropdownOpen(false)
                    }}
                    className="w-full p-2.5 flex items-center gap-3 rounded-lg hover:bg-[#F8FAFC] transition-colors text-right cursor-pointer"
                  >
                    <div className="size-8 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[13px] flex items-center justify-center shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-bold text-[#111111]">
                        {admin.name}
                      </span>
                      {admin.email && (
                        <span className="text-[12px] font-medium text-[#6B6A6A]">
                          {admin.email}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={handleAssign}
            className="flex-1 h-11 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
          >
            اسناد الاعلان
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
