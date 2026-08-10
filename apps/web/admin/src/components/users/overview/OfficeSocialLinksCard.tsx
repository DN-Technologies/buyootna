'use client'

import { Instagram, Twitter } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'

export interface OfficeSocialLinksCardProps {
  instagramUrl?: string
  xUrl?: string
  loading?: boolean
}

export default function OfficeSocialLinksCard({
  instagramUrl = 'https://www.instagram.com/almanar',
  xUrl = 'https://x.com/almanar',
  loading = false,
}: OfficeSocialLinksCardProps) {
  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg w-full font-['Cairo'] pb-4"
      dir="rtl"
    >
      <div className="border-b border-[#ECECEC] flex items-center h-14 px-5">
        <p className="font-semibold text-[16px] text-[#111111]">
          وسائل التواصل
        </p>
      </div>

      <div className="flex items-center gap-5 px-5 pt-4">
        {/* Instagram */}
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          <div className="bg-[#F5F7F9] rounded-md flex items-center justify-center shrink-0 size-7.5">
            <Instagram className="w-4 h-4 text-[#E4405F]" />
          </div>
          <div className="flex flex-col gap-1 text-right min-w-0 flex-1">
            <p className="text-[13px] font-medium text-[#6B6A6A]">
              انستجرام
            </p>
            {loading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-medium text-[#111111] tracking-[-0.408px] truncate hover:underline"
              >
                {instagramUrl || '—'}
              </a>
            )}
          </div>
        </div>

        <div className="w-px bg-[#ECECEC] h-10 shrink-0" />

        {/* X Platform */}
        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          <div className="bg-[#F5F7F9] rounded-md flex items-center justify-center shrink-0 size-7.5">
            <Twitter className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="flex flex-col gap-1 text-right min-w-0 flex-1">
            <p className="text-[13px] font-medium text-[#6B6A6A]">
              منصة x
            </p>
            {loading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <a
                href={xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-medium text-[#111111] tracking-[-0.408px] truncate hover:underline"
              >
                {xUrl || '—'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
