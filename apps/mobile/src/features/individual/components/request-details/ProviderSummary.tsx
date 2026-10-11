import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import { RequestChatIcon, VerifiedBadgeIcon } from '@/assets/icons/activity';
import type { RequestProviderInfo } from '@/features/company/components/requests/types';

interface ProviderSummaryProps {
  provider: RequestProviderInfo;
  // Gold chat button on the left; omitted where the card has its own actions
  onChatPress?: () => void;
}

/**
 * Logo, name with verified tick and specialty (and the chat button) --
 * Figma's company row, shared by the reply card, the offers list and the sheet.
 */
export default function ProviderSummary({
  provider,
  onChatPress,
}: ProviderSummaryProps) {
  return (
    <View className="flex-row items-center gap-2">
      {provider.logoUrl ? (
        <Image
          source={{ uri: provider.logoUrl }}
          style={{ width: 40.741, height: 40, borderRadius: 4, backgroundColor: '#111111' }}
          contentFit="cover"
        />
      ) : (
        <View className="h-10 w-[40.741px] rounded-[4px] bg-[#F5F7F9]" />
      )}

      <View className="flex-1 gap-[10px]">
        <View className="flex-row items-center gap-[6px]">
          <Text
            testID="provider-name"
            className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
            style={{ letterSpacing: 0.28 }}
            numberOfLines={1}
          >
            {provider.name}
          </Text>
          {provider.isVerified && <VerifiedBadgeIcon />}
        </View>
        {!!provider.specialty && (
          <Text
            className="font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {provider.specialty}
          </Text>
        )}
      </View>

      {onChatPress && (
        <TouchableOpacity
          testID="provider-chat"
          accessibilityLabel="محادثة مع الشركة"
          activeOpacity={0.8}
          onPress={onChatPress}
          className="h-8 w-10 items-center justify-center rounded-[18px]"
          style={{ borderWidth: 0.75, borderColor: '#B28648' }}
        >
          <RequestChatIcon />
        </TouchableOpacity>
      )}
    </View>
  );
}
