// Formats an ISO timestamp as a short Arabic relative time string, e.g. "منذ ساعة".
export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'الآن';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? 'منذ دقيقة' : `منذ ${minutes} دقيقة`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? 'منذ ساعة' : `منذ ${hours} ساعة`;

  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? 'منذ يوم' : `منذ ${days} يوم`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? 'منذ شهر' : `منذ ${months} شهر`;

  const years = Math.floor(months / 12);
  return years === 1 ? 'منذ سنة' : `منذ ${years} سنة`;
}
