import { Text, TouchableOpacity, View } from 'react-native';

import type { RequestOffer } from '@/features/company/components/requests/types';
import ProviderSummary from '@/features/individual/components/request-details/ProviderSummary';
import {
  CardDivider,
  RequestCard,
} from '@/features/individual/components/request-details/RequestCard';

interface OffersCardProps {
  offers: RequestOffer[];
  // التفاصيل: opens the company's reply sheet
  onDetailsPress: (offer: RequestOffer) => void;
  // الرد: talk to the company
  onReplyPress: (offer: RequestOffer) => void;
}

/** "العروض": one card per company that answered, with التفاصيل / الرد. */
export default function OffersCard({
  offers,
  onDetailsPress,
  onReplyPress,
}: OffersCardProps) {
  return (
    <RequestCard>
      <View className="flex-row items-center justify-between">
        <Text
          className="font-cairo-bold text-[15px] leading-[20px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          العروض
        </Text>
        <Text className="font-cairo-medium text-[12px] leading-[14px] text-[#A0A0A0]">
          {offers.length} عروض
        </Text>
      </View>
      <CardDivider />

      <View className="gap-3">
        {offers.map((offer) => (
          <View
            key={offer.id}
            testID={`offer-card-${offer.id}`}
            className="overflow-hidden rounded-[6px] border-[0.8px] border-[#ECECEC] bg-white"
          >
            <View className="p-[14px]">
              <ProviderSummary provider={offer.provider} />
            </View>
            <View className="flex-row items-center gap-2 border-t border-[#ECECEC] bg-[#F5F7F9] px-3 py-2">
              <TouchableOpacity
                testID={`offer-reply-${offer.id}`}
                activeOpacity={0.8}
                onPress={() => onReplyPress(offer)}
                className="h-8 flex-1 items-center justify-center rounded-[24px] bg-[#15304D]"
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-white"
                  style={{ letterSpacing: 0.28 }}
                >
                  الرد
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID={`offer-details-${offer.id}`}
                activeOpacity={0.8}
                onPress={() => onDetailsPress(offer)}
                className="h-8 flex-1 items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white"
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
                  style={{ letterSpacing: 0.28 }}
                >
                  التفاصيل
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </RequestCard>
  );
}
