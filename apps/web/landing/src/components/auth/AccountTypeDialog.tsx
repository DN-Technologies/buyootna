'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'

import Modal from '@/components/ui/Modal'
import {
  closeAccountTypePicker,
  isAccountTypePickerOpen,
  subscribeAccountTypePicker,
} from '@/lib/accountTypePicker'
import { ACCOUNT_TYPES, type AccountType } from '@/lib/accountTypes'
import { SIGNUP_PATH } from '@/lib/siteLinks'

/** One selectable account type: its icon, name and who it is for. */
export function AccountTypeOption({
  type,
  selected,
  onSelect,
  compact = false,
}: {
  type: (typeof ACCOUNT_TYPES)[number]
  selected: boolean
  onSelect: () => void
  // The smaller icon the in-form switcher uses
  compact?: boolean
}) {
  const scale = compact ? 0.8 : 1
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-right transition ${
        selected ? 'border-brand bg-brand' : 'border-line bg-white hover:bg-surface'
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-tag ${
          compact ? 'h-8 w-8' : 'h-10 w-10'
        }`}
      >
        <Image
          src={type.icon}
          alt=""
          width={type.iconSize * scale}
          height={type.iconSize * scale}
        />
      </span>
      <span className={`flex min-w-0 flex-1 flex-col ${compact ? 'gap-1.5' : 'gap-1'}`}>
        <span
          className={`text-base leading-[1.2] font-semibold ${selected ? 'text-white' : 'text-ink'}`}
        >
          {type.label}
        </span>
        <span
          className={`text-sm leading-[1.3] font-medium ${selected ? 'text-white' : 'text-muted'}`}
        >
          {type.description}
        </span>
      </span>
    </button>
  )
}

/** "اختر نوع حسابك للبدء": where creating an account starts. */
export default function AccountTypeDialog() {
  const router = useRouter()
  const open = useSyncExternalStore(
    subscribeAccountTypePicker,
    isAccountTypePickerOpen,
    () => false,
  )
  const [selected, setSelected] = useState<AccountType | null>(null)

  const close = () => {
    closeAccountTypePicker()
    setSelected(null)
  }

  const start = () => {
    if (!selected) return
    router.push(`${SIGNUP_PATH}?type=${selected}`)
    close()
  }

  return (
    <Modal open={open} onClose={close} labelledBy="account-type-title" className="max-w-[596px]">
      <div className="flex flex-col gap-8 p-6">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h2 id="account-type-title" className="text-lg leading-[1.2] font-bold text-ink">
              اختر نوع حسابك للبدء
            </h2>
            <p className="text-sm leading-normal font-medium tracking-[-0.408px] text-muted">
              حدد الطريقة التي تناسبك لاستخدام التطبيق، سواء كنت فرداً تبحث أو
              تنشر اعلاناً، أو مكتباً عقارياً، أو شركة تعرض مشاريعها وخدماتها.
            </p>
          </div>
          <button type="button" aria-label="إغلاق" onClick={close} className="rounded-lg p-2.5">
            <Image src="/landing/modal-close.svg" alt="" width={24} height={24} />
          </button>
        </div>

        <div role="radiogroup" aria-label="نوع الحساب" className="flex flex-col gap-3">
          {ACCOUNT_TYPES.map((type) => (
            <AccountTypeOption
              key={type.id}
              type={type}
              selected={selected === type.id}
              onSelect={() => setSelected(type.id)}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={!selected}
            onClick={start}
            className="flex h-12 flex-1 items-center justify-center rounded-3xl bg-brand text-sm font-bold text-white transition hover:bg-brand-dark disabled:bg-[#A0A0A0]"
          >
            بدء التسجيل
          </button>
          <button
            type="button"
            onClick={close}
            className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white text-sm font-bold text-ink transition hover:bg-surface"
          >
            إلغاء
          </button>
        </div>
      </div>
    </Modal>
  )
}
