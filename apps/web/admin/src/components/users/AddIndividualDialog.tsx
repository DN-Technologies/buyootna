'use client'

import { useState } from 'react'
import { UserPlus, X, Loader2 } from 'lucide-react'
import { createAdminIndividual } from '@/lib/admin-users'

interface AddIndividualDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddIndividualDialog({
  open,
  onClose,
  onSuccess,
}: AddIndividualDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [planId, setPlanId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('يرجى إدخال اسم الفرد')
      return
    }

    if (!email.trim() && !phone.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف على الأقل')
      return
    }

    try {
      setLoading(true)
      await createAdminIndividual({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
        planId: planId || undefined,
      })

      // Reset form
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setPlanId('')
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Failed to create individual:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'حدث خطأ أثناء إضافة الفرد'
      setError(Array.isArray(msg) ? msg.join('، ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Cairo']">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col z-10 text-right"
        dir="rtl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 text-[#6B6A6A] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#111111]">
              إضافة فرد جديد
            </h3>
            <p className="text-[13px] text-[#6B6A6A]">
              أدخل بيانات الحساب لإنشاء ملف تعريف جديد لفرد
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111111] mb-1.5">
              اسم الفرد <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل"
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-primary text-[#111111]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#111111] mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-primary text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#111111] mb-1.5">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+965XXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-primary text-[#111111]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-bold text-[#111111] mb-1.5">
                كلمة المرور (اختياري)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="توليد كلمة مرور تلقائية"
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-primary text-[#111111]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#111111] mb-1.5">
                باقة الاشتراك
              </label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#ECECEC] rounded-xl text-sm focus:outline-none focus:border-primary text-[#111111]"
              >
                <option value="">العادية (افتراضية)</option>
                <option value="silver">الفضية</option>
                <option value="gold">الذهبية</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#ECECEC]">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-primary hover:bg-[#1E4268] text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <span>إضافة الفرد</span>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] text-[14px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
