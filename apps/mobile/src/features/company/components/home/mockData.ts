import { Ionicons } from '@expo/vector-icons';

export interface HomeServiceChip {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const HOME_SERVICE_CHIPS_MOCK: HomeServiceChip[] = [
  {
    id: '1',
    label: 'مكاتب هندسية',
    icon: 'business-outline',
  },
  {
    id: '2',
    label: 'الأثاث',
    icon: 'bed-outline',
  },
  {
    id: '3',
    label: 'شبكات نت',
    icon: 'wifi-outline',
  },
  {
    id: '4',
    label: 'التكييف',
    icon: 'snow-outline',
  },
  {
    id: '5',
    label: 'مقاولات',
    icon: 'construct-outline',
  },
];
