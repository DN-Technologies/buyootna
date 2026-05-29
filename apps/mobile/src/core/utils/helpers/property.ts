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

export const getArabicTypeLabel = (type: 'SALE' | 'RENT' | 'EXCHANGE'): string => {
  switch (type) {
    case 'SALE':
      return 'للبيع';
    case 'RENT':
      return 'للإيجار';
    case 'EXCHANGE':
      return 'للبدل';
    default:
      return '';
  }
};

export const getArabicCategoryLabel = (cat: string): string => {
  switch (cat) {
    case 'RESIDENTIAL':
      return 'عقار سكني';
    case 'COMMERCIAL':
      return 'عقار تجاري';
    case 'INVESTMENT':
      return 'عقار استثماري';
    default:
      return 'عقار';
  }
};
