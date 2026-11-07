// Text formats of the «طلب التوثيق» screens (Figma 10307:141541)

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'ابريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];
const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** "11 سبتمبر 09:35 صباحا": when the request was sent. */
export function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const period = hours < 12 ? 'صباحا' : 'مساءً';
  return `${date.getDate()} ${AR_MONTHS[date.getMonth()]} ${pad(hours12)}:${pad(date.getMinutes())} ${period}`;
}

/** "15 ابريل 2027": the licence's expiry, as picked. */
export function formatExpiryDate(date: Date): string {
  return `${date.getDate()} ${AR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "15 Oct, 2024 • 200 KB • PDF" under the licence file's name. */
export function formatFileMeta(
  iso: string,
  sizeBytes?: number | null,
  mimeType?: string | null,
  fileName?: string | null,
): string {
  const date = new Date(iso);
  const parts: string[] = [];
  if (!Number.isNaN(date.getTime())) {
    parts.push(
      `${date.getDate()} ${EN_MONTHS[date.getMonth()]}, ${date.getFullYear()}`,
    );
  }
  if (sizeBytes) {
    parts.push(
      sizeBytes >= 1024 * 1024
        ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(sizeBytes / 1024))} KB`,
    );
  }
  const type = fileType(mimeType, fileName);
  if (type) parts.push(type);
  return parts.join(' • ');
}

/** "PDF", "JPG", "PNG"... from the MIME type or the file's extension. */
export function fileType(
  mimeType?: string | null,
  fileName?: string | null,
): string {
  const fromMime = mimeType?.split('/')[1];
  const fromName = fileName?.includes('.')
    ? fileName.split('.').pop()
    : undefined;
  const raw = (fromMime || fromName || '').toUpperCase();
  return raw === 'JPEG' ? 'JPG' : raw;
}

export const isPdf = (mimeType?: string | null, fileName?: string | null) =>
  fileType(mimeType, fileName) === 'PDF';
