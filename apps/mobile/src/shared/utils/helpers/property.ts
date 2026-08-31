export const formatTimeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  } catch {
    return 'منذ فترة';
  }
};

export const getArabicTypeLabel = (type?: string | null): string => {
  if (!type) return '';
  const key = type.toUpperCase();
  switch (key) {
    case 'SALE':
      return 'للبيع';
    case 'RENT':
      return 'للإيجار';
    case 'EXCHANGE':
      return 'للبدل';
    default:
      return type;
  }
};

export const getArabicCategoryLabel = (cat?: string | null): string => {
  if (!cat) return '';
  const key = cat.toUpperCase();
  switch (key) {
    case 'APARTMENT':
      return 'شقة';
    case 'HOUSE':
      return 'بيت';
    case 'VILLA':
      return 'فيلا';
    case 'DUPLIX':
      return 'دوبلكس';
    case 'LAND':
      return 'أرض';
    case 'BUILDING':
      return 'عمارة';
    case 'OFFICE':
      return 'مكتب';
    case 'CHALET':
      return 'شاليه';
    case 'FARM':
      return 'مزرعة';
    case 'REST_HOUSE':
      return 'استراحة';
    case 'RESIDENTIAL':
      return 'عقار سكني';
    case 'COMMERCIAL':
      return 'عقار تجاري';
    case 'INVESTMENT':
      return 'عقار استثماري';
    default:
      return cat;
  }
};

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const formatArabicDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate();
    const month = ARABIC_MONTHS[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '';
  }
};
