import { OfferPeriod, Prisma } from '@prisma/client';

// Previews of appointments / offers, written server-side (push bodies)

/** "الخميس 15/10 · 4:30 م" in Kuwait time (pushes are written server-side). */
export function formatKuwaitDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat('ar-KW-u-nu-latn', {
    timeZone: 'Asia/Kuwait',
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const period = get('dayPeriod').includes('م') ? 'م' : 'ص';
  return `${get('weekday')} ${get('day')}/${get('month')} · ${get('hour')}:${get('minute')} ${period}`;
}

const PERIOD_LABELS: Record<OfferPeriod, string> = {
  TOTAL: '',
  MONTHLY: ' / شهرياً',
  YEARLY: ' / سنوياً',
};

/** "250,000 د.ك / شهرياً". */
export function formatOfferAmount(
  amount: number,
  period?: OfferPeriod | null,
  currency = 'KWD',
): string {
  const value = amount.toLocaleString('en-US', { maximumFractionDigits: 3 });
  const unit = currency === 'KWD' ? 'د.ك' : currency;
  return `${value} ${unit}${period ? PERIOD_LABELS[period] : ''}`;
}

/** The time of an appointment or the amount of an offer. */
export function proposalDetail(p: {
  kind: string;
  scheduledAt?: Date | string | null;
  amount?: number | Prisma.Decimal | null;
  period?: OfferPeriod | null;
  currency?: string;
}): string {
  if (p.kind === 'APPOINTMENT') {
    return p.scheduledAt ? formatKuwaitDateTime(new Date(p.scheduledAt)) : '';
  }
  return p.amount != null
    ? formatOfferAmount(Number(p.amount), p.period, p.currency)
    : '';
}

/** The one-line preview of a proposal (push, chats list). */
export function proposalSummary(p: {
  kind: string;
  scheduledAt?: Date | string | null;
  amount?: number | Prisma.Decimal | null;
  period?: OfferPeriod | null;
  currency?: string;
}): string {
  const detail = proposalDetail(p);
  const label = p.kind === 'APPOINTMENT' ? '📅 موعد معاينة' : '💰 عرض سعر';
  return detail ? `${label}: ${detail}` : label;
}
