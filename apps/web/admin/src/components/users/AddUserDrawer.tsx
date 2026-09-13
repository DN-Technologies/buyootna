'use client'

import { useState, useEffect } from 'react'
import { X, Eye, EyeOff, Check, Loader2 } from 'lucide-react'
import { createAdminIndividual } from '@/lib/admin-users'

export interface AddUserDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PlanOption {
  id: string
  name: string
  price: string
}

const PLAN_OPTIONS: PlanOption[] = [
  { id: 'regular', name: 'الباقة العادية', price: '25 د.ك' },
  { id: 'silver', name: 'الباقة الفضية', price: '25 د.ك' },
  { id: 'gold', name: 'الباقة الذهبية', price: '25 د.ك' },
]

export default function AddUserDrawer({
  open,
  onClose,
  onSuccess,
}: AddUserDrawerProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState('regular')
  const [sendEmailNotification, setSendEmailNotification] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const resetForm = () => {
    setEmail('')
    setPhone('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setSelectedPlanId('regular')
    setSendEmailNotification(false)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() && !phone.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف على الأقل')
      return
    }

    if (password && password.length < 6) {
      setError('يجب ألا تقل كلمة المرور عن 6 أحرف')
      return
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقتين')
      return
    }

    try {
      setLoading(true)

      await createAdminIndividual({
        name: email.trim().split('@')[0] || phone.trim() || 'مستخدم جديد',
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
        planId: selectedPlanId || undefined,
      })

      handleClose()
      onSuccess()
    } catch (err: any) {
      console.error('Failed to create user:', err)
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'حدث خطأ أثناء إضافة المستخدم'
      setError(Array.isArray(msg) ? msg.join('، ') : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex justify-start">
      {/* Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-over Drawer Panel (Matching Figma Node 5634:69872) */}
      <div
        className="relative bg-white w-full max-w-125 h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right animate-in slide-in-from-right duration-200"
        dir="rtl"
        data-node-id="5634:69872"
        data-name="add user- user"
      >
        {/* Top Header (Figma Node 2575:134453 - drawer title) */}
        <div
          className="border-b border-[#ECECEC] p-5 flex items-start justify-between gap-3 shrink-0"
          data-node-id="2575:134453"
          data-name="drawer title"
        >
          {/* Title & Subtitle */}
          <div className="flex flex-col gap-1 text-right flex-1">
            <h2
              className="text-[16px] font-bold text-[#111111] leading-normal"
              data-node-id="2406:4379"
            >
              إضافة مستخدم جديد
            </h2>
            <p
              className="text-[14px] font-normal text-[#6B6A6A] leading-normal tracking-[-0.408px]"
              data-node-id="2406:4380"
            >
              أدخل البيانات الأساسية، ثم يستكمل المستخدم بياناته بعد تسجيل
              الدخول.
            </p>
          </div>

          {/* Close Button X */}
          <button
            type="button"
            onClick={handleClose}
            className="size-8 flex items-center justify-center rounded-lg text-[#6B6A6A] hover:bg-[#F8FAFC] hover:text-[#111111] transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق النافذة"
            data-node-id="2406:4376"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-user-form"
          onSubmit={handleSubmit}
          className="p-5 flex flex-col gap-6 flex-1 text-right"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Section: بيانات المستخدم */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
              data-node-id="5634:69882"
            >
              بيانات المستخدم
            </h3>

            <div className="flex flex-col gap-4">
              {/* البريد الالكتروني */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#111111] flex items-center gap-1">
                  <span>البريد الالكتروني</span>
                  <span className="text-[#D12121]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alisalem@gmail.com"
                    dir="ltr"
                    className="w-full h-11.5 px-3 bg-white border border-[#ECECEC] rounded-lg text-[14px] text-right text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* رقم الهاتف */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#111111] flex items-center gap-1">
                  <span>رقم الهاتف</span>
                  <span className="text-[#D12121]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01282388770"
                    dir="ltr"
                    className="w-full h-11.5 px-3 bg-white border border-[#ECECEC] rounded-lg text-[14px] text-right text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#111111] flex items-center gap-1">
                  <span>كلمة المرور</span>
                  <span className="text-[#D12121]">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="**************"
                    className="w-full h-11.5 pl-10 pr-3 bg-white border border-[#ECECEC] rounded-lg text-[14px] text-right text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 text-[#979797] hover:text-[#111111] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* تأكيد كلمة المرور */}
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-medium text-[#111111] flex items-center gap-1">
                  <span>تأكيد كلمة المرور</span>
                  <span className="text-[#D12121]">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="**************"
                    className="w-full h-11.5 pl-10 pr-3 bg-white border border-[#ECECEC] rounded-lg text-[14px] text-right text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 text-[#979797] hover:text-[#111111] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: الباقة */}
          <div className="flex flex-col gap-4">
            <h3
              className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
              data-node-id="5634:69894"
            >
              الباقة
            </h3>

            {/* 3 Package Cards in a row matching Figma */}
            <div className="grid grid-cols-3 gap-2" data-node-id="5634:69895">
              {PLAN_OPTIONS.map((plan) => {
                const isSelected = selectedPlanId === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-3 rounded-lg border text-right transition-all cursor-pointer flex flex-col justify-between h-16.5 ${
                      isSelected
                        ? 'border-primary bg-[#F8FAFC] ring-1 ring-primary'
                        : 'border-[#ECECEC] bg-white hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[13px] font-medium text-[#111111] truncate">
                        {plan.name}
                      </span>
                      <div
                        className={`size-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-[#D7D7D7] bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                    </div>
                    <span className="text-[15px] font-semibold text-[#111111] leading-none">
                      {plan.price}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section: Notification Checkbox */}
          <label
            className="flex items-center gap-2 py-1 cursor-pointer select-none group"
            data-node-id="5634:69911"
          >
            <input
              type="checkbox"
              checked={sendEmailNotification}
              onChange={(e) => setSendEmailNotification(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`size-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
                sendEmailNotification
                  ? 'bg-primary border-primary text-white'
                  : 'border-[#D7D7D7] bg-white group-hover:border-[#94A3B8]'
              }`}
            >
              {sendEmailNotification && <Check className="w-3 h-3 stroke-3" />}
            </div>
            <span
              className="text-[14px] font-medium text-[#1C1D1F] tracking-[-0.408px]"
              data-node-id="5634:69912"
            >
              ارسال اشعار للمستخدم عبر البريد الالكتروني بتفاصيل التسجيل.
            </span>
          </label>
        </form>

        {/* Sticky Bottom Action Bar (Figma Node 5634:69873) */}
        <div
          className="border-t border-[#ECECEC] px-5 py-4 flex gap-3 items-center justify-between shrink-0 bg-white"
          data-node-id="5634:69873"
        >
          {/* Primary Action Button: اضافة المستخدم */}
          <button
            type="submit"
            form="add-user-form"
            disabled={loading}
            className="flex-1 h-12 bg-primary hover:bg-[#1E4268] text-white font-semibold text-[14px] tracking-[0.28px] rounded-3xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            data-node-id="5634:69875"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الإضافة...</span>
              </>
            ) : (
              <span>اضافة المستخدم</span>
            )}
          </button>

          {/* Secondary Action Button: إلغاء */}
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] font-semibold text-[14px] tracking-[0.28px] rounded-3xl transition-colors cursor-pointer flex items-center justify-center"
            data-node-id="5634:69874"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
