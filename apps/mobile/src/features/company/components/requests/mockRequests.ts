import { CompanyRequestItem } from './types';

export const MOCK_COMPANY_REQUESTS: CompanyRequestItem[] = [
  {
    id: 'req-1',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    priceRange: '22,000 - 15,000 د.ك',
    location: 'السالمية',
    attachmentsCount: 3,
    description:
      'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة، لوحة توزيع...',
    status: 'pending',
    scope: 'company',
  },
  {
    id: 'req-2',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    priceRange: '22,000 - 15,000 د.ك',
    location: 'السالمية',
    attachmentsCount: 3,
    description:
      'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة، لوحة توزيع...',
    status: 'responded',
    scope: 'company',
  },
  {
    id: 'req-3',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    priceRange: '22,000 - 15,000 د.ك',
    location: 'السالمية',
    attachmentsCount: 3,
    description:
      'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة، لوحة توزيع...',
    status: 'accepted',
    scope: 'company',
  },
  {
    id: 'req-4',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    priceRange: '22,000 - 15,000 د.ك',
    location: 'السالمية',
    attachmentsCount: 3,
    description:
      'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة، لوحة توزيع...',
    status: 'accepted',
    scope: 'company',
  },
  // Public scope requests
  {
    id: 'req-pub-1',
    title: 'صيانة تكييف مركزي لمكتب',
    clientName: 'سارة المطيري',
    priceRange: '18,000 - 12,000 د.ك',
    location: 'الجهراء',
    attachmentsCount: 2,
    description:
      'مكتب إداري بمساحة 200م، يحتاج صيانة شاملة لنظام التكييف المركزي وتنظيف الدوائر.',
    status: 'pending',
    scope: 'public',
  },
  {
    id: 'req-pub-2',
    title: 'تركيب كاميرات مراقبة لفيلا',
    clientName: 'محمد العجمي',
    priceRange: '45,000 - 30,000 د.ك',
    location: 'الفروانية',
    attachmentsCount: 4,
    description:
      'فيلا سكنية من طابقين، تحتاج تركيب 8 كاميرات مراقبة خارجية ونظام تسجيل يعمل 24 ساعة.',
    status: 'accepted',
    scope: 'public',
  },
];
