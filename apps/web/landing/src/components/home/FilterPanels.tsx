'use client'

import Image from 'next/image'
import { useCallback, useRef, useState, type ReactNode } from 'react'

import { useDismiss } from '@/lib/useDismiss'

export interface Option {
  id: string
  label: string
}

interface FilterFieldProps {
  label: string
  // What is picked, shown in place of the label; empty when nothing is
  summary?: string
  disabled?: boolean
  // The panel that opens under the field
  children: ReactNode
}

/**
 * One field of the search bar: its label (or what was picked) and a round
 * chevron; pressing it opens a panel underneath.
 */
export function FilterField({
  label,
  summary,
  disabled,
  children,
}: FilterFieldProps) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)

  return (
    <div
      ref={container}
      className="relative min-w-0 flex-1 border-line lg:w-47.5 lg:flex-none lg:border-r lg:first:border-r-0"
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11.5 w-full items-center justify-between gap-2 pr-4 pl-4.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={`truncate text-base font-semibold ${summary ? 'text-ink' : 'text-muted'}`}
        >
          {summary || label}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface">
          <Image
            src="/landing/select-chevron.svg"
            alt=""
            width={18}
            height={18}
            className={open ? 'rotate-180 transition' : 'transition'}
          />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute top-full right-0 z-30 mt-3 w-82.5 max-w-[calc(100vw-40px)] rounded-lg bg-white px-4 pt-6 pb-3 shadow-[0_8px_24px_rgba(33,37,41,0.16),0_0_1px_rgba(33,37,41,0.2)]"
        >
          {children}
        </div>
      )}
    </div>
  )
}

/** The divider and "مسح الكل" at the bottom of every panel. */
function PanelFooter({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-4 border-t border-line pt-1">
      <button
        type="button"
        onClick={onClear}
        className="flex h-10 items-center px-3 text-sm font-bold text-brand"
      >
        مسح الكل
      </button>
    </div>
  )
}

interface ChipPanelProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  // Shown when there is nothing to pick yet, e.g. no governorate chosen
  emptyText?: string
}

/** A wrap of chips where any number can be picked. */
export function ChipPanel({
  options,
  selected,
  onChange,
  emptyText,
}: ChipPanelProps) {
  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    )

  return (
    <>
      {options.length > 0 ? (
        <div className="panel-scroll flex max-h-65 flex-wrap gap-3 overflow-y-auto">
          {options.map((option) => {
            const active = selected.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(option.id)}
                className={`flex h-8 items-center rounded-2xl border px-3 text-sm font-medium text-ink transition ${
                  active
                    ? 'border-brand bg-surface'
                    : 'border-line bg-white hover:bg-surface'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-sm font-medium text-muted">{emptyText}</p>
      )}
      <PanelFooter onClear={() => onChange([])} />
    </>
  )
}

interface PricePanelProps {
  min: string
  max: string
  onChange: (range: { min: string; max: string }) => void
}

const digitsOnly = (text: string) => text.replace(/[^\d]/g, '')
const withCommas = (digits: string) =>
  digits ? Number(digits).toLocaleString('en-US') : ''

/** السعر: a from/to range in KWD. */
export function PricePanel({ min, max, onChange }: PricePanelProps) {
  const inputClass =
    'h-11 w-full min-w-0 flex-1 rounded-xl border border-line px-4 text-sm text-[#121212] outline-none placeholder:text-[#989898] focus:border-brand'

  return (
    <>
      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium text-ink">السعر</span>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            aria-label="السعر من"
            placeholder="السعر (د.ك) من"
            value={withCommas(min)}
            onChange={(event) =>
              onChange({ min: digitsOnly(event.target.value), max })
            }
            className={inputClass}
          />
          <input
            type="text"
            inputMode="numeric"
            aria-label="السعر إلى"
            placeholder="السعر (د.ك) إلى"
            value={withCommas(max)}
            onChange={(event) =>
              onChange({ min, max: digitsOnly(event.target.value) })
            }
            className={inputClass}
          />
        </div>
      </div>
      <PanelFooter onClear={() => onChange({ min: '', max: '' })} />
    </>
  )
}

/** What a field shows for a selection: the one label, or "label (n)". */
export function summarize(
  label: string,
  selected: string[],
  options: Option[],
): string {
  if (selected.length === 0) return ''
  if (selected.length === 1) {
    return options.find((option) => option.id === selected[0])?.label ?? label
  }
  return `${label} (${selected.length})`
}
