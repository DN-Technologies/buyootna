import type { SelectionItem } from '@/shared/components/filters/SelectionDrawer';

export type OperationType = 'sale' | 'rent' | 'exchange';

export const OPERATION_OPTIONS: { id: OperationType; label: string }[] = [
  { id: 'sale', label: 'بيع' },
  { id: 'rent', label: 'ايجار' },
  { id: 'exchange', label: 'بدل' },
];

export const CATEGORY_OPTIONS: SelectionItem[] = [
  { id: 'residential', label: 'سكني' },
  { id: 'commercial', label: 'تجاري' },
  { id: 'investment', label: 'استثماري' },
  { id: 'apartment', label: 'شقة' },
  { id: 'house', label: 'بيت' },
  { id: 'villa', label: 'فيلا' },
  { id: 'land', label: 'أرض' },
  { id: 'building', label: 'عمارة' },
  { id: 'chalet', label: 'شاليه' },
];

export const AMENITIES_OPTIONS: SelectionItem[] = [
  { id: 'pool', label: 'حمام سباحة' },
  { id: 'garage', label: 'كراج' },
  { id: 'elevator', label: 'مصعد' },
  { id: 'garden', label: 'حديقة' },
  { id: 'maid_room', label: 'غرفة خادمة' },
  { id: 'central_ac', label: 'تكييف مركزي' },
  { id: 'security', label: 'أمن وحراسة' },
  { id: 'furnished', label: 'مفروشة' },
];

export interface AlertPropertiesState {
  operationType: OperationType;
  governorate: SelectionItem | null;
  area: SelectionItem | null;
  category: SelectionItem | null;
  price: string;
  rentValue: string;
  areaSize: string;
  rooms: number;
  baths: number;
  floors: number;
  requestYear: string;
  requiredYear: string;
  amenities: SelectionItem[];
}

export const DEFAULT_ALERT_PROPERTIES_STATE: AlertPropertiesState = {
  operationType: 'sale',
  governorate: null,
  area: null,
  category: null,
  price: '',
  rentValue: '',
  areaSize: '',
  rooms: 0,
  baths: 0,
  floors: 0,
  requestYear: '',
  requiredYear: '',
  amenities: [],
};
