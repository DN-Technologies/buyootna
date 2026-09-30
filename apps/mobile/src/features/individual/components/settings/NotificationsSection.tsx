import { NotificationIcon } from '@/assets/icons/settings';
import MenuItem from '@/shared/components/ui/MenuItem';

import SettingsSection from './SettingsSection';

export default function NotificationsSection({
  onNotifications,
}: {
  onNotifications: () => void;
}) {
  return (
    <SettingsSection title="الاشعارات">
      <MenuItem
        icon={NotificationIcon}
        title="الإشعارات"
        onPress={onNotifications}
      />
    </SettingsSection>
  );
}
