// Deliberately mock: there is no Service model anywhere in the backend (the
// "services" feature itself is mock), so there is no real entity to attach
// a report to here. This sub-tab stays a static visual mockup, matching the
// same policy already applied to AdReportsTab.tsx before it got wired.
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

export type ServiceDetailTab = 'التفاصيل' | 'البلاغات' | 'الملاحظات'
