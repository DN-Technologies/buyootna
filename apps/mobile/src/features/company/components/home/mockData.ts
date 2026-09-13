import { Ionicons } from '@expo/vector-icons';

export interface CompanyRequest {
  id: string;
  title: string;
  clientName: string;
  /** Formatted price range, e.g. "22,000 - 15,000 د.ك". Undefined renders "لم يحدد". */
  price?: string;
  location: string;
  description: string;
  attachmentsCount: number;
}

export const COMPANY_REQUESTS_MOCK: CompanyRequest[] = [
  {
    id: '1',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    price: '22,000 - 15,000 د.ك',
    location: 'السالمية',
    description:
      'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة، لوحة توزيع رئيسية وإضاءة LED مدمجة.',
    attachmentsCount: 3,
  },
  {
    id: '2',
    title: 'صيانة تكييف مركزي لمكتب',
    clientName: 'سارة المطيري',
    location: 'الجهراء',
    description:
      'مكتب إداري بمساحة 200م، يحتاج صيانة شاملة لنظام التكييف المركزي وتنظيف الدوائر.',
    attachmentsCount: 1,
  },
  {
    id: '3',
    title: 'تركيب كاميرات مراقبة لفيلا',
    clientName: 'محمد العجمي',
    price: '45,000 - 30,000 د.ك',
    location: 'الفروانية',
    description:
      'فيلا سكنية من طابقين، تحتاج تركيب 8 كاميرات مراقبة خارجية ونظام تسجيل يعمل 24 ساعة.',
    attachmentsCount: 2,
  },
];

export const PUBLIC_REQUESTS_MOCK: CompanyRequest[] = [
  {
    id: '1',
    title: 'تمديدات كهرباء لمحل تجاري',
    clientName: 'عبد الله القحطاني',
    price: '22,000 - 15,000 د.ك',
    location: 'السالمية',
    description:
      'محل ملابس بمساحة 120م، يحتاج تمديدات كهربائية كاملة، لوحة توزيع رئيسية وإضاءة LED مدمجة.',
    attachmentsCount: 3,
  },
  {
    id: '2',
    title: 'دهان وتشطيب لشقة سكنية',
    clientName: 'فهد العنزي',
    price: '12,000 - 8,000 د.ك',
    location: 'حولي',
    description:
      'شقة بمساحة 150م، تحتاج دهان كامل وتشطيب نهائي لجميع الغرف مع تركيب أرضيات باركيه.',
    attachmentsCount: 4,
  },
];

export interface HomeServiceChip {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const HOME_SERVICE_CHIPS_MOCK: HomeServiceChip[] = [
  {
    id: '1',
    label: 'مكاتب هندسية',
    icon: 'business-outline',
  },
  {
    id: '2',
    label: 'الأثاث',
    icon: 'bed-outline',
  },
  {
    id: '3',
    label: 'شبكات نت',
    icon: 'wifi-outline',
  },
  {
    id: '4',
    label: 'التكييف',
    icon: 'snow-outline',
  },
  {
    id: '5',
    label: 'مقاولات',
    icon: 'construct-outline',
  },
];
