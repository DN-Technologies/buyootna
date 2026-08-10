'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

export interface Moderator {
  id: string
  name: string
  role: string
  avatar?: string
}

const MODERATORS: Moderator[] = [
  { id: 'MOD-1', name: 'محمد الجارح', role: 'مشرف عام' },
  { id: 'MOD-2', name: 'محمد الجارح', role: 'مسؤول الدعم الفني' },
  { id: 'MOD-3', name: 'محمد الجارح', role: 'مشرف' },
  { id: 'MOD-4', name: 'علي العتيبي', role: 'مشرف' },
]

export interface AssignReportModalProps {
  isOpen: boolean
  reportTitle?: string
  onClose: () => void
  onAssign: (moderator: Moderator) => void
}

export default function AssignReportModal({
  isOpen,
  reportTitle,
  onClose,
  onAssign,
}: AssignReportModalProps) {
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(
    null,
  )
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  const filteredModerators = MODERATORS.filter(
    (mod) =>
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModerator) return
    onAssign(selectedModerator)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-['Cairo']">
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 text-right shadow-xl relative"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex flex-col gap-1 text-center">
          <h3 className="font-bold text-[20px] text-[#111111]">اسناد البلاغ</h3>
          <p className="text-[13px] text-[#6B6A6A] font-normal">
            قم باختيار احد المشرفين ليقوم متابعة وحل هذا البلاغ
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
            <label className="text-[13px] font-medium text-[#111111]">
              اختر المشرف
            </label>

            {/* Select Input Field */}
            <div
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="border border-[#ECECEC] rounded-lg px-3.5 h-11 flex items-center justify-between cursor-pointer bg-white"
            >
              <span
                className={`text-[13px] ${
                  selectedModerator
                    ? 'text-[#111111] font-medium'
                    : 'text-[#A0A0A0]'
                }`}
              >
                {selectedModerator
                  ? `${selectedModerator.name} (${selectedModerator.role})`
                  : 'اختر أو اكتب اسم او بريد المشرف'}
              </span>
              <ChevronDown className="w-4 h-4 text-[#6B6A6A]" />
            </div>

            {/* Dropdown Options List (Figma Nodes 4043:154123 & 4043:154185) */}
            {dropdownOpen && (
              <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#ECECEC] rounded-xl shadow-xl z-30 p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#ECECEC] mb-1">
                  <Search className="w-4 h-4 text-[#A0A0A0]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المشرف..."
                    className="w-full text-[13px] text-[#111111] focus:outline-none bg-transparent"
                    autoFocus
                  />
                </div>

                {filteredModerators.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => {
                      setSelectedModerator(mod)
                      setDropdownOpen(false)
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <div className="size-9 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[14px] flex items-center justify-center shrink-0">
                      {mod.name.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-bold text-[#111111]">
                        {mod.name}
                      </span>
                      <span className="text-[12px] text-[#6B6A6A]">
                        {mod.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!selectedModerator}
              className={`flex-1 h-11 rounded-full text-[14px] font-bold text-white transition-colors ${
                selectedModerator
                  ? 'bg-primary hover:bg-[#0f243a] cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              اسناد الاعلان
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-[#ECECEC] bg-white hover:bg-slate-50 text-[#111111] text-[14px] font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
