import {
  AMENITY_LABELS,
  findLabel,
  formatAuctionDate,
  getAlertTitle,
  toArabicNumerals,
} from '@/features/individual/utils/alertCard';
import type { AlertItem } from '@/shared/api/alerts.service';
import {
  CATEGORY_OPTIONS,
  OPERATION_OPTIONS,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

export interface AlertDetailField {
  key: string;
  title: string;
  value: string;
}

/** Rows of the details grid; a row with two fields renders side by side. */
export type AlertDetailRow = AlertDetailField[];

export interface AlertDetails {
  title: string;
  rows: AlertDetailRow[];
}

const NOT_SET = 'غير محدد';

function governorateText(alert: AlertItem) {
  const label = findLabel(GOVERNORATES, alert.governorateId);
  if (!label) return NOT_SET;
  return label.startsWith('محافظة') ? label : `محافظة ${label}`;
}

function areaText(alert: AlertItem) {
  // No area on the alert means it covers the whole governorate
  if (!alert.areaId) return 'كل المناطق';
  return findLabel(AREAS[alert.governorateId] ?? [], alert.areaId) ?? NOT_SET;
}

function categoryText(alert: AlertItem) {
  if (!alert.categoryId) return 'كل الفئات';
  return findLabel(CATEGORY_OPTIONS, alert.categoryId) ?? NOT_SET;
}

function operationText(alert: AlertItem) {
  return (
    OPERATION_OPTIONS.find((o) => o.id === alert.operationType?.toLowerCase())
      ?.label ?? NOT_SET
  );
}

function priceText(alert: AlertItem) {
  const value = alert.operationType === 'RENT' ? alert.rentValue : alert.price;
  return value ? `${value.toLocaleString()} د.ك` : NOT_SET;
}

function dateRangeText(alert: AlertItem) {
  const start = alert.startDate ? formatAuctionDate(alert.startDate) : null;
  const end = alert.endDate ? formatAuctionDate(alert.endDate) : null;
  if (start && end) return `${start} حتى ${end}`;
  if (start) return `من ${start}`;
  if (end) return `حتى ${end}`;
  return 'أي تاريخ';
}

function amenitiesText(alert: AlertItem) {
  const labels = (alert.amenities ?? []).map((id) => AMENITY_LABELS[id] ?? id);
  return labels.length > 0 ? labels.join(' - ') : 'لا يوجد';
}

function specsText(alert: AlertItem) {
  const parts: string[] = [];
  if (alert.rooms) parts.push(`${toArabicNumerals(alert.rooms)} غرف`);
  if (alert.baths) parts.push(`${toArabicNumerals(alert.baths)} حمام`);
  if (alert.floors) parts.push(`${toArabicNumerals(alert.floors)} أدوار`);
  return parts.length > 0 ? parts.join(' - ') : NOT_SET;
}

function yearsText(alert: AlertItem) {
  if (!alert.requestYear && !alert.requiredYear) return NOT_SET;
  return `طلب ${alert.requestYear ?? '—'} مع ${alert.requiredYear ?? '—'}`;
}

export function getAlertDetails(alert: AlertItem): AlertDetails {
  const location: AlertDetailRow = [
    { key: 'area', title: 'المنطقة', value: areaText(alert) },
    { key: 'gov', title: 'المحافظة', value: governorateText(alert) },
  ];
  const category: AlertDetailField = {
    key: 'category',
    title: 'فئة العقار',
    value: categoryText(alert),
  };

  if (alert.type === 'AUCTIONS') {
    return {
      title: `مزادات ${
        alert.categoryId ? categoryText(alert) : 'الأراضي السكنية'
      }`,
      rows: [
        location,
        [category],
        [
          {
            key: 'dates',
            title: 'التاريخ من وإلى',
            value: dateRangeText(alert),
          },
        ],
      ],
    };
  }

  const categoryAndOperation: AlertDetailRow = [
    category,
    { key: 'operation', title: 'نوع العملية', value: operationText(alert) },
  ];

  if (alert.operationType === 'EXCHANGE') {
    return {
      title: getAlertTitle(alert).title,
      rows: [
        categoryAndOperation,
        location,
        [
          { key: 'specs', title: 'المواصفات', value: specsText(alert) },
          { key: 'years', title: 'سنة الطلب', value: yearsText(alert) },
        ],
        [{ key: 'amenities', title: 'المزايا', value: amenitiesText(alert) }],
      ],
    };
  }

  return {
    title: getAlertTitle(alert).title,
    rows: [
      categoryAndOperation,
      location,
      [
        {
          key: 'price',
          title: alert.operationType === 'RENT' ? 'الإيجار حتى' : 'السعر حتى',
          value: priceText(alert),
        },
        {
          key: 'size',
          title: 'المساحة',
          value: alert.areaSize ? `${alert.areaSize} م²` : NOT_SET,
        },
      ],
      [{ key: 'amenities', title: 'المزايا', value: amenitiesText(alert) }],
    ],
  };
}
