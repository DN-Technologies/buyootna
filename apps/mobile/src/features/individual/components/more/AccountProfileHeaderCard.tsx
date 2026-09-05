import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { ShareIcon } from '@/assets/icons/home/property';
import Avatar from '@/shared/components/Avatar';

interface AccountProfileHeaderCardProps {
  avatarUrl?: string | null;
  displayName: string;
  contact: string;
  typeLabel: string;
  onPressType: () => void;
  onEditProfile: () => void;
}

export default function AccountProfileHeaderCard({
  avatarUrl,
  displayName,
  contact,
  typeLabel,
  onPressType,
  onEditProfile,
}: AccountProfileHeaderCardProps) {
  return (
    <View className="mx-5 mb-8 mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/50">
      {/* Top Navy Blue Banner */}
      <View className="h-20 w-full bg-[#15304D]" />

      <View className="px-5 pb-5">
        {/* Avatar & Account Type Row */}
        <View className="-mt-10 mb-2 flex-row items-start justify-between">
          {/* Overlapping Avatar */}
          <View className="h-20 w-20 overflow-hidden rounded-xl border-4 border-white shadow-sm">
            <Avatar uri={avatarUrl} />
          </View>

          {/* Account Type Selector */}
          <TouchableOpacity
            onPress={onPressType}
            className="mt-20 w-[72px] flex-row items-center justify-center gap-3 rounded-full bg-[#F9FAFE] px-3 py-1"
          >
            <Text className="font-cairo-bold text-[14px] leading-[22px] text-[#15304D]">
              {typeLabel}
            </Text>
            <Feather name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View className="mb-5 items-start">
          <Text className="font-cairo-bold text-lg text-[#111111]">
            {displayName}
          </Text>
          <Text className="font-cairo-medium text-xs text-[#64748B]">
            {contact}
          </Text>
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-between gap-2">
          <TouchableOpacity
            onPress={onEditProfile}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] bg-[#15304D] py-2.5"
          >
            <Feather name="edit-2" size={14} color="#FFFFFF" />
            <Text className="font-cairo-bold text-sm leading-[22px] text-white">
              تعديل
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] border border-gray-100 bg-gray-50 py-2.5">
            <Feather name="eye" size={14} color="#111111" />
            <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
              معاينة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center gap-2 rounded-[24px] border border-gray-100 bg-gray-50 py-2.5">
            <ShareIcon color="#111111" size={14} />
            <Text className="font-cairo-bold text-sm leading-[22px] text-[#111111]">
              مشاركة
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
