import { Image } from 'expo-image';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { openUrlThrottled } from '@/shared/utils/openUrl';

import { RequestClientInfo } from '../types';
import {
  ClientChatIcon,
  ClientPhoneIcon,
  RatingStarIcon,
} from './icons';

export interface RequestDetailsClientCardProps {
  client?: RequestClientInfo | null;
  onChatPress?: () => void;
  // The chat is being opened: a spinner in place of the icon
  isOpeningChat?: boolean;
  onCallPress?: () => void;
}

export default function RequestDetailsClientCard({
  client,
  onChatPress,
  isOpeningChat = false,
  onCallPress,
}: RequestDetailsClientCardProps) {
  if (!client) return null;

  const handleCall = () => {
    if (onCallPress) {
      onCallPress();
      return;
    }
    if (client.phone) {
      openUrlThrottled(`tel:${client.phone}`).catch(() => {});
    }
  };

  return (
    <View className="mt-4 rounded-[10px] border border-[#ECECEC] bg-[#F9FAFE] p-3.5">
      {/* RTL Row: Child 0 is Visual Right (Avatar + Info + Buttons), Child 1 is Visual Left (Rating) */}
      <View className="flex-row items-start justify-between">
        {/* Child 0 (Visual Right): Avatar & Info */}
        <View className="flex-1 flex-row items-center gap-3">
          {/* Avatar */}
          <View className="size-[52px] overflow-hidden rounded-full border border-gray-200 bg-white">
            {client.avatarUrl ? (
              <Image
                source={{ uri: client.avatarUrl }}
                contentFit="cover"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              // No photo yet: the name's first letter
              <View className="flex-1 items-center justify-center bg-[#DEE3E8]">
                <Text className="font-cairo-bold text-[18px] text-[#15304D]">
                  {client.name.trim().charAt(0)}
                </Text>
              </View>
            )}
          </View>

          {/* Name & Subtitle & Actions */}
          <View className="flex-1 items-start">
            <Text
              testID="request-details-client-name"
              className="font-cairo-bold text-[15px] text-[#111111]"
              style={{ writingDirection: 'rtl', textAlign: 'right' }}
            >
              {client.name}
            </Text>
            <Text
              testID="request-details-client-meta"
              className="mt-0.5 font-cairo-medium text-[11px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl', textAlign: 'right' }}
            >
              {client.joinedDate} • {client.previousOffers} عروض سابقة
            </Text>

            {/* Communication Action Buttons Row */}
            <View className="mt-2.5 flex-row items-center gap-2">
              {/* Chat Button */}
              <TouchableOpacity
                testID="request-details-chat-button"
                onPress={onChatPress}
                disabled={isOpeningChat}
                activeOpacity={0.7}
                className="size-[30px] items-center justify-center rounded-full border border-[#B28648] bg-white"
                accessibilityLabel="محادثة"
              >
                {isOpeningChat ? (
                  <ActivityIndicator
                    testID="request-details-chat-loading"
                    size="small"
                    color="#B28648"
                  />
                ) : (
                  <ClientChatIcon size={16} color="#B28648" />
                )}
              </TouchableOpacity>

              {/* No WhatsApp: companies and offices use call and in-app
                  chat only (mobile-no-whatsapp-business) */}
              {/* Call Button */}
              <TouchableOpacity
                testID="request-details-call-button"
                onPress={handleCall}
                activeOpacity={0.7}
                className="size-[30px] items-center justify-center rounded-full border border-[#15304D] bg-white"
                accessibilityLabel="اتصال هاتفياً"
              >
                <ClientPhoneIcon size={16} color="#15304D" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Child 1 (Visual Left): Star Rating, once the client has one */}
        {client.rating != null && (
          <View
            testID="request-details-client-rating"
            className="flex-row items-center gap-1 rounded-full bg-white px-2 py-1 border border-gray-100"
          >
            <Text className="font-cairo-bold text-[13px] text-[#111111]">
              {client.rating.toFixed(1)}
            </Text>
            <RatingStarIcon size={12} color="#F59E0B" />
          </View>
        )}
      </View>
    </View>
  );
}
