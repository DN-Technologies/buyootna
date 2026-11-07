'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus } from 'lucide-react'
import DiscountCodeDrawer from './DiscountCodeDrawer'
import {
  AdminDiscountCode,
  codeState,
  createDiscountCode,
  DiscountCodeInput,
  discountLabel,
  fetchDiscountCodes,
  PURPOSE_LABELS,
  updateDiscountCode,
} from '@/lib/admin-discount-codes'

const TONE = {
  ok: 'bg-[#E6F4EA] text-[#137333]',
  warn: 'bg-[#FFFBEB] text-[#B45309]',
  muted: 'bg-[#F1F5F9] text-[#6B6A6A]',
} as const

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('ar-KW-u-nu-latn') : '—'

/**
 * «أكواد الخصم»: the codes the app's «الدفع» screen accepts. The server
 * checks a code and takes it off; a use counts once the invoice is paid.
 */
export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<AdminDiscountCode[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<AdminDiscountCode | null>(null)

  const load = useCallback(async () => {
    try {
      setCodes(await fetchDiscountCodes())
      setLoadError(null)
    } catch {
      setLoadError('تعذر تحميل أكواد الخصم')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openNew = () => {
    setEditing(null)
    setDrawerOpen(true)
  }
  const openEdit = (code: AdminDiscountCode) => {
    setEditing(code)
    setDrawerOpen(true)
  }

  const save = async (data: DiscountCodeInput) => {
    if (editing) await updateDiscountCode(editing.id, data)
    else await createDiscountCode(data)
    await load()
  }

  const toggleActive = async (code: AdminDiscountCode) => {
    try {
      await updateDiscountCode(code.id, { isActive: !code.isActive })
      await load()
    } catch {
      alert('تعذر تحديث الكود، يرجى المحاولة مرة أخرى.')
    }
  }

  const activeCount = codes.filter((c) => codeState(c).tone === 'ok').length
  const totalUses = codes.reduce((sum, c) => sum + c.usedCount, 0)

  return (
    <div className="flex w-full flex-col gap-6 pb-10 text-right font-['Cairo']" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[13px] text-[#6B6A6A]">
            <Link href="/" className="hover:text-[#111111]">
              الرئيسية
            </Link>
            <ChevronLeft className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span>المالية</span>
            <ChevronLeft className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="font-bold text-[#111111]">أكواد الخصم</span>
          </div>
          <h1 className="mt-1 text-[22px] font-bold text-[#111111]">أكواد الخصم</h1>
          <p className="text-[13px] font-medium text-[#6B6A6A]">
            أكواد يدخلها المستخدم في شاشة الدفع بالتطبيق لخصم من الباقات أو الاشتراك أو
            تمييز الإعلان.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-bold text-white"
        >
          <Plus className="h-4 w-4" />
          إضافة كود
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['إجمالي الأكواد', codes.length],
          ['الأكواد الفعّالة', activeCount],
          ['مرات الاستخدام المدفوعة', totalUses],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-2xl border border-[#ECECEC] bg-[#F8FAFC] p-5"
          >
            <span className="text-[13px] font-medium text-[#6B6A6A]">{label}</span>
            <span className="text-[28px] font-bold text-[#111111]">{value}</span>
          </div>
        ))}
      </div>

      {loadError && <p className="text-[14px] font-medium text-red-600">{loadError}</p>}

      <div className="overflow-x-auto rounded-2xl border border-[#ECECEC] bg-white">
        <table className="w-full text-[13px]">
          <thead className="bg-[#F8FAFC] text-[#6B6A6A]">
            <tr>
              {['الكود', 'الخصم', 'يُستخدم في', 'الاستخدامات', 'ينتهي', 'الحالة', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-right font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && !loadError && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[#6B6A6A]">
                  لا توجد أكواد بعد
                </td>
              </tr>
            )}
            {codes.map((code) => {
              const state = codeState(code)
              return (
                <tr key={code.id} className="border-t border-[#ECECEC]">
                  <td className="px-4 py-3 font-mono font-bold text-[#111111]" dir="ltr">
                    {code.code}
                  </td>
                  <td className="px-4 py-3 text-[#111111]">{discountLabel(code)}</td>
                  <td className="px-4 py-3 text-[#6B6A6A]">
                    {code.appliesTo.map((p) => PURPOSE_LABELS[p]).join('، ')}
                  </td>
                  <td className="px-4 py-3 text-[#111111]">
                    {code.usedCount}
                    {code.maxUses != null ? ` / ${code.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-[#6B6A6A]">{formatDate(code.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${TONE[state.tone]}`}>
                      {state.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(code)}
                        className="h-8 cursor-pointer rounded-lg border border-[#ECECEC] px-3 font-bold text-[#111111]"
                      >
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleActive(code)}
                        className="h-8 cursor-pointer rounded-lg border border-[#ECECEC] px-3 font-bold text-[#6B6A6A]"
                      >
                        {code.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <DiscountCodeDrawer
        open={drawerOpen}
        code={editing}
        onClose={() => setDrawerOpen(false)}
        onSave={save}
      />
    </div>
  )
}
