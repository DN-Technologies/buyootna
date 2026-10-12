import PhoneInputField from '@/shared/components/add-listing/PhoneInputField';
import ToggleField from '@/shared/components/add-listing/ToggleField';
import { useListingStore } from '@/shared/store/useListingStore';

/**
 * رقم الهاتف and رقم الواتساب: each is on the ad only while its toggle is on.
 * With both off, people reach the advertiser through in-app chat.
 */
export default function ContactToggles() {
  const showPhone = useListingStore((s) => s.showPhone);
  const phoneNumber = useListingStore((s) => s.phoneNumber);
  const showWhatsapp = useListingStore((s) => s.showWhatsapp);
  const whatsappNumber = useListingStore((s) => s.whatsappNumber);
  const updateField = useListingStore((s) => s.updateField);

  return (
    <>
      <ToggleField
        label="رقم الهاتف"
        value={showPhone}
        onToggle={(value) => updateField('showPhone', value)}
        required
        testID="toggle-phone"
      >
        <PhoneInputField
          testID="input-phone"
          value={phoneNumber}
          onChangeText={(text) => updateField('phoneNumber', text)}
        />
      </ToggleField>

      <ToggleField
        label="رقم الواتساب"
        value={showWhatsapp}
        onToggle={(value) => updateField('showWhatsapp', value)}
        required
        testID="toggle-whatsapp"
      >
        <PhoneInputField
          testID="input-whatsapp"
          value={whatsappNumber}
          onChangeText={(text) => updateField('whatsappNumber', text)}
        />
      </ToggleField>
    </>
  );
}
