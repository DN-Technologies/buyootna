import { View } from 'react-native';

import { HideAdIcon, HideIcon, ShowIcon } from '@/assets/icons/settings';
import type { SettingsPatch } from '@/features/individual/hooks/useUserSettings';

import SettingsSwitchItem from './SettingsSwitchItem';

interface PrivacySettingsSectionProps {
  showWhatsapp: boolean;
  hideActivity: boolean;
  hideOfficeAds: boolean;
  onChange: (patch: SettingsPatch) => void;
}

export default function PrivacySettingsSection({
  showWhatsapp,
  hideActivity,
  hideOfficeAds,
  onChange,
}: PrivacySettingsSectionProps) {
  return (
    <View className="rounded-xl bg-[#F9FAFE] px-4">
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
    </View>
  );
}
