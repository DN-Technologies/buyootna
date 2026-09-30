import { PrivacyIcon, TermsIcon } from '@/assets/icons/settings';
import MenuItem from '@/shared/components/ui/MenuItem';

import SettingsSection from './SettingsSection';

export default function PoliciesSection({
  onPrivacy,
  onTerms,
}: {
  onPrivacy: () => void;
  onTerms: () => void;
}) {
  return (
    <SettingsSection title="السياسات">
      <MenuItem icon={PrivacyIcon} title="سياسة الخصوصية" onPress={onPrivacy} />
      <MenuItem icon={TermsIcon} title="الشروط والأحكام" onPress={onTerms} />
    </SettingsSection>
  );
}
