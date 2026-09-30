import {
  HideAdIcon,
  HideIcon,
  InfoIcon,
  ShowIcon,
} from '@/assets/icons/settings';
import type { SettingsPatch } from '@/features/individual/hooks/useUserSettings';

import SettingsSection from './SettingsSection';
import SettingsSwitchItem from './SettingsSwitchItem';

interface PrivacySettingsSectionProps {
  showPhone: boolean;
  showWhatsapp: boolean;
  hideActivity: boolean;
  hideOfficeAds: boolean;
  onChange: (patch: SettingsPatch) => void;
}

export default function PrivacySettingsSection({
  showPhone,
  showWhatsapp,
  hideActivity,
  hideOfficeAds,
  onChange,
}: PrivacySettingsSectionProps) {
  return (
    <SettingsSection title="الخصوصية">
      <SettingsSwitchItem
        testID="switch-phone"
        icon={InfoIcon}
        title="اظهار رقم الهاتف"
        value={showPhone}
        onValueChange={(value) => onChange({ showPhone: value })}
      />
      <SettingsSwitchItem
        testID="switch-whatsapp"
        icon={ShowIcon}
        title="اظهار رقم الواتساب"
        value={showWhatsapp}
        onValueChange={(value) => onChange({ showWhatsapp: value })}
      />
      <SettingsSwitchItem
        testID="switch-activity"
        icon={HideIcon}
        title="اخفاء النشاط"
        value={hideActivity}
        onValueChange={(value) => onChange({ hideActivity: value })}
      />
      <SettingsSwitchItem
        testID="switch-office-ads"
        icon={HideAdIcon}
        title="اخفاء اعلانات المكاتب"
        value={hideOfficeAds}
        onValueChange={(value) => onChange({ hideOfficeAds: value })}
      />
    </SettingsSection>
  );
}
