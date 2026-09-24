import { PropertyContext } from '@/shared/api/chat.service';
import ChatPinnedContext from '@/shared/components/chat/ChatPinnedContext';
import {
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/shared/utils/helpers/property';

export interface ChatPinnedPropertyBarProps {
  propertyContext?: PropertyContext | null;
  visible: boolean;
  onDismiss: () => void;
  onPressProperty: (propertyId: string) => void;
}

export default function ChatPinnedPropertyBar({
  propertyContext,
  visible,
  onDismiss,
  onPressProperty,
}: ChatPinnedPropertyBarProps) {
  if (!propertyContext || !visible) return null;

  const title = propertyContext.location
    ? `${getArabicCategoryLabel(propertyContext.category)} بـ ${propertyContext.location}`
    : getArabicCategoryLabel(propertyContext.category) || 'عقار';

  const badgeText = getArabicTypeLabel(propertyContext.type);

  const price =
    propertyContext.price && propertyContext.price > 0
      ? `${propertyContext.price.toLocaleString()} د.ك`
      : propertyContext.type === 'EXCHANGE' || propertyContext.type === 'للبدل'
        ? 'للبدل'
        : 'السعر غير معلن';

  const area = propertyContext.area ? `${propertyContext.area} م²` : undefined;

  return (
    <ChatPinnedContext
      imageUrl={propertyContext.imageUrl}
      title={title}
      badgeText={badgeText}
      price={price}
      area={area}
      onPress={() => {
        if (propertyContext.id) {
          onPressProperty(propertyContext.id);
        }
      }}
      onDismiss={onDismiss}
    />
  );
}
