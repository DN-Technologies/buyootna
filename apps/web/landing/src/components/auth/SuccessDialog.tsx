'use client'

import Image from 'next/image'

import Modal from '@/components/ui/Modal'

/** The green-badge dialog that ends a flow; its one button moves on. */
export default function SuccessDialog({
  open,
  title,
  text,
  action,
  onAction,
  secondary,
}: {
  open: boolean
  title: string
  text: string
  action: string
  onAction: () => void
  // A second, quieter way on, e.g. "العودة للرئيسية"
  secondary?: { label: string; onAction: () => void }
}) {
  return (
    <Modal open={open} labelledBy="success-title" className="max-w-124">
      <div className="flex flex-col items-center gap-8 p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <Image
            src="/landing/auth-success.svg"
            alt=""
            width={63}
            height={64}
          />
          <div className="flex flex-col gap-4">
            <h2
              id="success-title"
              className="text-[22px] leading-5.5 font-bold text-ink"
            >
              {title}
            </h2>
            <p className="text-base leading-[1.3] font-medium text-muted">
              {text}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-3">
          <button
          type="button"
          autoFocus
          onClick={onAction}
          className="flex h-12 flex-1 items-center justify-center rounded-3xl bg-brand text-sm font-bold tracking-[-0.408px] text-white transition hover:bg-brand-dark"
        >
          {action}
          </button>
          {secondary && (
            <button
              type="button"
              onClick={secondary.onAction}
              className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white text-sm font-bold text-ink transition hover:bg-surface"
            >
              {secondary.label}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
