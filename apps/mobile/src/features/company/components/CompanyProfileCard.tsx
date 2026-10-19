import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  EditPencilIcon,
  LocationPinIcon,
  VerifyBadgeIcon,
} from '@/assets/icons/more';
import Avatar from '@/shared/components/ui/Avatar';

export interface CompanyProfileCardProps {
  displayName: string;
  avatarUrl?: string | null;
  accountTypeLabel?: string;
  isVerified?: boolean;
  description?: string | null;
  location?: string | null;
  onOpenAccountSelector: () => void;
  onEditPress: () => void;
}

export default function CompanyProfileCard({
  displayName,
  avatarUrl,
  accountTypeLabel = 'شركة',
  isVerified = true,
  description,
  location,
  onOpenAccountSelector,
  onEditPress,
}: CompanyProfileCardProps) {
  return (
    <View className="mx-4 mb-6 mt-4 overflow-hidden rounded-[8px] border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
      {/* 1. Top Navy Blue Stripe (40px) */}
      <View className="h-[40px] w-full bg-[#15304D]" />

      {/* 2. Overlapping Logo (Top Right in RTL) */}
      <View className="-mt-7 px-3.5 flex-row justify-start">
        {/* Right in RTL: Overlapping Logo (65x62px) */}
        <View
          style={{
            width: 65,
            height: 62,
            backgroundColor: '#133C2F',
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            borderTopRightRadius: 8,
            overflow: 'hidden',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 3,
          }}
        >
          <Avatar uri={avatarUrl} />
        </View>
      </View>

      {/* 3. Card Body Content */}
      <View className="px-3.5 pb-3.5 pt-2">
        {/* Title & Account Type Selector Row (RTL-First: 1st child is RIGHT, 2nd child is LEFT) */}
        <View className="flex-row items-center justify-between gap-2">
          {/* Right in RTL: Company Name & Verified Badge */}
          <View className="flex-1 flex-row items-center justify-start gap-1.5">
            <Text
              numberOfLines={1}
              className="font-cairo-bold text-[18px] text-[#111111]"
              style={{ writingDirection: 'rtl', textAlign: 'right' }}
            >
              {displayName}
            </Text>
            {isVerified && <VerifyBadgeIcon size={12} color="#1791E7" />}
          </View>

          {/* Left in RTL: Account Type Selector Pill */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenAccountSelector}
            className="flex-row items-center justify-center gap-1.5 rounded-[12px] bg-[#F9FAFE] px-3 py-1"
            style={{ minWidth: 72, height: 29 }}
          >
            <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-[#15304D]">
              {accountTypeLabel}
            </Text>
            <Feather name="chevron-down" size={14} color="#15304D" />
          </TouchableOpacity>
        </View>

        {/* Description / Bio Text (Right-aligned in RTL) */}
        {description ? (
          <Text
            className="mt-2 font-cairo-regular text-[14px] leading-[21px] text-[#A0A0A0]"
            style={{ writingDirection: 'rtl' }}
            // A long bio (some predate the length limit) stays a summary
            numberOfLines={4}
          >
            {description}
          </Text>
        ) : null}

        {/* Location Row (Right-aligned in RTL) */}
        {location ? (
          <View className="mt-2 flex-row items-center justify-start gap-0.5">
            <LocationPinIcon size={14} color="#A0A0A0" />
            <Text
              className="font-cairo-regular text-[13px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              {location}
            </Text>
          </View>
        ) : null}

        {/* 4. Edit Button (single full-width primary action, per design) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onEditPress}
          className="mt-3.5 h-9 w-full flex-row items-center justify-center gap-1.5 rounded-[24px] bg-[#15304D]"
        >
          <EditPencilIcon size={16} color="#FFFFFF" />
          <Text className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white">
            تعديل
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
