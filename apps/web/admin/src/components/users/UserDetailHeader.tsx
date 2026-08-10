'use client'

import { Fragment, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  ChevronDown,
  MapPin,
  Building2,
  Bell,
  BadgeCheck,
  Package,
  Ban,
  UserX,
} from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'

export interface UserDetailHeaderProps {
  name: string
  email: string
  accountType: string
  planLabel: string
  statusLabel: 'نشط' | 'محظور' | 'موقوف'
  avatarUrl?: string | null
  location?: string
  userId?: string
  isOffice?: boolean
  loading?: boolean
  onActionSelect?: (action: string) => void
}

const statusStyles: Record<string, string> = {
  نشط: 'bg-[rgba(18,194,129,0.1)] text-[#018B1B]',
  محظور: 'bg-[#FEF3F2] text-[#9C1E28]',
  موقوف: 'bg-[#FFFBEB] text-[#B45309]',
}

const breadcrumbs = ['الرئيسية', 'إدارة الحسابات', 'المستخدمون']

export default function UserDetailHeader({
  name,
  email,
  accountType,
  planLabel,
  statusLabel,
  avatarUrl,
  location = 'السالمية، شمال غرب صليبيخات',
  userId = 'USR-001',
  isOffice = false,
  loading = false,
  onActionSelect,
}: UserDetailHeaderProps) {
  const trail = [...breadcrumbs, loading ? '...' : name]
  const [actionsOpen, setActionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const actions = [
    { label: 'ارسال اشعار', icon: Bell, action: 'send_notification' },
    { label: 'وضع علامة التوثيق', icon: BadgeCheck, action: 'mark_verified' },
    { label: 'تغيير الباقة', icon: Package, action: 'change_package' },
    {
      label: 'تعطيل الحساب',
      icon: UserX,
      action: 'disable_account',
      className: 'text-[#B97500]',
    },
    {
      label: 'حظر المستخدم',
      icon: Ban,
      action: 'block_user',
      className: 'text-[#9C1E28]',
    },
  ]

  return (
    <div
      className="border-b border-[#ECECEC] flex flex-col gap-2 pb-4 pt-3 px-6 md:px-8 w-full text-right font-['Cairo'] relative"
      dir="rtl"
    >
      {/* Top Bar: Breadcrumb */}
      <div className="flex items-center justify-start gap-1.5 text-[14px]">
        {trail.map((crumb, idx) => (
          <Fragment key={idx}>
            <span
              className={
                idx === trail.length - 1
                  ? 'text-[#111111] font-normal'
                  : 'text-[#A0A0A0] font-normal'
              }
            >
              {crumb}
            </span>
            {idx < trail.length - 1 && (
              <ChevronLeft className="w-3 h-3 text-[#A0A0A0]" />
            )}
          </Fragment>
        ))}
      </div>

      {/* Back link */}
      <Link
        href="/users"
        className="flex items-center gap-1 text-[14px] text-[#111111] w-fit"
      >
        <ChevronRight className="w-3 h-3" />
        <span>العودة</span>
      </Link>

      {/* Title & Info row with Actions dropdown aligned next to Avatar/Info */}
      <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
        {/* User Info Cluster (Right side in RTL) */}
        <div className="flex items-center gap-4">
          {loading ? (
            <Skeleton className="size-16 rounded-full shrink-0" />
          ) : (
            <div className="relative rounded-full size-16 overflow-hidden bg-[#F1F5F9] border border-[#ECECEC] shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B6A6A] font-bold text-[20px]">
                  {name?.charAt(0) || '؟'}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3.5 flex-wrap">
              {loading ? (
                <>
                  <Skeleton className="h-7 w-36" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </>
              ) : (
                <>
                  <h1 className="font-bold text-[22px] text-[#111111]">{name}</h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-5 flex items-center gap-1 px-1.5 rounded-full text-[12px] font-medium ${
                        statusStyles[statusLabel] || statusStyles['نشط']
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>{statusLabel}</span>
                    </span>
                    <span className="h-5 flex items-center px-1.5 rounded-full text-[12px] font-medium bg-[#F7F2F6] text-[#344054]">
                      {planLabel}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-3.5 text-[14px] text-[#6B6A6A] font-medium flex-wrap">
              {loading ? (
                <Skeleton className="h-4 w-60" />
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-[#6B6A6A]" />
                    {email}
                  </span>

                  {isOffice ? (
                    <>
                      <span className="text-[#ECECEC]">|</span>
                      <span># {userId}</span>
                      <span className="text-[#ECECEC]">|</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#6B6A6A]" />
                        {location}
                      </span>
                      <span className="text-[#ECECEC]">|</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-[#6B6A6A]" />
                        {accountType}
                      </span>
                    </>
                  ) : (
                    <span>{accountType}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions Dropdown Button (Left side in RTL) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setActionsOpen((prev) => !prev)}
            className="border border-[#E2E8F0] bg-white text-[#111111] text-[14px] font-bold h-10 px-5 rounded-full flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>إجراءات</span>
            <ChevronDown className="w-4 h-4 text-[#111111]" />
          </button>

          {actionsOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-[#ECECEC] rounded-lg shadow-lg py-1 z-50 flex flex-col text-right">
              {actions.map((act) => {
                const Icon = act.icon
                return (
                  <button
                    key={act.action}
                    type="button"
                    onClick={() => {
                      setActionsOpen(false)
                      onActionSelect?.(act.action)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-[14px] font-medium hover:bg-slate-50 w-full text-right transition-colors ${
                      act.className || 'text-[#111111]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{act.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
