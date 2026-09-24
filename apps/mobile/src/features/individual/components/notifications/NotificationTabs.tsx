import { Text, TouchableOpacity, View } from 'react-native';

export type NotificationTabKey = 'ALL' | 'UNREAD';

interface NotificationTabsProps {
  activeTab: NotificationTabKey;
  onTabChange: (tab: NotificationTabKey) => void;
  hasUnread: boolean;
  onMarkAllRead: () => void;
}

export default function NotificationTabs({
  activeTab,
  onTabChange,
  hasUnread,
  onMarkAllRead,
}: NotificationTabsProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-[#EBECEE] px-4">
      {/* Right: Tabs (الكل / غير مقروء) */}
      <View className="flex-row items-center gap-6">
        <TouchableOpacity
          onPress={() => onTabChange('ALL')}
          activeOpacity={0.7}
          className={`pb-3 pt-3.5 ${
            activeTab === 'ALL' ? 'border-b-2 border-[#15304D]' : ''
          }`}
        >
          <Text
            className={`text-center text-[14px] ${
              activeTab === 'ALL'
                ? 'font-almarai-bold text-[#15304D]'
                : 'font-almarai-regular text-[#6B6A6A]'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            الكل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onTabChange('UNREAD')}
          activeOpacity={0.7}
          className={`pb-3 pt-3.5 ${
            activeTab === 'UNREAD' ? 'border-b-2 border-[#15304D]' : ''
          }`}
        >
          <Text
            className={`text-right text-[14px] ${
              activeTab === 'UNREAD'
                ? 'font-almarai-bold text-[#15304D]'
                : 'font-almarai-regular text-[#6B6A6A]'
            }`}
            style={{ writingDirection: 'rtl' }}
          >
            غير مقروء
          </Text>
        </TouchableOpacity>
      </View>

      {/* Left: Mark All Read Action */}
      <TouchableOpacity
        onPress={onMarkAllRead}
        disabled={!hasUnread}
        activeOpacity={0.7}
        className="py-3"
      >
        <Text
          className={`font-cairo-medium text-[12px] tracking-[0.24px] text-[#111111] ${
            hasUnread ? 'opacity-100' : 'opacity-40'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          تحديد الكل كمقروء
        </Text>
      </TouchableOpacity>
    </View>
  );
}
