import { ChatMessage } from '@/shared/api/chat.service';
import { ChatComposer } from '@/shared/components/chat/AttachmentPanel';
import LocationSheet from '@/shared/components/chat/LocationSheet';
import PropertyPickerSheet from '@/shared/components/chat/PropertyPickerSheet';
import ProposalSheet from '@/shared/components/chat/ProposalSheet';
import { RichMessagePayload } from '@/shared/hooks/chat/useChatComposer';

interface ChatComposerSheetsProps {
  // Which sheet is open, if any
  composer: ChatComposer | null;
  // The offer / appointment being countered
  counterOf: ChatMessage | null;
  // A rent ad prices offers per month
  isRent: boolean;
  onClose: () => void;
  onSend: (payload: RichMessagePayload) => void;
}

/** The "+" panel's sheets: عقار / الموقع / موعد معاينة / عرض سعر. */
export default function ChatComposerSheets({
  composer,
  counterOf,
  isRent,
  onClose,
  onSend,
}: ChatComposerSheetsProps) {
  if (composer === 'property') {
    return (
      <PropertyPickerSheet
        onClose={onClose}
        onPick={(p) =>
          onSend({
            type: 'PROPERTY',
            propertyId: p.id,
            property: {
              id: p.id,
              imageUrl: p.imageUrl,
              price: p.price,
              title: p.title,
              type: p.type,
              location: p.location,
            },
          })
        }
      />
    );
  }
  if (composer === 'location') {
    return (
      <LocationSheet
        onClose={onClose}
        onSend={(loc) =>
          onSend({
            type: 'LOCATION',
            latitude: loc.latitude,
            longitude: loc.longitude,
            locationLabel: loc.label ?? undefined,
          })
        }
      />
    );
  }
  if (composer === 'appointment' || composer === 'offer') {
    return (
      <ProposalSheet
        kind={composer === 'appointment' ? 'APPOINTMENT' : 'OFFER'}
        counterOf={counterOf?.proposal}
        defaultPeriod={isRent ? 'MONTHLY' : 'TOTAL'}
        onClose={onClose}
        onSubmit={(proposal) =>
          onSend({
            type: composer === 'appointment' ? 'APPOINTMENT' : 'OFFER',
            proposal,
          })
        }
      />
    );
  }
  return null;
}
