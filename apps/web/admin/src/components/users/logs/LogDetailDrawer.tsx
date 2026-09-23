'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { AdminLogRow } from '@/lib/admin-logs'
import { LOG_ACTION_LABEL, LOG_TARGET_TYPE_LABEL } from '@/lib/log-labels'
import { formatArabicDate } from '@/lib/property-labels'

export interface LogDetailDrawerProps {
  open: boolean
  onClose: () => void
  log: AdminLogRow | null
}

function formatMetadataKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase())
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا'
  return String(value)
}

export default function LogDetailDrawer({
  open,
  onClose,
  log,
}: LogDetailDrawerProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !log) return null

  const metadataEntries = Object.entries(log.metadata || {})

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer Container */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col z-10 text-right overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#ECECEC] flex items-center justify-between gap-4 sticky top-0 bg-white z-10">
          <div className="flex flex-col text-right">
            <h2 className="text-[16px] font-bold text-[#111111]">
              {LOG_ACTION_LABEL[log.action] || log.action}
            </h2>
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              {formatArabicDate(log.createdAt)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#6B6A6A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-6 flex-1">
          <div className="bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col gap-3 text-right border-r-4 border-r-primary">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-[#6B6A6A]">نوع العملية</span>
              <span className="font-bold text-[#111111]">
                {LOG_ACTION_LABEL[log.action] || log.action}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-medium text-[#6B6A6A]">بواسطة</span>
              <span className="font-bold text-[#111111]">
                {log.actorType === 'SYSTEM'
                  ? 'النظام'
                  : log.actorAdmin?.name || 'مشرف'}
              </span>
            </div>
            {log.targetType && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-[#6B6A6A]">النوع</span>
                <span className="font-bold text-[#111111]">
                  {LOG_TARGET_TYPE_LABEL[log.targetType] || log.targetType}
                </span>
              </div>
            )}
            {log.targetId && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-[#6B6A6A]">المعرف</span>
                <span className="font-mono text-[12px] text-[#111111]">
                  {log.targetId}
                </span>
              </div>
            )}
          </div>

          {metadataEntries.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-medium text-[#6B6A6A] mb-1">
                تفاصيل إضافية
              </span>
              <div className="bg-[#F8FAFC] rounded-2xl p-4 flex flex-col gap-3 text-right">
                {metadataEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-[13px]"
                  >
                    <span className="font-medium text-[#6B6A6A]">
                      {formatMetadataKey(key)}
                    </span>
                    <span className="font-bold text-[#111111]">
                      {formatMetadataValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
