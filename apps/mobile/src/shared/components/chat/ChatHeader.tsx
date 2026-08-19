import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
  userName: string;
  isOnline: boolean;
  avatarUrl: string;
  isLoading?: boolean;
  onReportUser: () => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
}

export default function ChatHeader({
  userName,
  isOnline,
  avatarUrl,
  isLoading = false,
  onReportUser,
  showMoreMenu,
  setShowMoreMenu,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <View className="relative z-50 flex-row items-center justify-between px-5 py-3 shadow-sm shadow-gray-100">
      {/* Right Avatar & Back */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        {isLoading ? (
          <View className="h-[44px] w-[44px] rounded-full bg-slate-200" />
        ) : (
          <Image
            source={{ uri: avatarUrl }}
            className="h-[44px] w-[44px] rounded-full bg-gray-100"
          />
        )}
      </View>

      {/* Center User Info */}
      <View className="flex-1 items-start pl-3">
        {isLoading ? (
          <View className="gap-1.5">
            <View className="h-4 w-24 rounded bg-slate-200" />
            <View className="h-3 w-14 rounded bg-slate-100" />
          </View>
        ) : (
          <>
            <Text className="font-cairo-medium text-[16px] text-[#0F1828]">
              {userName}
            </Text>
            <View className="flex-row items-center">
              <View className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#22C55E]' : 'bg-gray-400'}`} />
              <Text className={`ml-1 font-cairo-medium text-[11px] ${isOnline ? 'text-[#22C55E]' : 'text-gray-400'}`}>
                {isOnline ? 'نشط الان' : 'غير متصل'}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Left Actions */}
      <View className="flex-row items-center gap-4">
        <TouchableOpacity>
          <Feather name="search" size={20} color="#64748B" />
        </TouchableOpacity>

        <View className="relative">
          <TouchableOpacity onPress={() => setShowMoreMenu(!showMoreMenu)}>
            <Feather name="more-vertical" size={20} color="#64748B" />
          </TouchableOpacity>

          {showMoreMenu && (
            <View className="absolute right-[-8px] top-8 mt-4 w-48 rounded-xl bg-white shadow-md shadow-gray-200">
              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => {
                  onReportUser();
                  setShowMoreMenu(false);
                }}
              >
                <Text
                  className="font-cairo text-sm leading-[22px] text-[#9C1E28]"
                  style={{ writingDirection: 'rtl' }}
                >
                  الإبلاغ عن المستخدم
                </Text>
              </TouchableOpacity>

              {/* Pointer / Triangle */}
              <View className="absolute -top-1.5 right-3 -z-10 h-4 w-4 rotate-45 rounded-sm bg-white shadow-md shadow-gray-200" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
