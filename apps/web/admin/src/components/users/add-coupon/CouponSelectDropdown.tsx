import React from 'react'
import { ChevronDown } from 'lucide-react'
import { AvailableCoupon } from './types'

interface CouponSelectDropdownProps {
  coupons: AvailableCoupon[]
  selectedCoupon: AvailableCoupon | null
  isOpen: boolean
  onToggle: () => void
  onSelectCoupon: (coupon: AvailableCoupon) => void
  dropdownRef: React.RefObject<HTMLDivElement | null>
}

export const CouponSelectDropdown: React.FC<CouponSelectDropdownProps> = ({
  coupons,
  selectedCoupon,
  isOpen,
  onToggle,
  onSelectCoupon,
  dropdownRef,
}) => {
  return (
    <div
      className="flex flex-col gap-2 items-start w-full relative"
      ref={dropdownRef}
    >
      <label className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
        اختر الكوبون
      </label>

      {/* Select Trigger Box */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full h-11.5 bg-white border border-[#ececec] rounded-lg px-3 flex items-center justify-between cursor-pointer select-none transition-colors hover:border-slate-300"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Arrow indicator */}
        <ChevronDown
          className={`size-4 text-[#6B6A6A] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />

        {/* Selected value or placeholder */}
        <div className="flex items-center gap-2 text-right">
          {selectedCoupon ? (
            <div className="flex items-center gap-2">
              <span className="font-['Cairo'] font-bold text-[14px] text-[#111111]">
                {selectedCoupon.name}
              </span>
              <span className="font-['Cairo'] font-medium text-[12px] text-[#6B6A6A]">
                ({selectedCoupon.code})
              </span>
            </div>
          ) : (
            <span className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#979797] tracking-[-0.408px]">
              اختر كود الخصم المناسب
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Options Popup (Figma Node 5634:71598) */}
      {isOpen && (
        <div
          className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#ececec] rounded-lg shadow-lg z-30 overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          {coupons.map((coupon) => {
            const isCurrent = selectedCoupon?.id === coupon.id
            return (
              <div
                key={coupon.id}
                onClick={() => onSelectCoupon(coupon)}
                className={`px-3 py-2.5 flex flex-col gap-1 items-start text-right hover:bg-[#F9FAFE] cursor-pointer transition-colors ${
                  isCurrent ? 'bg-[#F9FAFE]' : 'bg-white'
                }`}
                role="option"
                aria-selected={isCurrent}
              >
                <span className="font-['Cairo'] font-semibold text-[16px] leading-[1.3] text-[#111111]">
                  {coupon.name}
                </span>
                <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
                  {coupon.code}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CouponSelectDropdown
