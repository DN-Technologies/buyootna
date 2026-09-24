import { Text, TouchableOpacity, View } from 'react-native';

import NotificationBellEmptyIcon from './icons/NotificationBellEmptyIcon';

interface NotificationsEmptyStateProps {
  onExplore?: () => void;
}

export default function NotificationsEmptyState({
  onExplore,
}: NotificationsEmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Icon + 0 Badge + Shadow */}
      <NotificationBellEmptyIcon />

      {/* Text Container */}
      <View className="mt-4 w-full items-center gap-2">
        <Text
          className="text-center font-cairo-bold text-[16px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          لا توجد اشعارات حاليا
        </Text>
        <Text
          className="text-center font-cairo-semibold text-[14px] leading-[22px] tracking-[0.28px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          لا توجد إشعارات حالياً. سيتم تنبيهك عند حدوث أي جديد !
        </Text>
      </View>

      {/* Action Button */}
      {onExplore && (
        <View className="mt-4 w-full">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onExplore}
            className="h-[44px] w-full items-center justify-center rounded-full bg-[#15304D] px-5"
          >
            <Text
              className="font-cairo-semibold text-[14px] tracking-[0.28px] text-white"
              style={{ writingDirection: 'rtl' }}
            >
              استكشف الان
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
