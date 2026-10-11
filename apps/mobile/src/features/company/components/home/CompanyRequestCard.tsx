import { Text, TouchableOpacity, View } from 'react-native';

import {
  CardAttachIcon,
  CardPinIcon,
  CardWalletIcon,
} from '@/assets/icons/company-home';

import type {
  CompanyRequestItem,
  RequestStatus,
} from '../requests/types';

// Figma card: 257px of text plus 14px of padding on each side
const CARD_WIDTH = 285;

interface CompanyRequestCardProps {
  request: CompanyRequestItem;
  variant?: 'company' | 'public';
  onDetails: (request: CompanyRequestItem) => void;
  onReply: (request: CompanyRequestItem) => void;
}

interface Badge {
  label: string;
  bgClass: string;
  textClass: string;
}

const STATUS_BADGES: Record<RequestStatus, Badge> = {
  pending: {
    label: 'قيد الانتظار',
    bgClass: 'bg-[#FFF9DA]',
    textClass: 'text-[12px] text-[#B97500]',
  },
  responded: {
    label: 'تم الرد',
    bgClass: 'bg-[#EFF8FF]',
    textClass: 'text-[12px] text-[#1849A9]',
  },
  accepted: {
    label: 'مقبولة',
    bgClass: 'bg-[#E1EFEC]',
    textClass: 'text-[10px] text-[#15A72B]',
  },
  rejected: {
    label: 'مرفوضة',
    bgClass: 'bg-[#FBE9E9]',
    textClass: 'text-[12px] text-[#9C1E28]',
  },
};

const PUBLIC_BADGE: Badge = {
  label: 'مناسبة لك',
  bgClass: 'bg-[#E1EFEC]',
  textClass: 'text-[10px] text-[#15A72B]',
};

const META_TEXT = 'font-cairo-medium text-[12px] leading-[16px] text-[#6B6A6A]';

/**
 * A request on the company home (Figma 4410:164111 / 4410:164258). Requests
 * sent to this company show their status and "الرد"; public ones are tagged
 * "مناسبة لك" and offer "ارسال عرض".
 */
export default function CompanyRequestCard({
  request,
  variant = 'company',
  onDetails,
  onReply,
}: CompanyRequestCardProps) {
  const badge =
    variant === 'company'
      ? (STATUS_BADGES[request.status] ?? STATUS_BADGES.pending)
      : PUBLIC_BADGE;

  return (
    <View
      testID={`home-request-card-${request.id}`}
      style={{ width: CARD_WIDTH }}
      className="overflow-hidden rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE]"
    >
      <View className="gap-1 px-[14px] pb-[6px] pt-[14px]">
        {/* Title and client on the right, the tag on the left */}
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 items-start">
            <Text
              className="font-cairo-semibold text-[15px] leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
              numberOfLines={1}
            >
              {request.title}
            </Text>
            <Text
              className="py-1 font-cairo-medium text-[12px] leading-[16px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {request.clientName}
            </Text>
          </View>
          <View
            className={`h-5 items-center justify-center rounded-br-[8px] rounded-tl-[8px] rounded-tr-[8px] px-2 ${badge.bgClass}`}
          >
            <Text
              className={`font-almarai-regular ${badge.textClass}`}
              style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
            >
              {badge.label}
            </Text>
          </View>
        </View>

        <View className="gap-[6px]">
          {/* Area on the right, budget after it */}
          <View className="flex-row items-center gap-5">
            <View className="w-[114px] flex-row items-center gap-[5px] py-[2px]">
              <View className="h-[14px] w-[14px] items-center justify-center">
                <CardPinIcon />
              </View>
              <Text
                className={`shrink ${META_TEXT}`}
                style={{ writingDirection: 'rtl' }}
                numberOfLines={1}
              >
                {request.location}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center gap-[5px] py-[2px]">
              <View className="h-[14px] w-[14px] items-center justify-center">
                <CardWalletIcon />
              </View>
              <Text className={`shrink ${META_TEXT}`} numberOfLines={1}>
                {request.priceRange || 'لم يحدد'}
              </Text>
            </View>
          </View>

          <View className="h-px w-full bg-[#ECECEC]" />

          <Text
            className={META_TEXT}
            style={{ writingDirection: 'rtl' }}
            numberOfLines={2}
          >
            {request.description}
          </Text>

          <View className="flex-row items-center gap-[5px] py-[2px]">
            <CardAttachIcon />
            <Text className={META_TEXT} style={{ writingDirection: 'rtl' }}>
              {request.attachmentsCount} مرفقات
            </Text>
          </View>
        </View>
      </View>

      {/* Primary action on the right, "التفاصيل" on the left */}
      <View className="mt-1 flex-row items-center gap-2 border-t border-[#ECECEC] bg-[#F5F7F9] px-3 py-2">
        <TouchableOpacity
          testID={`home-request-reply-${request.id}`}
          activeOpacity={0.8}
          onPress={() => onReply(request)}
          className="h-8 flex-1 items-center justify-center rounded-[24px] bg-[#15304D]"
        >
          <Text
            className="font-cairo-semibold text-[14px] leading-[21px] text-white"
            style={{ letterSpacing: 0.28 }}
          >
            {variant === 'company' ? 'الرد' : 'ارسال عرض'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID={`home-request-details-${request.id}`}
          activeOpacity={0.8}
          onPress={() => onDetails(request)}
          className="h-8 flex-1 items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
        >
          <Text
            className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
            style={{ letterSpacing: 0.28 }}
          >
            التفاصيل
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
