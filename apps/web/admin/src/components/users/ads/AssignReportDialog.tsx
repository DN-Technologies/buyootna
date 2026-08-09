'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Mock admin directory: there is no "list admin users" endpoint wired into
// the frontend yet, and the report itself is already fully mock data (no
// Report model exists) — so this stays consistent with that placeholder
// policy rather than half-wiring one piece of a mock flow to real data.
export interface MockAdmin {
  id: string
  name: string
  role: string
}

const mockAdmins: MockAdmin[] = [
  { id: '1', name: 'محمد الجارح', role: 'مشرف عام' },
  { id: '2', name: 'محمد الجارح', role: 'مسؤول الدعم الفني' },
  { id: '3', name: 'محمد الجارح', role: 'مشرف' },
  { id: '4', name: 'محمد الجارح', role: 'مشرف' },
]

export default function AssignReportDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void
  onConfirm: (admin: MockAdmin) => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<MockAdmin | null>(null)

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="bg-white rounded-xl p-6 flex flex-col gap-8 items-center w-full max-w-md relative font-['Cairo']"
        dir="rtl"
      >
        <div className="flex flex-col gap-2 items-center text-center w-full">
          <p className="text-[18px] font-bold text-[#111111]">اسناد البلاغ</p>
          <p className="text-[14px] text-[#6B6A6A]">
            قم باختيار احد المشرفين ليقوم متابعة وحل هذا البلاغ
          </p>
        </div>

        <div className="flex flex-col gap-1.5 w-full relative">
          <p className="text-[14px] font-medium text-[#111111]">اختر المشرف</p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="bg-white border border-[#ECECEC] rounded-lg h-11.5 w-full flex items-center justify-between px-3 cursor-pointer"
          >
            <span
              className={`text-[14px] text-right flex-1 ${selected ? 'text-[#111111]' : 'text-[#979797]'}`}
            >
              {selected
                ? `${selected.name} · ${selected.role}`
                : 'اختر أو اكتب اسم او بريد المشرف'}
            </span>
            <ChevronDown className="w-4.5 h-4.5 text-[#111111]" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div className="absolute top-full mt-1.5 w-full bg-white border border-[#ECECEC] rounded-lg shadow-lg py-3 px-4 flex flex-col gap-3 z-20">
                {mockAdmins.map((admin) => (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => {
                      setSelected(admin)
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 w-full cursor-pointer hover:opacity-80"
                  >
                    <div className="size-8 rounded-full bg-[#BEEFB9] flex items-center justify-center text-[#0F1828] text-[12px] font-medium shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    <div className="flex flex-col text-right">
                      <p className="text-[13px] font-semibold text-[#111111]">
                        {admin.name}
                      </p>
                      <p className="text-[12px] text-[#6B6A6A]">{admin.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className="flex-1 h-11.5 flex items-center justify-center rounded-full bg-primary text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            اسناد الاعلان
          </button>
        </div>
      </div>
    </div>
  )
}
