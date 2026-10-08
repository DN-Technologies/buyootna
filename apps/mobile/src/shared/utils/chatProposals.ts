import type { ChatProposal, OfferPeriod } from '@/shared/api/chat.service';
import { formatMessageTime } from '@/shared/utils/chatDate';
import { formatNumber } from '@/shared/utils/formatNumber';

const WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

/** "الخميس 15/10" on this device. */
export function formatDayShort(date: Date): string {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
}

/** "الخميس 15/10 · 4:30 م" on this device. */
export function formatAppointment(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${formatDayShort(date)} · ${formatMessageTime(iso)}`;
}

export const OFFER_PERIOD_LABELS: Record<OfferPeriod, string> = {
  TOTAL: 'إجمالي',
  MONTHLY: 'شهري',
  YEARLY: 'سنوي',
};

/** "250,000 د.ك / شهرياً". */
export function formatOffer(amount?: number | null, period?: OfferPeriod | null) {
  if (amount == null) return '';
  const suffix =
    period === 'MONTHLY' ? ' / شهرياً' : period === 'YEARLY' ? ' / سنوياً' : '';
  return `${formatNumber(amount)} د.ك${suffix}`;
}

/** "📅 موعد معاينة: الخميس 15/10 · 4:30 م" / "💰 عرض سعر: 250,000 د.ك". */
export function proposalPreview(p?: ChatProposal | null, type?: string): string {
  const kind = p?.kind ?? type;
  if (kind === 'APPOINTMENT') {
    const when = formatAppointment(p?.scheduledAt);
    return when ? `📅 موعد معاينة: ${when}` : '📅 موعد معاينة';
  }
  const amount = formatOffer(p?.amount, p?.period);
  return amount ? `💰 عرض سعر: ${amount}` : '💰 عرض سعر';
}

export const PROPOSAL_STATUS_LABELS: Record<ChatProposal['status'], string> = {
  PENDING: 'بانتظار الرد',
  ACCEPTED: 'مقبول',
  DECLINED: 'مرفوض',
  COUNTERED: 'تم الرد بعرض مقابل',
  CANCELLED: 'ملغي',
};

/** Maps app links for a pin. */
export function mapLinks(lat: number, lng: number, label?: string | null) {
  const q = encodeURIComponent(label || `${lat},${lng}`);
  return {
    apple: `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`,
    google: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  };
}
