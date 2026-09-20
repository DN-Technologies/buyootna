'use client'

import React, { useRef, useState } from 'react'
import Image from 'next/image'
import { CloseIcon, FileArrowUpIcon } from '@/components/icons/AdminIcons'
import {
  AdminDashboardPendingVerification,
  formatRelativeArabicTime,
} from '@/lib/admin-dashboard'

export interface ReviewVerificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  request: AdminDashboardPendingVerification | null
  onApprove: (request: AdminDashboardPendingVerification) => void
  onRequestEdit?: (request: AdminDashboardPendingVerification) => void
  onReject?: (request: AdminDashboardPendingVerification) => void
  onRevoke?: (request: AdminDashboardPendingVerification) => void
}

export default function ReviewVerificationDrawer({
  isOpen,
  onClose,
  request,
  onApprove,
  onRequestEdit,
  onReject,
  onRevoke,
}: ReviewVerificationDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  if (!isOpen || !request) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const currentStatus = request.status || 'قيد الانتظار'

  const getStatusBadgeConfig = () => {
    if (currentStatus === 'موثق') {
      return {
        label: 'موثق',
        textColor: 'text-[#1791E7]',
        dotColor: 'bg-[#1791E7]',
        bgColor: 'bg-blue-50/60',
      }
    }
    if (currentStatus === 'مرفوض') {
      return {
        label: 'مرفوض',
        textColor: 'text-[#9C1E28]',
        dotColor: 'bg-[#9C1E28]',
        bgColor: 'bg-red-50/60',
      }
    }
    if (currentStatus === 'غير موثق') {
      return {
        label: 'غير موثق',
        textColor: 'text-[#6B6A6A]',
        dotColor: 'bg-[#6B6A6A]',
        bgColor: 'bg-gray-50',
      }
    }
    return {
      label: 'قيد الانتظار',
      textColor: 'text-[#B97500]',
      dotColor: 'bg-[#B97500]',
      bgColor: 'bg-amber-50/60',
    }
  }

  const statusConfig = getStatusBadgeConfig()
  const relativeTime =
    request.sentAt || formatRelativeArabicTime(request.createdAt) || 'منذ ساعة'

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" dir="rtl">
      {/* Backdrop matching Figma 2769:53170 */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container matching Figma 2772:54184 */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          className="w-125 max-w-[100vw] bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 border-l border-[#ECECEC]"
          data-node-id={currentStatus === 'موثق' ? '2772:54571' : '2772:54184'}
          data-name="add user default"
        >
          {/* Top Section */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Drawer Header matching Figma 2772:54187 & 2772:54574 */}
            <div
              className="p-5 border-b border-[#ECECEC] flex items-start justify-between bg-white"
              data-node-id={
                currentStatus === 'موثق' ? '2772:54574' : '2772:54187'
              }
              data-name="deawer title"
            >
              {/* Close Button on Left */}
              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full flex items-center justify-center text-[#6B6A6A] hover:text-[#111111] hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54576' : undefined
                }
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              {/* Title & Subtitle Info on Right */}
              <div
                className="flex flex-col gap-1 items-end justify-center text-right"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54578' : undefined
                }
              >
                <h2
                  className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-tight"
                  data-node-id={
                    currentStatus === 'موثق' ? '2772:54579' : undefined
                  }
                >
                  مراجعة طلب التوثيق
                </h2>
                <div
                  className="flex items-center gap-2 mt-0.5"
                  data-node-id={
                    currentStatus === 'موثق' ? '2772:54580' : undefined
                  }
                >
                  {/* Company/User name + time */}
                  <span
                    className="font-['Cairo'] font-normal text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]"
                    data-node-id={
                      currentStatus === 'موثق' ? '2772:54585' : undefined
                    }
                  >
                    {request.name} · {relativeTime}
                  </span>

                  {/* Status Badge with colored dot matching Figma 2772:54232 & 2772:54801 */}
                  <div
                    className="flex items-center gap-1 h-5 py-0.5"
                    data-node-id={
                      currentStatus === 'موثق' ? '2772:54801' : undefined
                    }
                  >
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${statusConfig.dotColor}`}
                      data-node-id={
                        currentStatus === 'موثق' ? '2772:54803' : undefined
                      }
                    />
                    <span
                      className={`font-['Cairo'] font-medium text-[12px] leading-none ${statusConfig.textColor}`}
                      data-node-id={
                        currentStatus === 'موثق' ? '2772:54802' : undefined
                      }
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Content Fields matching Figma 2772:54197 & 2772:54586 */}
            <div
              className="px-5 py-6 flex flex-col gap-6"
              data-node-id={
                currentStatus === 'موثق' ? '2772:54586' : '2772:54197'
              }
            >
              {/* License Number (if available or office) matching Figma 2772:54198 */}
              {(request.licenseNumber || request.type === 'مكتب عقاري') && (
                <>
                  <div className="flex flex-col gap-3 items-end text-right">
                    <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-none">
                      رقم الرخصة
                    </span>
                    <span className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal">
                      {request.licenseNumber || '74978930863'}
                    </span>
                  </div>
                  <div className="h-px bg-[#ECECEC] w-full" />
                </>
              )}

              {/* License Activity matching Figma 2769:53185 & 2772:54587 */}
              <div
                className="flex flex-col gap-3 items-end text-right"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54587' : undefined
                }
              >
                <span
                  className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-none"
                  data-node-id={
                    currentStatus === 'موثق' ? '2772:54588' : undefined
                  }
                >
                  نشاط الرخصة
                </span>
                <span
                  className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal"
                  data-node-id={
                    currentStatus === 'موثق' ? '2772:54589' : undefined
                  }
                >
                  {request.licenseActivity || 'تنفيذ وتشطيب'}
                </span>
              </div>

              <div
                className="h-px bg-[#ECECEC] w-full"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54590' : undefined
                }
              />

              {/* License Expiry Date matching Figma 2769:53189 & 2772:54591 */}
              <div
                className="flex flex-col gap-3 items-end text-right"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54591' : undefined
                }
              >
                <span
                  className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-none"
                  data-node-id={
                    currentStatus === 'موثق' ? '2772:54592' : undefined
                  }
                >
                  تاريخ انتهاء الرخصة
                </span>
                <span
                  className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal"
                  data-node-id={
                    currentStatus === 'موثق' ? '2772:54593' : undefined
                  }
                >
                  {request.licenseExpiry || '17 مارس 2028'}
                </span>
              </div>

              <div
                className="h-px bg-[#ECECEC] w-full"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54594' : undefined
                }
              />

              {/* License Image Dropzone matching Figma 2769:53193 & 2772:54595 */}
              <div
                className="flex flex-col gap-3 items-end text-right"
                data-node-id={
                  currentStatus === 'موثق' ? '2772:54595' : undefined
                }
                data-name="image"
              >
                <span
                  className="font-['Cairo'] font-medium text-[14px] text-black leading-none"
                  data-node-id={
                    currentStatus === 'موثق'
                      ? 'I2772:54595;622:20487'
                      : undefined
                  }
                >
                  صورة الرخصة
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/svg+xml,image/jpeg,image/png"
                  className="hidden"
                />

                {previewUrl || request.logoUrl ? (
                  <div className="border border-[#ECECEC] rounded-lg p-3 w-full flex items-center justify-between bg-slate-50/50">
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs font-['Cairo'] text-[#9C1E28] hover:underline cursor-pointer"
                    >
                      إزالة / تغيير
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col text-right">
                        <span className="font-['Cairo'] font-medium text-[13px] text-[#111111] truncate max-w-50">
                          {selectedFile?.name || 'license_document.png'}
                        </span>
                        <span className="font-['Cairo'] text-[11px] text-[#6B6A6A]">
                          {selectedFile
                            ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                            : 'صورة الرخصة المرفقة'}
                        </span>
                      </div>
                      <div className="relative size-12 rounded border border-[#ECECEC] overflow-hidden bg-white shrink-0">
                        <Image
                          src={previewUrl || request.logoUrl || ''}
                          alt="License Document Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white border border-[#D7D7D7] border-dashed rounded-sm px-6 py-4 flex flex-col items-center justify-center w-full cursor-pointer hover:bg-[#FBFBFB] transition-colors group"
                    data-node-id={
                      currentStatus === 'موثق'
                        ? 'I2772:54595;622:20488'
                        : undefined
                    }
                    data-name="File Upload Dropzone"
                  >
                    <div
                      className="flex flex-col gap-2 items-center justify-center w-full"
                      data-node-id={
                        currentStatus === 'موثق'
                          ? 'I2772:54595;622:20489'
                          : undefined
                      }
                    >
                      {/* Icon Circle */}
                      <div
                        className="bg-[#F5F7F9] rounded-[123px] size-12 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        data-node-id={
                          currentStatus === 'موثق'
                            ? 'I2772:54595;622:20490'
                            : undefined
                        }
                        data-name="Icon Container"
                      >
                        <FileArrowUpIcon className="w-6 h-6 text-primary" />
                      </div>

                      {/* Prompt */}
                      <p
                        className="font-['Cairo'] text-center"
                        data-node-id={
                          currentStatus === 'موثق'
                            ? 'I2772:54595;762:27396'
                            : undefined
                        }
                      >
                        <span className="font-bold text-primary text-[14px] tracking-[-0.408px]">
                          اضغط هنا
                        </span>{' '}
                        <span className="font-medium text-[#111111] text-[14px] tracking-[-0.408px]">
                          لرفع صورة
                        </span>
                      </p>

                      {/* Hint */}
                      <p
                        className="font-['Cairo'] font-medium text-[12px] text-[#6B6A6A] text-center"
                        data-node-id={
                          currentStatus === 'موثق'
                            ? 'I2772:54595;622:20494'
                            : undefined
                        }
                      >
                        الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions matching Figma 2772:54211 & 2772:54596 */}
          {currentStatus === 'موثق' ? (
            <div
              className="border-t border-[#ECECEC] px-5 py-4 flex items-center bg-white w-full"
              data-node-id="2772:54596"
            >
              {/* Revoke Action: إلغاء التوثيق matching Figma node 2772:54597 */}
              <button
                type="button"
                onClick={() =>
                  onRevoke ? onRevoke(request) : onReject?.(request)
                }
                className="flex-1 h-11.5 bg-white border border-[#9C1E28] hover:bg-red-50/50 text-[#9C1E28] rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                data-node-id="2772:54597"
                data-name="Component 3"
              >
                إلغاء التوثيق
              </button>
            </div>
          ) : (
            <div
              className="border-t border-[#ECECEC] px-5 py-4 flex items-center gap-3 bg-white w-full"
              data-node-id="2772:54211"
            >
              {/* Primary Action: اعتماد التوثيق */}
              <button
                type="button"
                onClick={() => onApprove(request)}
                className="flex-1 h-12 bg-primary hover:bg-[#1E4368] text-white rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                اعتماد التوثيق
              </button>

              {/* Secondary Action: طلب تعديل */}
              <button
                type="button"
                onClick={() => onRequestEdit?.(request)}
                className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                طلب تعديل
              </button>

              {/* Danger Action: رفض الطلب */}
              <button
                type="button"
                onClick={() => onReject?.(request)}
                className="flex-1 h-11.5 bg-white border border-[#9C1E28] hover:bg-red-50/50 text-[#9C1E28] rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              >
                رفض الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
