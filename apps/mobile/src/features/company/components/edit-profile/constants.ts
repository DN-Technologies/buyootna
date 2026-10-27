import { GOVERNORATES } from '@/shared/utils/data/locations';

export const KUWAIT_ACTIVITIES = [
  'تشطيبات،بناء،ديكور،كهرباء',
  'مقاولات عامة وبناء',
  'أعمال صحية وسباكة',
  'تكييف وتبريد',
  'تصميم داخلي وديكور',
  'صيانة مباني',
  'عقارات وتطوير عقاري',
];

// مناطق تقديم الخدمة: all of Kuwait, or a governorate -- the same
// governorates as the rest of the app (the companies filter matches them)
export const ALL_KUWAIT = 'جميع مناطق الكويت';
export const KUWAIT_AREAS = [
  ALL_KUWAIT,
  ...GOVERNORATES.map((governorate) => governorate.label),
];
