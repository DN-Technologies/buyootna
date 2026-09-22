'use client'

import { useEffect, useRef, useState } from 'react'
import type { ServiceItem } from '../UserServiceCard'
import AssignReportModal, { Moderator } from '../../reports/AssignReportModal'
import ReportSuccessToast from '../../reports/ReportSuccessToast'
import ServiceDetailHeader from './ServiceDetailHeader'
import ServiceReportDetailView from './ServiceReportDetailView'
import ServiceDetailsTab from './ServiceDetailsTab'
import ServiceReportsTab from './ServiceReportsTab'
import ServiceNotesTab from './ServiceNotesTab'
import { MOCK_REPORTS, INITIAL_NOTES } from './mockData'
import type { ReportItem, ServiceNoteItem, ServiceDetailTab } from './types'

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
  const [activeTab, setActiveTab] = useState<ServiceDetailTab>('التفاصيل')
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

  const handleEditNote = (noteId: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, content } : n)),
    )
  }

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right"
        dir="rtl"
      >
        <ServiceDetailHeader
          service={service}
          selectedReport={selectedReport}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBackFromReport={() => setSelectedReport(null)}
          onClose={onClose}
        />

        {/* Drawer Body Content */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {selectedReport ? (
            <ServiceReportDetailView
              report={selectedReport}
              onAssign={() => setAssignModalOpen(true)}
              onCloseReport={handleCloseReportAction}
              onDeleteService={() => {
                onDeleteService?.(service)
                onClose()
              }}
            />
          ) : activeTab === 'التفاصيل' ? (
            <ServiceDetailsTab
              isHidden={isHidden}
              isDeleted={isDeleted}
              reportsCount={reports.length}
            />
          ) : activeTab === 'البلاغات' ? (
            <ServiceReportsTab
              reports={reports}
              activeMenuId={activeMenuId}
              menuRef={menuRef}
              onToggleMenu={setActiveMenuId}
              onSelectReport={setSelectedReport}
              onAssign={() => setAssignModalOpen(true)}
              onCloseReport={handleCloseReportAction}
            />
          ) : (
            <ServiceNotesTab
              notes={notes}
              newNoteText={newNoteText}
              onNewNoteTextChange={setNewNoteText}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
            />
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
