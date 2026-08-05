import type { AdminUserProperty } from '@/lib/admin-users'

export const typeLabels: Record<string, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
  EXCHANGE: 'للتبديل',
  AUCTION: 'مزاد',
  DEAL: 'صفقة',
}

export const categoryLabels: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  COMMERCIAL: 'تجاري',
  OFFICE: 'مكتب',
  SHOP: 'محل',
  BUILDING: 'عمارة',
  FARM: 'مزرعة',
  CHALET: 'شاليه',
  WAREHOUSE: 'مستودع',
  INVESTMENT: 'استثماري',
}

export function formatPrice(price: number | null) {
  if (price == null) return '—'
  return `${new Intl.NumberFormat('en-US').format(price)} د.ك`
}

export function formatArabicDate(date: string) {
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(date))
}

export function getAdCode(referenceNumber: number) {
  return `AD${String(referenceNumber).slice(-3).padStart(3, '0')}`
}

export function getAdLabel(property: AdminUserProperty) {
  const typeLabel = typeLabels[property.type] || property.type
  const categoryLabel = categoryLabels[property.category] || property.category
  return `${categoryLabel} ${typeLabel} في ${property.location}`
}

export function getStatusBadge(property: AdminUserProperty) {
  if (property.isHidden) {
    return { label: 'مخفي', className: 'bg-[#F1F5F9] text-[#6B6A6A]' }
  }
  if (property.isFeatured) {
    return {
      label: 'مميز',
      className: 'bg-gradient-to-l from-[#FF8D28] to-[#FACC15] text-[#111111]',
    }
  }
  switch (property.status) {
    case 'ACTIVE':
      return {
        label: 'نشط',
        className: 'bg-gradient-to-l from-[#AADB53] to-[#33D679] text-[#111111]',
      }
    case 'DRAFT':
      return { label: 'مسودة', className: 'bg-[#F1F5F9] text-[#334155]' }
    case 'REJECTED':
      return { label: 'مرفوض', className: 'bg-[#FEF3F2] text-[#9C1E28]' }
    case 'EXPIRED':
      return { label: 'منتهي', className: 'bg-[#FFFBEB] text-[#B45309]' }
    case 'CLOSED':
      return { label: 'مغلق', className: 'bg-[#F1F5F9] text-[#334155]' }
    default:
      return { label: property.status, className: 'bg-[#F1F5F9] text-[#334155]' }
  }
}
