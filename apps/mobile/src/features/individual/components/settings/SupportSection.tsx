import { CallIcon, InfoIcon, ShowIcon } from '@/assets/icons/settings';
import MenuItem from '@/shared/components/ui/MenuItem';

import SettingsSection from './SettingsSection';

interface SupportSectionProps {
  onAbout: () => void;
  onFaq: () => void;
  onContact: () => void;
}

export default function SupportSection({
  onAbout,
  onFaq,
  onContact,
}: SupportSectionProps) {
  return (
    <SettingsSection title="الدعم والمساعدة">
      <MenuItem icon={InfoIcon} title="عن بيوتنا" onPress={onAbout} />
      <MenuItem icon={ShowIcon} title="الأسئلة الشائعة" onPress={onFaq} />
      <MenuItem icon={CallIcon} title="تواصل معنا" onPress={onContact} />
    </SettingsSection>
  );
}
