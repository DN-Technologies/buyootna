import { ReportItem, ServiceNoteItem } from './types'

export const MOCK_REPORTS: ReportItem[] = [
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

export const INITIAL_NOTES: ServiceNoteItem[] = [
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
