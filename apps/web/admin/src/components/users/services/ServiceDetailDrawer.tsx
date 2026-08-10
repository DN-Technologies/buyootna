'use client'

import { useState, useRef, useEffect } from 'react'
import {
  X,
  ChevronRight,
  ExternalLink,
  FileText,
  MoreVertical,
  UserCheck,
  CheckCircle,
  FileSpreadsheet,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import type { ServiceItem } from './UserServiceCard'
import AssignReportModal, { Moderator } from '../reports/AssignReportModal'
import ReportSuccessToast from '../reports/ReportSuccessToast'

export interface ReportItem {
  id: string
  code: string
  title: string
  reporterName: string
  reporterEmail: string
  reporterPhone: string
  timeAgo: string
  date: string
  status: 'open' | 'closed'
  priority: 'high' | 'medium' | 'low'
  reason: string
  details: string
  attachments: { name: string; url: string; type: 'pdf' | 'img' }[]
}

export interface ServiceNoteItem {
  id: string
  title?: string
  content: string
  author: string
  date: string
}

const MOCK_REPORTS: ReportItem[] = [
  {
    id: 'REP-101',
    code: 'RP-1025',
    title: 'معلومات غير صحيحة',
    reporterName: 'محمد المالك',
    reporterEmail: 'mohamedelgareh@gmail.com',
    reporterPhone: '+96568690396',
    timeAgo: 'منذ 47 دقيقة',
    date: '15 يناير 2024',
    status: 'open',
    priority: 'medium',
    reason: 'خدمة وهمية لم تقدم لي الشركة الخدمة بعد الاتفاق',
    details:
      'أرغب بالبدل في منطقة "خيران السكنية" أو "المنطقة العاشرة" ▪ بفضل زاوية أو شارع واحد ▪ مستعد للتفاوض مع المواقع المميزة في خيران الأرض في موقع مميز جداً بضاحية N5، قريبة من مجمع الخدمات والمسجد. مدخل ومخرج سهل جداً من الطريق الرئيسي. الرغبة جادة جداً للبدل في خيران السكنية لدواعي القرب من الأهل.',
    attachments: [
      { name: 'تقرير_الفحص.pdf', url: '#', type: 'pdf' },
      { name: 'صورة_الكهرباء.jpg', url: '#', type: 'img' },
    ],
  },
  {
    id: 'REP-102',
    code: 'RP-1026',
    title: 'معلومات غير صحيحة',
    reporterName: 'محمد المالك',
    reporterEmail: 'mohamedelgareh@gmail.com',
    reporterPhone: '+96568690396',
    timeAgo: 'منذ 47 دقيقة',
    date: '15 يناير 2024',
    status: 'open',
    priority: 'low',
    reason: 'بيانات الاتصال غير صحيحة',
    details:
      'المعلومات الموجودة في إعلان الخدمة لا تتوافق مع الخدمة الفعلية المقدمة.',
    attachments: [{ name: 'صورة_الكهرباء.jpg', url: '#', type: 'img' }],
  },
  {
    id: 'REP-103',
    code: 'RP-1027',
    title: 'معلومات غير صحيحة',
    reporterName: 'محمد المالك',
    reporterEmail: 'mohamedelgareh@gmail.com',
    reporterPhone: '+96568690396',
    timeAgo: 'منذ 47 دقيقة',
    date: '15 يناير 2024',
    status: 'closed',
    priority: 'low',
    reason: 'تم التعامل مع البلاغ',
    details: 'تم حل المشكلة وتحديث تفاصيل الخدمة.',
    attachments: [],
  },
]

const INITIAL_NOTES: ServiceNoteItem[] = [
  {
    id: 'NOTE-1',
    title: 'حذف الخدمة',
    content:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    author: 'نواف الجارحي',
    date: 'منذ أسبوعين',
  },
  {
    id: 'NOTE-2',
    title: 'اخفاء الخدمة',
    content:
      'تعاملت مع أركان لتصميم واجهة قسيمتي في خيران، والنتيجة كانت مدهشة جداً. الالتزام بالمواعيد وسعة صدر المهندسين كانت أفضل ميزة.',
    author: 'نواف الجارحي',
    date: '15 يناير 2024',
  },
]

export interface ServiceDetailDrawerProps {
  open: boolean
  service: ServiceItem | null
  onClose: () => void
  onHideService?: (service: ServiceItem) => void
  onDeleteService?: (service: ServiceItem) => void
}

export default function ServiceDetailDrawer({
  open,
  service,
  onClose,
  onHideService,
  onDeleteService,
}: ServiceDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    'التفاصيل' | 'البلاغات' | 'الملاحظات'
  >('التفاصيل')
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const [reports, setReports] = useState<ReportItem[]>(MOCK_REPORTS)
  const [notes, setNotes] = useState<ServiceNoteItem[]>(INITIAL_NOTES)
  const [newNoteText, setNewNoteText] = useState('')

  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!open || !service) return null

  const isHidden = service.status === 'hidden'
  const isDeleted = service.status === 'deleted'

  const handleAssignModerator = (moderator: Moderator) => {
    setToastMessage(`تم إسناد البلاغ للمشرف ${moderator.name} بنجاح.`)
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handleCloseReportAction = () => {
    setToastMessage('تم وضع علامة تم الحل (مغلق) للبلاغ بنجاح.')
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handleAddNote = () => {
    if (!newNoteText.trim()) return
    const newNote: ServiceNoteItem = {
      id: `NOTE-${Date.now()}`,
      content: newNoteText.trim(),
      author: 'نواف الجارحي',
      date: 'الآن',
    }
    setNotes((prev) => [newNote, ...prev])
    setNewNoteText('')
  }

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  const openReportsCount = reports.filter((r) => r.status === 'open').length
  const closedReportsCount = reports.filter((r) => r.status === 'closed').length

  const statusBadge =
    service.status === 'active' ? (
      <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
        نشطة
      </span>
    ) : isHidden ? (
      <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[12px] font-medium">
        مخفية
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3F2] text-[#9C1E28] text-[12px] font-medium">
        محذوفة
      </span>
    )

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#ECECEC] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between w-full">
            {selectedReport ? (
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="flex items-center gap-1 text-[14px] text-[#111111] font-medium hover:underline cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>العودة إلى البلاغات</span>
              </button>
            ) : (
              <h2 className="text-[16px] font-bold text-[#111111]">
                {service.title}
              </h2>
            )}

            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedReport && (
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <span className="text-[12px] font-medium text-[#6B6A6A]">
                نشرت في 15 يناير 2024
              </span>
              {statusBadge}
            </div>
          )}

          {/* Drawer Navigation Tabs */}
          {!selectedReport && (
            <div className="flex items-center gap-6 border-b border-[#ECECEC] pt-3">
              {(['التفاصيل', 'البلاغات', 'الملاحظات'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 text-[15px] font-medium transition-colors border-b-2 cursor-pointer ${
                    activeTab === tab
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-[#6B6A6A] hover:text-[#111111]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {selectedReport ? (
            /* Report Sub-view (Figma Node 4043:148661) */
            <div className="flex flex-col gap-6 text-right">
              {/* Sub-view Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-[16px] text-[#111111]">
                  بلاغ #{selectedReport.code} · {selectedReport.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
                    مفتوح
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-[12px] font-medium">
                    متوسط
                  </span>
                </div>
              </div>

              {/* Submitter Box */}
              <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2">
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  مقدم البلاغ
                </span>
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[15px] flex items-center justify-center shrink-0">
                      م
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-bold text-[#111111]">
                        {selectedReport.reporterName}
                      </span>
                      <span className="text-[12px] font-medium text-[#6B6A6A]">
                        {selectedReport.reporterEmail} ·{' '}
                        {selectedReport.reporterPhone}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      alert(`الانتقال إلى ملف ${selectedReport.reporterName}`)
                    }
                    className="text-[#6B6A6A] hover:text-primary p-1 cursor-pointer"
                    title="عرض ملف المستخدم"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  سبب البلاغ
                </span>
                <span className="text-[14px] font-bold text-[#111111]">
                  {selectedReport.reason}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  التفاصيل
                </span>
                <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC]">
                  {selectedReport.details}
                </p>
              </div>

              {/* Attachments */}
              {selectedReport.attachments.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    المرفقات
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedReport.attachments.map((att, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => alert(`معاينة ${att.name}`)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#ECECEC] text-[13px] font-medium text-[#111111] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#6B6A6A]" />
                        <span>{att.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-view Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#ECECEC]">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="h-11 w-full px-4 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
                >
                  اسناد لمسؤول
                </button>
                <button
                  type="button"
                  onClick={handleCloseReportAction}
                  className="h-11 w-full px-4 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
                >
                  اغلاق البلاغ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteService?.(service)
                    onClose()
                  }}
                  className="h-11 w-full px-4 bg-white border border-[#9C1E28] hover:bg-red-50 text-[#9C1E28] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
                >
                  حذف الخدمة
                </button>
              </div>
            </div>
          ) : activeTab === 'التفاصيل' ? (
            /* Details Tab */
            <div className="flex flex-col gap-6">
              {/* Deactivation Info Box */}
              {(isHidden || isDeleted) && (
                <div className="bg-[#F8FAFC] border-r-4 border-r-[#9C1E28] border-y border-l border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">
                      {isHidden ? 'تاريخ الاخفاء' : 'تاريخ الحذف'}
                    </span>
                    <span className="font-bold text-[#111111]">
                      12 يوليو 2026
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">بواسطة</span>
                    <span className="font-bold text-[#111111]">
                      أحمد سالم (مشرف)
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-[13px] pt-1">
                    <span className="text-[#6B6A6A]">السبب</span>
                    <span className="font-medium text-[#111111]">
                      الكثير من البلاغات بسبب سوء المعاملة.
                    </span>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
                  <span className="text-[12px] text-[#6B6A6A]">التصنيف</span>
                  <span className="font-bold text-[14px] text-[#111111]">
                    تنفيذ وتصميم
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
                  <span className="text-[12px] text-[#6B6A6A]">مرات الطلب</span>
                  <span className="font-bold text-[14px] text-[#111111]">
                    10
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
                  <span className="text-[12px] text-[#6B6A6A]">
                    تاريخ الإضافة
                  </span>
                  <span className="font-bold text-[14px] text-[#111111]">
                    15 يناير 2024
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
                  <span className="text-[12px] text-[#6B6A6A]">آخر تحديث</span>
                  <span className="font-bold text-[14px] text-[#111111]">
                    15 يناير 2024
                  </span>
                </div>
              </div>

              {/* Reports Stat */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex items-center justify-between">
                <span className="text-[13px] text-[#6B6A6A]">البلاغات</span>
                <span className="font-bold text-[16px] text-[#9C1E28]">
                  {reports.length}
                </span>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-[15px] text-[#111111]">الوصف</h4>
                <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#ECECEC]">
                  شقة فاخرة للبيع في قلب السالمية، تتميز بتصميم معماري حديث
                  وتشطيبات سوبر لوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة
                  بانورامية على الخليج العربي، موقع البرج حيوي جداً وقريب من
                  المجمعات التجارية والخدمات الرئيسية.
                </p>
              </div>
            </div>
          ) : activeTab === 'البلاغات' ? (
            /* Reports Tab (Figma Node 4043:148323) */
            reports.length === 0 ? (
              /* Empty Reports Graphic (Figma Node 4043:148323) */
              <div className="flex flex-col items-center justify-center text-center py-20 gap-3 my-auto">
                <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#111111]">
                  <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h4 className="font-bold text-[18px] text-[#111111] mt-2">
                  لا توجد أي بلاغات للخدمة
                </h4>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Summary Strip */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[12px] text-[#6B6A6A]">
                      إجمالي البلاغات
                    </span>
                    <span className="font-bold text-[16px] text-[#111111]">
                      {reports.length}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[12px] text-[#6B6A6A]">
                      بلاغات مفتوحة
                    </span>
                    <span className="font-bold text-[16px] text-[#047857]">
                      {openReportsCount}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[12px] text-[#6B6A6A]">
                      بلاغات مغلقة
                    </span>
                    <span className="font-bold text-[16px] text-[#6B6A6A]">
                      {closedReportsCount}
                    </span>
                  </div>
                </div>

                {/* Reports Cards List */}
                <div className="space-y-3">
                  {reports.map((rep) => {
                    const isMenuOpen = activeMenuId === rep.id

                    return (
                      <div
                        key={rep.id}
                        className="bg-white border border-[#ECECEC] rounded-xl p-4 flex items-center justify-between text-right relative shadow-xs"
                      >
                        <div className="flex flex-col gap-1">
                          <h5 className="font-bold text-[14px] text-[#111111]">
                            {rep.title} · #{rep.code}
                          </h5>
                          <p className="text-[12px] text-[#6B6A6A]">
                            {rep.reporterName} · {rep.timeAgo}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                rep.status === 'open'
                                  ? 'bg-[#ECFDF5] text-[#047857]'
                                  : 'bg-[#F8FAFC] text-[#6B6A6A]'
                              }`}
                            >
                              {rep.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-[11px] font-medium">
                              {rep.priority === 'medium' ? 'متوسط' : 'منخفضة'}
                            </span>
                          </div>
                        </div>

                        {/* Report Card Popover Options */}
                        <div className="relative" ref={menuRef}>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : rep.id)
                            }
                            className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute left-0 mt-1 w-44 bg-white border border-[#ECECEC] rounded-xl shadow-lg py-1 z-30 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  setSelectedReport(rep)
                                }}
                                className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-end gap-2 font-medium"
                              >
                                <span>عرض التفاصيل</span>
                                <FileText className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  setAssignModalOpen(true)
                                }}
                                className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-end gap-2 font-medium"
                              >
                                <span>اسناد لمسؤول</span>
                                <UserCheck className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  handleCloseReportAction()
                                }}
                                className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-end gap-2 font-medium"
                              >
                                <span>إغلاق البلاغ</span>
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          ) : (
            /* Notes Tab (Figma Nodes 4043:146092 & 4043:147168) */
            <div className="flex flex-col gap-6 flex-1 justify-between">
              {notes.length === 0 ? (
                /* Empty Notes Graphic (Figma Node 4043:146092) */
                <div className="flex flex-col items-center justify-center text-center py-12 gap-3 my-auto">
                  <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#6B6A6A]">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-[18px] text-[#111111]">
                    لا توجد أي ملاحظات حالياً
                  </h4>
                  <p className="text-[13px] text-[#6B6A6A] max-w-xs leading-relaxed">
                    ستظهر الملاحظات هنا فور اضافتها من المشرفين.
                  </p>
                </div>
              ) : (
                /* Notes List Items (Figma Node 4043:147168) */
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2 relative shadow-xs text-right"
                    >
                      <div className="flex items-center justify-between">
                        {note.title && (
                          <h5 className="font-bold text-[15px] text-[#111111]">
                            {note.title}
                          </h5>
                        )}
                        <div className="flex items-center gap-1 mr-auto">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedText = prompt(
                                'تعديل الملاحظة:',
                                note.content,
                              )
                              if (updatedText !== null && updatedText.trim()) {
                                setNotes((prev) =>
                                  prev.map((n) =>
                                    n.id === note.id
                                      ? { ...n, content: updatedText.trim() }
                                      : n,
                                  ),
                                )
                              }
                            }}
                            className="p-1 text-primary hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                            title="تعديل الملاحظة"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-[#9C1E28] hover:bg-red-50 rounded-md cursor-pointer transition-colors"
                            title="حذف الملاحظة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[13px] text-[#6B6A6A] leading-relaxed">
                        {note.content}
                      </p>

                      <div className="text-[12px] text-[#A0A0A0] font-medium pt-1">
                        {note.author} · {note.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Note Form Box */}
              <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-3 shrink-0 mt-auto">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="اكتب ملاحظة داخلية..."
                  rows={3}
                  className="w-full text-[13px] text-[#111111] bg-white border border-[#ECECEC] rounded-lg p-3 focus:outline-none focus:border-primary resize-none placeholder:text-[#A0A0A0]"
                />

                <div className="flex items-center gap-2 justify-start">
                  <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className={`h-10 px-5 rounded-full text-[13px] font-bold text-white transition-colors ${
                      newNoteText.trim()
                        ? 'bg-primary hover:bg-[#0f243a] cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    اضف الملاحظة
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewNoteText('')}
                    className="h-10 px-5 rounded-full border border-[#ECECEC] bg-white hover:bg-slate-50 text-[#111111] text-[13px] font-bold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Sticky Bottom Action Bar */}
        {!selectedReport && !isDeleted && activeTab !== 'الملاحظات' && (
          <div className="p-6 border-t border-[#ECECEC] flex items-center gap-3 bg-white shrink-0">
            <button
              type="button"
              onClick={() => {
                onHideService?.(service)
                onClose()
              }}
              className="h-11 w-full px-6 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              {isHidden ? 'اعادة النشر' : 'اخفاء'}
            </button>

            <button
              type="button"
              onClick={() => {
                onDeleteService?.(service)
                onClose()
              }}
              className="h-11 w-full px-6 bg-white border border-[#9C1E28] hover:bg-red-50 text-[#9C1E28] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              حذف
            </button>
          </div>
        )}
      </div>

      {/* Assign Report Modal */}
      {assignModalOpen && (
        <AssignReportModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssignModerator}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <ReportSuccessToast
          message={toastMessage}
          onUndo={() => alert('تم التراجع عن الإجراء بنجاح.')}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
