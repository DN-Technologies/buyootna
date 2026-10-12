'use client'

import Image from 'next/image'
import { useState } from 'react'

import Modal from '@/components/ui/Modal'
import { openAccountTypePicker } from '@/lib/accountTypePicker'
import {
  errorMessage,
  identityName,
  savedProfiles,
  switchIdentity,
  type Identity,
} from '@/lib/auth'

const TYPE_LABELS: Record<Identity['type'], string> = {
  INDIVIDUAL: 'فرد',
  OFFICE: 'مكتب عقاري',
  COMPANY: 'شركة',
}
const TYPE_ICONS: Record<Identity['type'], { src: string; size: number }> = {
  INDIVIDUAL: { src: '/landing/type-individual.svg', size: 20 },
  OFFICE: { src: '/landing/type-office.svg', size: 20 },
  COMPANY: { src: '/landing/type-company.svg', size: 25 },
}

/**
 * "اختر الملف الشخصي": the profiles of the account remembered on this
 * browser. Picking one continues as it without typing the password again.
 */
export default function ProfilePickerDialog({
  open,
  onClose,
  onContinue,
}: {
  open: boolean
  onClose: () => void
  // Called once the chosen profile is the active one
  onContinue: () => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const saved = open ? savedProfiles() : null

  const choose = async (identity: Identity) => {
    if (identity.id === saved?.activeIdentityId) {
      onContinue()
      return
    }
    setBusyId(identity.id)
    setError('')
    try {
      await switchIdentity(identity.id)
      onContinue()
    } catch (err) {
      // Most likely the remembered session has ended
      setError(errorMessage(err, 'انتهت الجلسة المحفوظة. سجّل الدخول من جديد.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy="profile-picker-title"
      className="max-w-111.75"
    >
      <div className="flex flex-col gap-8 p-6">
        <div className="flex items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <h2
              id="profile-picker-title"
              className="text-lg leading-[1.2] font-bold text-ink"
            >
              اختر الملف الشخصي
            </h2>
            <p className="text-sm leading-normal font-medium tracking-[-0.408px] text-muted">
              تابع بأحد ملفاتك المحفوظة على هذا المتصفح، أو أضف حساباً جديداً.
            </p>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="rounded-lg p-2.5"
          >
            <Image
              src="/landing/modal-close.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {(saved?.identities ?? []).map((identity) => {
            const icon = TYPE_ICONS[identity.type] ?? TYPE_ICONS.INDIVIDUAL
            return (
              <button
                key={identity.id}
                type="button"
                disabled={busyId !== null}
                onClick={() => choose(identity)}
                className="flex w-full items-start gap-2 rounded-lg border border-line bg-white px-4 py-3 text-right transition hover:bg-surface disabled:opacity-60"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tag">
                  <Image
                    src={icon.src}
                    alt=""
                    width={icon.size}
                    height={icon.size}
                  />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-[1.3]">
                  <span className="truncate text-base font-medium text-ink">
                    {identityName(identity) || 'حسابي'}
                  </span>
                  <span
                    dir="ltr"
                    className="truncate text-right text-sm text-muted"
                  >
                    {saved?.user.email || saved?.user.phone}
                  </span>
                </span>
                <span className="flex h-5.5 shrink-0 items-center rounded-2xl bg-tag px-3 text-sm tracking-[-0.408px] text-ink">
                  {busyId === identity.id ? '…' : TYPE_LABELS[identity.type]}
                </span>
              </button>
            )
          })}
          {error && (
            <p role="alert" className="text-sm font-medium text-[#D12121]">
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onClose()
            openAccountTypePicker()
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl border border-brand bg-white text-sm font-bold tracking-[-0.408px] text-brand transition hover:bg-surface"
        >
          <Image src="/landing/auth-plus.svg" alt="" width={16} height={16} />
          اضافة حساب جديد
        </button>
      </div>
    </Modal>
  )
}
