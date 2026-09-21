import { Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AlertItem } from '@/shared/api/alerts.service';
import {
  CATEGORY_OPTIONS,
  OPERATION_OPTIONS,
} from '@/shared/components/add-alert/AlertPropertiesTab';
import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

interface AlertListItemProps {
  alert: AlertItem;
  onDeletePress: (id: string) => void;
}

const TrashIcon = ({
  color = '#9C1E28',
  size = 18,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 7L18.1327 19.1422C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1422L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function findLabel(list: { id: string; label: string }[], id: string | null) {
  if (!id) return undefined;
  return list.find((item) => item.id === id)?.label;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('ar-KW', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function AlertListItem({
  alert,
  onDeletePress,
}: AlertListItemProps) {
  const governorateLabel = findLabel(GOVERNORATES, alert.governorateId);
  const areaLabel = findLabel(AREAS[alert.governorateId] ?? [], alert.areaId);
  const categoryLabel = findLabel(CATEGORY_OPTIONS, alert.categoryId);
  const operationLabel = OPERATION_OPTIONS.find(
    (o) => o.id === alert.operationType?.toLowerCase(),
  )?.label;

  const locationLabel = [governorateLabel, areaLabel]
    .filter(Boolean)
    .join(' - ');

  return (
    <View className="z-10 mb-4 rounded-md border border-[#ECECEC] bg-white p-4 shadow-sm shadow-gray-200/30">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className={`rounded-lg px-3 py-1 ${
              alert.type === 'PROPERTIES' ? 'bg-[#EAF1F8]' : 'bg-[#FDF2E5]'
            }`}
          >
            <Text
              className={`font-cairo-bold text-[11px] ${
                alert.type === 'PROPERTIES'
                  ? 'text-[#15304D]'
                  : 'text-[#B5690F]'
              }`}
            >
              {alert.type === 'PROPERTIES' ? 'عقارات' : 'مزادات'}
            </Text>
          </View>
          {operationLabel && (
            <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
              {operationLabel}
            </Text>
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onDeletePress(alert.id)}
          className="p-1"
        >
          <TrashIcon size={18} color="#9C1E28" />
        </TouchableOpacity>
      </View>

      {(locationLabel || categoryLabel) && (
        <Text className="mb-1 font-cairo-semibold text-sm text-[#111111]">
          {[categoryLabel, locationLabel].filter(Boolean).join(' - ')}
        </Text>
      )}

      {alert.type === 'AUCTIONS' && (alert.startDate || alert.endDate) && (
        <Text className="font-cairo text-xs text-[#6B6A6A]">
          {alert.startDate ? formatDate(alert.startDate) : ''}
          {alert.startDate && alert.endDate ? ' - ' : ''}
          {alert.endDate ? formatDate(alert.endDate) : ''}
        </Text>
      )}

      {alert.type === 'PROPERTIES' && (alert.price || alert.rentValue) && (
        <Text className="font-cairo text-xs text-[#6B6A6A]">
          {alert.price
            ? `السعر: ${alert.price.toLocaleString()} د.ك`
            : `الإيجار: ${alert.rentValue?.toLocaleString()} د.ك`}
        </Text>
      )}
    </View>
  );
}
