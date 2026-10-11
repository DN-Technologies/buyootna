// التخصص options, in the order of Figma 4410:167821
export const SPECIALTIES = [
  'مكتب هندسي',
  'دار استشارية',
  'التثمين العقاري',
  'مقاول عام / مقاول بناء',
  'مقاول ترميم وإضافة',
  'الهدم',
  'العوازل',
  'التشطيب',
  'التصميم الداخلي',
  'الديكور والجبس بورد',
  'الأصباغ (الصبغ)',
  'الأرضيات',
  'البلاط والانترلوك',
  'النجارة والأبواب',
  'المطابخ',
  'الألمنيوم والزجاج',
  'الحدادة والمظلات',
  'الستائر والتنجيد',
  'التكييف',
  'التهوية والشفط المركزي',
  'الأعمال الكهربائية',
  'الأعمال الصحية والسباكة',
  'المصاعد (اصنصيرات)',
  'أنظمة الإطفاء والإنذار',
  'الأنظمة الذكية والمراقبة',
  'إدارة الاملاك',
  'صيانة المباني',
  'التنظيف',
  'نقل العفش',
  'مكافحة الحشرات',
  'المسابح',
  'تنسيق الحدائق',
] as const;

// "الكل" ticks every listed type; "اخرى" is a service with its own title.
// The API knows "اخرى" by this exact spelling (OTHER_SERVICE_TYPE).
export const ALL_TYPES = 'الكل';
export const OTHER_TYPE = 'اخرى';

// نوع الخدمة per specialty. Only مكتب هندسي has a designed list (Figma
// 8455:24388); a specialty without one offers just الكل and اخرى.
const TYPES_BY_SPECIALTY: Record<string, string[]> = {
  'مكتب هندسي': [
    'مخطط معماري (المساقط)',
    'تصميم الواجهات',
    'مخططات تنفيذية',
    'مخططات التقديم للبلدية',
    'تصور ثلاثي الأبعاد (3D)',
    'مخطط إنشائي',
    'حسابات إنشائية',
    'تفاصيل التسليح',
    'مخططات الأساسات',
    'تقرير فحص التربة',
    'مخطط كهربائي وتوزيع الأحمال',
    'توزيع الإنارة',
    'مخططات التكييف',
  ],
};

/** The listed types of a specialty, without الكل / اخرى. */
export const listedTypes = (specialty: string): string[] =>
  TYPES_BY_SPECIALTY[specialty] ?? [];

/**
 * What the company is offering with this selection. "الكل" on a specialty
 * with no listed types stands for the specialty itself.
 */
export function typesToSend(specialty: string, selected: string[]): string[] {
  const listed = listedTypes(specialty);
  const chosen = listed.filter((type) => selected.includes(type));
  if (selected.includes(ALL_TYPES) && listed.length === 0) {
    chosen.push(specialty);
  }
  if (selected.includes(OTHER_TYPE)) chosen.push(OTHER_TYPE);
  return chosen;
}
