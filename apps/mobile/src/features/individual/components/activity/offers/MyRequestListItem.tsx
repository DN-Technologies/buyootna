import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import {
  RequestChatIcon,
  RequestChevronIcon,
  RequestClipboardIcon,
  VerifiedBadgeIcon,
} from '@/assets/icons/activity';
import type { CompanyRequestItem } from '@/features/company/components/requests/types';
import { openChatWith } from '@/shared/utils/openChat';

interface MyRequestListItemProps {
  request: CompanyRequestItem;
}

// Figma "Component 56/58": white card, 0.8 #ECECEC border, 6 radius, 16 padding
const CARD_STYLE = {
  shadowColor: '#919191',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 1,
  elevation: 1,
} as const;
const CARD_CLASS =
  'mb-[15px] w-full rounded-[6px] border-[0.8px] border-[#ECECEC] bg-white p-4';

const openDetails = (id: string) =>
  router.push({ pathname: '/request-details/[id]', params: { id } } as any);

const RequestBadge = () => (
  <View className="h-8 w-8 items-center justify-center rounded-[80px] bg-[#15304D]">
    <RequestClipboardIcon size={16} />
  </View>
);

// "طلب رقم 01#": the # trails the number so it reads #01 right-to-left
const requestLabel = (request: CompanyRequestItem) =>
  `طلب رقم ${(request.requestNumber ?? '').replace('#', '')}#`;

const RequestHeading = ({ request }: { request: CompanyRequestItem }) => (
  <>
    <Text
      className="font-cairo text-[12px] leading-[20px] text-[#111111]"
      style={{ writingDirection: 'rtl' }}
    >
      {requestLabel(request)}
    </Text>
    <Text
      className="font-cairo-semibold text-[14px] leading-[24px] text-[#15304D]"
      style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
      numberOfLines={1}
    >
      {request.title}
    </Text>
  </>
);

/**
 * A request the user submitted (عروضي), as in the Figma frames. Accepted
 * ones show the company carrying it out with a chat button; the others show
 * the company the request was sent to, or how many offers it has received.
 */
export default function MyRequestListItem({ request }: MyRequestListItemProps) {
  const { provider } = request;

  if (request.status === 'accepted') {
    return (
      <TouchableOpacity
        testID={`my-request-card-${request.id}`}
        activeOpacity={0.9}
        onPress={() => openDetails(request.id)}
        className={CARD_CLASS}
        style={CARD_STYLE}
      >
        <View className="flex-row items-start gap-2 pt-[2px]">
          <RequestBadge />
          <View className="flex-1 gap-[6px]">
            <RequestHeading request={request} />
          </View>
        </View>

        {provider && (
          <>
            <View className="my-5 h-[0.5px] w-full bg-[#D7D7D7]" />
            <View className="flex-row items-stretch gap-2">
              <View className="flex-1 gap-2">
                <Text
                  className="font-cairo-medium text-[12px] leading-[20px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  الشركة المنفذة
                </Text>
                <View className="flex-row items-center gap-2">
                  {provider.logoUrl ? (
                    <Image
                      source={{ uri: provider.logoUrl }}
                      className="h-10 w-10 rounded-[4px] bg-[#111111]"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-10 w-10 rounded-[4px] bg-[#F5F7F9]" />
                  )}
                  <View className="flex-1 gap-2">
                    <View className="flex-row items-center gap-[6px]">
                      <Text
                        className="font-cairo-semibold text-[14px] leading-[24px] text-[#111111]"
                        style={{ letterSpacing: 0.28 }}
                        numberOfLines={1}
                      >
                        {provider.name}
                      </Text>
                      {provider.isVerified && <VerifiedBadgeIcon />}
                    </View>
                    {!!provider.specialty && (
                      <Text
                        className="font-cairo-medium text-[12px] leading-[20px] text-[#6B6A6A]"
                        style={{ writingDirection: 'rtl' }}
                        numberOfLines={1}
                      >
                        {provider.specialty}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View className="w-10 justify-end">
                <TouchableOpacity
                  testID={`my-request-chat-${request.id}`}
                  accessibilityLabel="محادثة مع الشركة"
                  activeOpacity={0.8}
                  onPress={() =>
                    openChatWith(router, {
                      recipientId: provider.id,
                      requestId: request.id,
                    })
                  }
                  className="h-8 w-full items-center justify-center rounded-[24px] border border-[#B28648]"
                >
                  <RequestChatIcon />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  }

  const subtitle = provider
    ? provider.name
    : `${request.offersCount ?? 0} عروض`;

  return (
    <TouchableOpacity
      testID={`my-request-card-${request.id}`}
      activeOpacity={0.9}
      onPress={() => openDetails(request.id)}
      className={CARD_CLASS}
      style={CARD_STYLE}
    >
      <View className="flex-row items-start gap-2">
        <RequestBadge />
        <View className="flex-1 flex-row items-end justify-between">
          <View className="gap-[13px]">
            <View className="gap-2">
              <RequestHeading request={request} />
            </View>
            <Text
              testID={`my-request-subtitle-${request.id}`}
              className="font-cairo-medium text-[13px] leading-[20px] text-[#A0A0A0]"
              style={{ writingDirection: 'rtl' }}
            >
              {subtitle}
            </Text>
          </View>
          <View className="justify-center self-stretch">
            <RequestChevronIcon />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
