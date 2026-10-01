const MONTHS = [
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
const DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

/** "5 مايو 2026" */
export function formatDay(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "الأربعاء، 5 يوليو 2026 • 09:30 صباحاً" */
export function formatDayTime(value: string | Date): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours();
  const hour12 = String(h % 12 || 12).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const period = h < 12 ? 'صباحاً' : 'مساءً';
  return `${DAYS[d.getDay()]}، ${formatDay(d)} • ${hour12}:${minutes} ${period}`;
}

/** "1300 د.ك" -- whole numbers without decimals */
export function formatMoney(amount: number): string {
  const value = Number.isInteger(amount) ? amount : amount.toFixed(3);
  return `${value} د.ك`;
}

/** The card's bottom line: the payment date, or that it's awaited. */
export function paymentLine(paidAt: string | null): string {
  return paidAt ? `تم الدفع في: ${formatDay(paidAt)}` : 'بانتظار الدفع';
}

/** "3 شهور" for a warranty given as a bare number of months */
export function formatWarranty(value: string | null): string | null {
  if (!value) return null;
  return /^\d+$/.test(value.trim()) ? `${value.trim()} شهور` : value;
}
