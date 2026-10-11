import { PropertyContext, RequestContext } from '@/shared/api/chat.service';
import ChatPinnedContext from '@/shared/components/chat/ChatPinnedContext';
import { formatNumber } from '@/shared/utils/formatNumber';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

export interface ChatPinnedPropertyBarProps {
  propertyContext?: PropertyContext | null;
  // A chat about a quote request shows that instead of an ad
  requestContext?: RequestContext | null;
  visible: boolean;
  onDismiss: () => void;
  onPressProperty: (propertyId: string) => void;
  onPressRequest?: (requestId: string) => void;
}

const joinDetails = (parts: (string | null | undefined)[]) =>
  parts.filter(Boolean).join(' • ');

/**
 * The bar pinned under the chat header: the quote request the chat is
 * about, or else the ad it was opened from.
 */
export default function ChatPinnedPropertyBar({
  propertyContext,
  requestContext,
  visible,
  onPressProperty,
  onPressRequest,
}: ChatPinnedPropertyBarProps) {
  if (!visible) return null;

  if (requestContext) {
    return (
      <ChatPinnedContext
        testID="chat-pinned-request"
        title={requestContext.title}
        subtitle={joinDetails([
          requestContext.location,
          requestContext.priceRange,
        ])}
        onPress={
          onPressRequest ? () => onPressRequest(requestContext.id) : undefined
        }
      />
    );
  }

  if (!propertyContext) return null;

  const category = getArabicCategoryLabel(propertyContext.category) || 'عقار';
  const type = getArabicTypeLabel(propertyContext.type);

  const price =
    propertyContext.price && propertyContext.price > 0
      ? `${formatNumber(propertyContext.price)} د.ك`
      : propertyContext.type === 'EXCHANGE' || propertyContext.type === 'للبدل'
        ? 'للبدل'
        : 'السعر غير معلن';

  return (
    <ChatPinnedContext
      testID="chat-pinned-property"
      title={[category, type].filter(Boolean).join(' ')}
      subtitle={joinDetails([propertyContext.location, price])}
      onPress={() => {
        if (propertyContext.id) onPressProperty(propertyContext.id);
      }}
    />
  );
}
