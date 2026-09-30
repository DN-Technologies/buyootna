import { DeviceIcon, LockIcon } from '@/assets/icons/settings';
import MenuItem from '@/shared/components/ui/MenuItem';

import SettingsSection from './SettingsSection';

export default function AccountSecuritySection({
  onChangePassword,
  onDevices,
}: {
  onChangePassword: () => void;
  onDevices: () => void;
}) {
  return (
    <SettingsSection title="الحساب والامان">
      <MenuItem
        icon={LockIcon}
        title="تغيير كلمة المرور"
        onPress={onChangePassword}
      />
      <MenuItem icon={DeviceIcon} title="الاجهزة المسجلة" onPress={onDevices} />
    </SettingsSection>
  );
}
