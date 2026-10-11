import { Text, View } from 'react-native';

import type {
  CompanyRequestItem,
  RequestOffer,
} from '@/features/company/components/requests/types';
import { formatAdDate } from '@/features/individual/components/activity/ads/formatAdDate';
import OffersCard from '@/features/individual/components/request-details/OffersCard';
import ProviderReplyCard from '@/features/individual/components/request-details/ProviderReplyCard';
import ProviderSummary from '@/features/individual/components/request-details/ProviderSummary';
import RequestAttachmentsCard from '@/features/individual/components/request-details/RequestAttachmentsCard';
import { RequestSectionCard } from '@/features/individual/components/request-details/RequestCard';
import RequestInfoCard from '@/features/individual/components/request-details/RequestInfoCard';
import RequestStatusBadge from '@/features/individual/components/request-details/RequestStatusBadge';
import { formatDetails } from '@/shared/components/map/picker/addressParsing';
import { formatTimeAgo } from '@/shared/utils/helpers/property';

interface RequestDetailsBodyProps {
  request: CompanyRequestItem;
  onChatPress: (providerId: string) => void;
  onOfferDetailsPress: (offer: RequestOffer) => void;
}

/** The offers worth showing for the request's state. */
export function shownOffers(request: CompanyRequestItem): RequestOffer[] {
  const offers = request.offers ?? [];
  if (request.status === 'responded') {
    return offers.filter((o) => o.status !== 'rejected');
  }
  if (request.status === 'accepted') {
    return offers.filter((o) => o.status === 'accepted');
  }
  return offers;
}

const lastUpdate = (request: CompanyRequestItem) =>
  `اخر تحديث ${formatTimeAgo(request.updatedAt ?? request.createdAt)}`;

/** Badge (left) and "last updated" (right), as under the pending title. */
function StatusRow({ request }: { request: CompanyRequestItem }) {
  return (
    <View className="h-[21px] flex-row items-center gap-2">
      <Text
        className="flex-1 font-cairo-medium text-[12px] leading-[14px] text-[#A0A0A0]"
        style={{ writingDirection: 'rtl' }}
      >
        {lastUpdate(request)}
      </Text>
      <RequestStatusBadge status={request.status} />
    </View>
  );
}

/** "تفاصيل الطلب" heading with its status tag and last update. */
function RequestSectionHeading({
  request,
  tag,
}: {
  request: CompanyRequestItem;
  tag: CompanyRequestItem['status'];
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 gap-2">
        <Text
          className="font-cairo-bold text-[15px] leading-[20px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          تفاصيل الطلب
        </Text>
        <Text
          className="font-cairo-medium text-[12px] leading-[14px] text-[#A0A0A0]"
          style={{ writingDirection: 'rtl' }}
        >
          {lastUpdate(request)}
        </Text>
      </View>
      <RequestStatusBadge status={tag} />
    </View>
  );
}

/** The request itself: info card, description, attachments. */
function RequestFacts({
  request,
  muted,
}: {
  request: CompanyRequestItem;
  muted?: boolean;
}) {
  const area = [request.location, formatDetails(request.addressDetails as any)]
    .filter(Boolean)
    .join('، ');

  return (
    <View className="gap-3">
      <RequestInfoCard
        requestNumber={request.requestNumber ?? ''}
        date={formatAdDate(request.createdAt)}
        priceRange={request.priceRange}
        service={request.category}
        area={area}
        muted={muted}
      />
      <RequestSectionCard title="الوصف" muted={muted}>
        <Text
          testID="request-description"
          className="font-cairo-medium text-[13px] leading-[18px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {request.description}
        </Text>
      </RequestSectionCard>
      <RequestAttachmentsCard images={request.images ?? []} muted={muted} />
    </View>
  );
}

/**
 * Details of a request the user sent, laid out per Figma by what it has:
 * several offers → the offers list; one company → its card and reply;
 * nothing yet → the request alone.
 */
export default function RequestDetailsBody({
  request,
  onChatPress,
  onOfferDetailsPress,
}: RequestDetailsBodyProps) {
  const offers = shownOffers(request);

  if (offers.length > 1) {
    return (
      <View className="gap-4">
        <OffersCard
          offers={offers}
          onDetailsPress={onOfferDetailsPress}
          onReplyPress={(offer) => onChatPress(offer.provider.id)}
        />
        <View className="gap-3">
          <RequestSectionHeading request={request} tag="responded" />
          <RequestFacts request={request} muted />
        </View>
      </View>
    );
  }

  const single = offers[0];
  const provider = single?.provider ?? request.provider;
  const reply = single?.reply;
  const hasProvider = !!provider && request.status !== 'pending';

  if (!hasProvider) {
    return (
      <View className="gap-6">
        <StatusRow request={request} />
        <RequestFacts request={request} />
      </View>
    );
  }

  return (
    <View className="gap-4">
      {request.status === 'rejected' && <StatusRow request={request} />}

      <View className="rounded-[6px] bg-[#F9FAFE] p-[14px]">
        <ProviderSummary
          provider={provider}
          onChatPress={() => onChatPress(provider.id)}
        />
      </View>

      {reply && <ProviderReplyCard reply={reply} />}

      <View className="gap-3">
        <RequestSectionHeading
          request={request}
          // A rejected offer was still answered: the design keeps تم الرد here
          tag={request.status === 'rejected' ? 'responded' : request.status}
        />
        <RequestFacts request={request} />
      </View>
    </View>
  );
}

