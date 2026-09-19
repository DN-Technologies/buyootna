import { Text, View } from 'react-native';

import { RequestStatus } from '../types';

export interface RequestDetailsTitleCardProps {
  title: string;
  requestNumber?: string;
  category?: string;
  status: RequestStatus;
}

interface StatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
}

const STATUS_CONFIGS: Record<RequestStatus, StatusConfig> = {
  pending: {
    label: 'قيد الانتظار',
    bgClass: 'bg-[#FFF9DA]',
    textClass: 'text-[#B97500]',
  },
  responded: {
    label: 'تم الرد',
    bgClass: 'bg-[#EFF8FF]',
    textClass: 'text-[#1849A9]',
  },
  accepted: {
    label: 'مقبولة',
    bgClass: 'bg-[#E1EFEC]',
    textClass: 'text-[#15A72B]',
  },
};

export default function RequestDetailsTitleCard({
  title,
  requestNumber = 'طلب رقم 01#',
  category = 'تشطيب و ديكور',
  status,
}: RequestDetailsTitleCardProps) {
  const statusConfig = STATUS_CONFIGS[status] ?? STATUS_CONFIGS.pending;

  return (
    <View className="bg-white pb-3 pt-4">
      {/* RTL Row: Child 0 is Visual Right (Title & Subtitle), Child 1 is Visual Left (Badge) */}
      <View className="flex-row items-start justify-between">
        {/* Visual Right (Child 0): Title & Category */}
        <View className="flex-1 pe-3">
          <Text
            testID="request-details-item-title"
            className="font-cairo-semibold landing-[22px] text-[18px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {title}
          </Text>
          <Text
            testID="request-details-item-subtitle"
            className="font-cairo-medium text-[14px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {requestNumber} • {category}
          </Text>
        </View>

        {/* Visual Left (Child 1): Status Badge */}
        <View
          testID="request-details-status-badge"
          className={`h-[22px] items-center justify-center rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] px-2.5 ${statusConfig.bgClass}`}
        >
          <Text
            className={`font-almarai-regular text-[11px] ${statusConfig.textClass}`}
            style={{ writingDirection: 'rtl' }}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Separator Line */}
      <View className="mt-3.5 h-px w-full bg-[#ECECEC]" />
    </View>
  );
}
