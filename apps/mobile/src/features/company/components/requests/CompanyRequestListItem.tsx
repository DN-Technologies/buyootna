import { Text, TouchableOpacity, View } from 'react-native';

import {
  LocationPinSmallIcon,
  PaperclipSmallIcon,
  WalletSmallIcon,
} from './icons';
import { CompanyRequestItem, RequestStatus } from './types';

export interface CompanyRequestListItemProps {
  request: CompanyRequestItem;
  onReply?: (request: CompanyRequestItem) => void;
  onDetails?: (request: CompanyRequestItem) => void;
  onPress?: (request: CompanyRequestItem) => void;
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

export default function CompanyRequestListItem({
  request,
  onReply,
  onDetails,
  onPress,
}: CompanyRequestListItemProps) {
  const statusConfig = STATUS_CONFIGS[request.status] ?? STATUS_CONFIGS.pending;

  return (
    <TouchableOpacity
      testID={`company-request-card-${request.id}`}
      activeOpacity={0.9}
      onPress={() => (onPress ? onPress(request) : onDetails?.(request))}
      className="mb-3 overflow-hidden rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE]"
    >
      {/* Top Body Section */}
      <View className="px-3.5 pb-2.5 pt-3.5">
        {/* Header Row (RTL: Child 0 is Visual Right, Child 1 is Visual Left) */}
        <View className="flex-row items-start justify-between">
          {/* Visual Right (Child 0): Title & Client */}
          <View className="flex-1 pe-2">
            <Text
              className="font-cairo-semibold text-[15px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {request.title}
            </Text>
            <Text
              className="mt-0.5 font-cairo-medium text-[12px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {request.clientName}
            </Text>
          </View>

          {/* Visual Left (Child 1): Status Badge */}
          <View
            className={`h-[20px] items-center justify-center rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] px-2 ${statusConfig.bgClass}`}
          >
            <Text
              className={`font-almarai-regular text-[11px] ${statusConfig.textClass}`}
              style={{ writingDirection: 'rtl' }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Meta Info Row (RTL: Child 0 visual Right, Child 1 middle, Child 2 visual Left) */}
        <View className="mt-2.5 flex-row items-center gap-4">
          {/* Child 0 (Visual Right): Location */}
          <View className="flex-row items-center gap-1">
            <LocationPinSmallIcon size={14} color="#6B6A6A" />
            <Text
              className="font-cairo-medium text-[12px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {request.location}
            </Text>
          </View>

          {/* Child 1 (Middle): Price Range */}
          {request.priceRange && (
            <View className="flex-row items-center gap-1">
              <WalletSmallIcon size={14} color="#6B6A6A" />
              <Text
                className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                style={{ writingDirection: 'ltr' }}
              >
                {request.priceRange}
              </Text>
            </View>
          )}

          {/* Child 2 (Visual Left): Attachments Count */}
          {request.attachmentsCount > 0 && (
            <View className="flex-row items-center gap-1">
              <PaperclipSmallIcon size={14} color="#6B6A6A" />
              <Text
                className="font-cairo-medium text-[12px] text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                {request.attachmentsCount} مرفقات
              </Text>
            </View>
          )}
        </View>

        {/* Separator Divider */}
        <View className="my-2.5 h-px w-full bg-[#ECECEC]" />

        {/* Truncated Description */}
        <Text
          numberOfLines={2}
          className="font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {request.description}
        </Text>
      </View>

      {/* Footer CTA Buttons (RTL: Child 0 is Visual Right, Child 1 is Visual Left) */}
      <View className="flex-row items-center justify-between gap-2 border-t border-[#ECECEC] bg-[#F5F7F9] px-3 py-2">
        {/* Visual Right (Child 0): Primary "الرد" Button */}
        <TouchableOpacity
          testID={`company-request-reply-btn-${request.id}`}
          onPress={() => onReply?.(request)}
          activeOpacity={0.8}
          className="h-[32px] flex-1 items-center justify-center rounded-[24px] bg-[#15304D]"
        >
          <Text
            className="font-cairo-semibold text-[14px] text-white"
            style={{ writingDirection: 'rtl' }}
          >
            الرد
          </Text>
        </TouchableOpacity>

        {/* Visual Left (Child 1): Secondary "التفاصيل" Button */}
        <TouchableOpacity
          testID={`company-request-details-btn-${request.id}`}
          onPress={() => onDetails?.(request)}
          activeOpacity={0.8}
          className="h-[32px] flex-1 items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
        >
          <Text
            className="font-cairo-semibold text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            التفاصيل
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
