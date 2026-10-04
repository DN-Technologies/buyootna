import { Feather } from '@expo/vector-icons';
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppNotification } from '@/shared/api/notifications.service';

import NotificationDotsIcon from './icons/NotificationDotsIcon';
import NotificationHomeIcon from './icons/NotificationHomeIcon';
import NotificationReceiptIcon from './icons/NotificationReceiptIcon';

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return 'الآن';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes === 1) {
    return 'منذ دقيقة';
  }
  if (diffInMinutes === 2) {
    return 'منذ دقيقتين';
  }
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} دقائق`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours === 1) {
    return 'منذ ساعة';
  }
  if (diffInHours === 2) {
    return 'منذ ساعتين';
  }
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ساعات`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'منذ يوم';
  }
  if (diffInDays === 2) {
    return 'منذ يومين';
  }
  if (diffInDays < 30) {
    return `منذ ${diffInDays} أيام`;
  }
  return date.toLocaleDateString('ar-KW-u-nu-latn', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface NotificationCardProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
  onMenuPress: (
    notification: AppNotification,
    event: GestureResponderEvent,
  ) => void;
}

export default function NotificationCard({
  notification,
  onPress,
  onMenuPress,
}: NotificationCardProps) {
  // Alert matches are always about a listing; other types have no invoice
  // type yet, so fall back to spotting invoice/payment wording
  const isInvoice =
    notification.type !== 'ALERT_MATCH' &&
    (notification.title?.includes('فاتورة') ||
    notification.body?.includes('فاتورة') ||
      notification.title?.includes('دفع'));

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(notification)}
      className={`flex-row items-start justify-between rounded-[8px] p-4 ${
        notification.isRead
          ? 'border border-[#EBECEE] bg-white'
          : 'bg-[#F5F7F9]'
      }`}
    >
      {/* Right: Category Icon */}
      <View className="mt-0.5 size-[26px] items-center justify-center">
        {notification.type === 'NEW_DEVICE_LOGIN' ? (
          <Feather
            name="shield"
            size={22}
            color="#111111"
            testID="notification-security-icon"
          />
        ) : isInvoice ? (
          <NotificationReceiptIcon size={22} color="#111111" />
        ) : (
          <NotificationHomeIcon size={24} color="#111111" />
        )}
      </View>

      {/* Center: Title, Body, Timestamp */}
      <View className="px-3 flex-1 items-start">
        <Text
          className="font-cairo-semibold text-[14px] leading-[22px] tracking-[0.28px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {notification.title}
        </Text>
        {!!notification.body && (
          <Text
            className="mt-1 font-cairo text-[13px] leading-[20px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {notification.body}
          </Text>
        )}
        <Text
          className="mt-2 font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </View>


      {/* Left: Options Menu ⋮ Button */}
      <TouchableOpacity
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={(e) => onMenuPress(notification, e)}
        className="size-6 justify-center pt-0.5"
        accessibilityLabel="خيارات الإشعار"
      >
        <NotificationDotsIcon size={20} color="#111111" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
