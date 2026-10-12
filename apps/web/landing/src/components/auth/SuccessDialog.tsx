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
}: {
  open: boolean
  title: string
  text: string
  action: string
  onAction: () => void
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
        <button
          type="button"
          autoFocus
          onClick={onAction}
          className="flex h-12 w-full items-center justify-center rounded-3xl bg-brand text-sm font-bold tracking-[-0.408px] text-white transition hover:bg-brand-dark"
        >
          {action}
        </button>
      </div>
    </Modal>
  )
}
