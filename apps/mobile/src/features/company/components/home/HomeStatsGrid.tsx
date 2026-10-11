import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import {
  HeadsetIcon,
  StatChatIcon,
  StatCheckIcon,
  StatOrderIcon,
} from '@/assets/icons/company-home';

interface HomeStatsGridProps {
  // Requests sent straight to this company in the last 7 days
  privateRequestsThisWeek: number;
  activeServicesCount: number;
  unreadMessagesCount: number;
  acceptedRequestsCount: number;
}

interface StatCardProps {
  testID: string;
  icon: ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}

// Figma "Component 43/44/61/62": 32px icon chip, label, green figure
const StatCard = ({ testID, icon, label, value, onPress }: StatCardProps) => (
  <TouchableOpacity
    testID={testID}
    activeOpacity={0.8}
    disabled={!onPress}
    onPress={onPress}
    style={{ flex: 1, flexBasis: 0 }}
    className="items-start gap-2 rounded-[6px] border border-[#ECECEC] bg-white px-4 pb-4 pt-3"
  >
    <View className="h-8 w-8 items-center justify-center rounded-full bg-[#F5F7F9]">
      {icon}
    </View>
    <View className="items-start">
      <Text
        className="font-cairo-medium text-[14px] leading-[21px] text-[#111111]"
        style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        testID={`${testID}-value`}
        className="font-cairo-semibold text-[14px] leading-[21px] text-[#15A72B]"
        style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
      >
        {value}
      </Text>
    </View>
  </TouchableOpacity>
);

// The row is RTL: the first card of each row sits on the right, as in Figma
export default function HomeStatsGrid({
  privateRequestsThisWeek,
  activeServicesCount,
  unreadMessagesCount,
  acceptedRequestsCount,
}: HomeStatsGridProps) {
  const router = useRouter();
  const openRequests = () => router.push('/(company)/company-requests');

  return (
    <View className="gap-4 px-4">
      <View className="flex-row gap-4">
        <StatCard
          testID="stat-active-services"
          icon={<HeadsetIcon />}
          label="خدمات نشطة"
          value={String(activeServicesCount)}
        />
        <StatCard
          testID="stat-private-requests"
          icon={<StatOrderIcon />}
          label="طلبات خاصة"
          value={
            privateRequestsThisWeek > 0
              ? `${privateRequestsThisWeek} هذا الأسبوع`
              : '0'
          }
          onPress={openRequests}
        />
      </View>
      <View className="flex-row gap-4">
        <StatCard
          testID="stat-accepted-requests"
          icon={<StatCheckIcon />}
          label="طلبات مقبولة"
          value={String(acceptedRequestsCount)}
          onPress={openRequests}
        />
        <StatCard
          testID="stat-new-messages"
          icon={<StatChatIcon />}
          label="الرسائل الجديدة"
          value={String(unreadMessagesCount)}
          onPress={() => router.push('/(company)/company-chats')}
        />
      </View>
    </View>
  );
}
