import type { AlertItem } from '@/shared/api/alerts.service';
import {
  CATEGORY_OPTIONS,
  OPERATION_OPTIONS,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

export const AMENITY_LABELS: Record<string, string> = {
  pool: 'حمام سباحة',
  garage: 'جراج',
  elevator: 'مصعد',
  garden: 'حديقة',
  maid_room: 'غرفة خادمة',
  central_ac: 'تكييف مركزي',
  security: 'أمن وحراسة',
  furnished: 'مفروشة',
};

export function toArabicNumerals(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[+w]);
}

export function findLabel(
  list: { id: string; label: string }[],
  id: string | null,
) {
  if (!id) return undefined;
  return list.find((item) => item.id === id)?.label;
}

export function formatAuctionDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function formatRelativeMatchTime(dateStr?: string | null): string {
  if (!dateStr) return 'اخر تطابق منذ 5 ساعات';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs <= 0) return 'اخر تطابق منذ قليل';
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'اخر تطابق منذ قليل';
    if (diffHours < 24) return `اخر تطابق منذ ${diffHours} ساعات`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'اخر تطابق منذ يوم';
    if (diffDays === 2) return 'اخر تطابق منذ يومين';
    if (diffDays <= 10) return `اخر تطابق منذ ${diffDays} أيام`;
    return `اخر تطابق منذ ${diffDays} يوم`;
  } catch {
    return 'اخر تطابق منذ 5 ساعات';
  }
}

function getAlertLabels(alert: AlertItem) {
  return {
    governorateLabel: findLabel(GOVERNORATES, alert.governorateId),
    areaLabel: findLabel(AREAS[alert.governorateId] ?? [], alert.areaId),
    categoryLabel: findLabel(CATEGORY_OPTIONS, alert.categoryId),
    operationLabel: OPERATION_OPTIONS.find(
      (o) => o.id === alert.operationType?.toLowerCase(),
    )?.label,
  };
}

export function getAlertTitle(alert: AlertItem): {
  title: string;
  subtitle: string;
} {
  const { governorateLabel, areaLabel, categoryLabel, operationLabel } =
    getAlertLabels(alert);

  if (alert.type === 'AUCTIONS') {
    const categoryPart = categoryLabel
      ? `مزادات ${categoryLabel}`
      : 'مزادات الأراضي السكنية';
    const locationPart = governorateLabel || areaLabel || 'محافظة العاصمة';
    return {
      title: 'مزادات وزارة العدل',
      subtitle: `${categoryPart} - ${locationPart}`,
    };
  }

  const categoryPart = categoryLabel || 'عقار';
  const locationPart = areaLabel || governorateLabel || 'الكويت';

  if (alert.operationType === 'EXCHANGE') {
    return { title: `${categoryPart} للبدل - ${locationPart}`, subtitle: '' };
  }

  const opPart =
    alert.operationType === 'RENT'
      ? 'للإيجار'
      : alert.operationType === 'SALE'
        ? 'للبيع'
        : operationLabel
          ? `للـ${operationLabel}`
          : 'للإيجار';
  return { title: `${categoryPart} ${opPart} - ${locationPart}`, subtitle: '' };
}

// Feature badges shown under the title of property/exchange alerts
export function getAlertChips(alert: AlertItem): string[] {
  const chips: string[] = [];
  if (alert.type === 'AUCTIONS') return chips;

  if (alert.operationType === 'EXCHANGE') {
    const { governorateLabel, areaLabel } = getAlertLabels(alert);
    if (alert.requestYear || alert.requiredYear) {
      chips.push(
        `طلب ${alert.requestYear ?? '—'} مع ${alert.requiredYear ?? '—'}`,
      );
    }
    if (areaLabel && governorateLabel) {
      chips.push(`${areaLabel}، ${governorateLabel}`);
    }
    return chips;
  }

  if (alert.rentValue) {
    chips.push(`حتى ${alert.rentValue.toLocaleString()} د.ك`);
  } else if (alert.price) {
    chips.push(`${alert.price.toLocaleString()} د.ك`);
  }
  if (alert.rooms) {
    chips.push(`${toArabicNumerals(alert.rooms)} غرف`);
  }
  if (alert.baths) {
    chips.push(`${toArabicNumerals(alert.baths)} حمام`);
  }
  if (alert.areaSize) {
    chips.push(`${alert.areaSize} م²`);
  }
  if (alert.amenities && alert.amenities.length > 0) {
    alert.amenities.forEach((amenityId) => {
      const label = AMENITY_LABELS[amenityId];
      if (label) chips.push(label);
    });
  }
  return chips;
}

export function getAuctionDateRange(alert: AlertItem): string | null {
  if (alert.type !== 'AUCTIONS' || (!alert.startDate && !alert.endDate)) {
    return null;
  }
  return `${alert.endDate ? formatAuctionDate(alert.endDate) : ''}${
    alert.startDate && alert.endDate ? ' - ' : ''
  }${alert.startDate ? formatAuctionDate(alert.startDate) : ''}`;
}
