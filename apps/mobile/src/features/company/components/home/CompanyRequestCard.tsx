import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { type CompanyRequest } from './mockData';

const CARD_WIDTH = 285;

interface CompanyRequestCardProps {
  request: CompanyRequest;
  variant?: 'company' | 'public';
}

export default function CompanyRequestCard({
  request,
  variant = 'company',
}: CompanyRequestCardProps) {
  const router = useRouter();

  const badge =
    variant === 'company'
      ? { label: 'قيد الانتظار', className: 'bg-[#FFF9DA]' }
      : { label: 'مناسبة لك', className: 'bg-[#E1EFEC]' };

  const primaryActionLabel = variant === 'company' ? 'الرد' : 'إرسال عرض';

  return (
    <View
      style={{ width: CARD_WIDTH }}
      className="overflow-hidden rounded-md border border-[#ECECEC] bg-[#FEFEFE]"
    >
      {/* Card body */}
      <View className="gap-1 px-3.5 pb-1.5 pt-3.5">
        {/* Title (right) + status badge (left) */}
        <View className="min-h-[39px] flex-row items-start justify-between gap-2">
          <View className="flex-1 items-end gap-1.5">
            <Text
              className="font-cairo-semibold text-[15px] leading-[22px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {request.title}
            </Text>
            <Text
              className="font-cairo-medium text-[12px] leading-[18px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
              numberOfLines={1}
            >
              {request.clientName}
            </Text>
          </View>
          <View
            className={`h-5 items-center justify-center rounded-tl-lg rounded-tr-md rounded-br-lg px-2 ${badge.className}`}
          >
            <Text
              className={`font-cairo-medium ${
                variant === 'company'
                  ? 'text-[12px] text-[#B97500]'
                  : 'text-[10px] text-[#15A72B]'
              }`}
              style={{ writingDirection: 'rtl' }}
            >
              {badge.label}
            </Text>
          </View>
        </View>

        {/* Meta row: price + location */}
        <View className="flex-row items-center justify-end gap-5 py-0.5">
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {request.price ?? 'لم يحدد'}
            </Text>
            <Ionicons name="wallet-outline" size={14} color="#6B6A6A" />
          </View>
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {request.location}
            </Text>
            <Feather name="map-pin" size={14} color="#6B6A6A" />
          </View>
        </View>

        {/* Divider */}
        <View className="h-px w-full bg-[#ECECEC]" />

        {/* Description */}
        <Text
          className="text-right font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {request.description}
        </Text>

        {/* Attachments */}
        <View className="flex-row items-center justify-end gap-1 py-0.5">
          <Text
            className="font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {request.attachmentsCount} مرفقات
          </Text>
          <Feather name="paperclip" size={14} color="#6B6A6A" />
        </View>
      </View>

      {/* Footer actions */}
      <View className="flex-row items-center gap-2 border-x border-b border-[#ECECEC] bg-[#F5F7F9] px-3 py-2">
        <TouchableOpacity
          activeOpacity={0.8}
          className="h-8 flex-1 items-center justify-center rounded-full border border-[#E2E8F0] bg-white"
        >
          <Text className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]">
            التفاصيل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(company)/company-requests')}
          className="h-8 flex-1 items-center justify-center rounded-full bg-[#15304D]"
        >
          <Text className="font-cairo-semibold text-[14px] leading-[21px] text-white">
            {primaryActionLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
