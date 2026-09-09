import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface HomeStatsGridProps {
  requestsCount: number;
  activeServicesCount: number;
  totalViews: number;
  unreadMessagesCount: number;
  onPressRequests?: () => void;
  onPressServices?: () => void;
  onPressMessages?: () => void;
}

export default function HomeStatsGrid({
  requestsCount,
  activeServicesCount,
  totalViews,
  unreadMessagesCount,
  onPressRequests,
  onPressServices,
  onPressMessages,
}: HomeStatsGridProps) {
  const router = useRouter();

  const handleRequestsPress =
    onPressRequests || (() => router.push('/(company)/company-requests'));
  const handleServicesPress =
    onPressServices || (() => router.push('/(company)/company-requests'));
  const handleMessagesPress =
    onPressMessages || (() => router.push('/(company)/company-chats'));

  return (
    <View className="gap-3">
      {/* Row 1 */}
      <View className="flex-row gap-3">
        {/* Requests (Right) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRequestsPress}
          style={{ flex: 1, flexBasis: 0 }}
          className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
        >
          <View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="#15304D"
              />
            </View>
          </View>
          <View>
            <Text
              className="font-cairo-medium text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              طلبات
            </Text>
            <Text
              className="font-cairo-semibold text-[14px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {requestsCount} هذا الأسبوع
            </Text>
          </View>
        </TouchableOpacity>

        {/* Active Services (Left) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleServicesPress}
          style={{ flex: 1, flexBasis: 0 }}
          className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
        >
          <View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Feather name="headphones" size={20} color="#15304D" />
            </View>
          </View>
          <View>
            <Text
              className="font-cairo-medium text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              خدمات نشطة
            </Text>
            <Text
              className="font-cairo-semibold text-[14px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {activeServicesCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Row 2 */}
      <View className="flex-row gap-3">
        {/* Views (Right) */}
        <View
          style={{ flex: 1, flexBasis: 0 }}
          className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
        >
          <View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Ionicons name="eye-outline" size={20} color="#15304D" />
            </View>
          </View>
          <View>
            <Text
              className="font-cairo-medium text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              المشاهدات
            </Text>
            <Text
              className="font-cairo-semibold text-[14px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              +{totalViews}
            </Text>
          </View>
        </View>

        {/* New Messages (Left) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleMessagesPress}
          style={{ flex: 1, flexBasis: 0 }}
          className="min-h-[92px] justify-between rounded-md border border-[#ECECEC] bg-white p-4"
        >
          <View>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Ionicons
                name="chatbox-outline"
                size={20}
                color="#15304D"
              />
            </View>
          </View>
          <View>
            <Text
              className="font-cairo-medium text-[14px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              الرسائل غير المقروءة
            </Text>
            <Text
              className="font-cairo-semibold text-[14px] text-[#15A72B]"
              style={{ writingDirection: 'rtl' }}
            >
              {unreadMessagesCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
