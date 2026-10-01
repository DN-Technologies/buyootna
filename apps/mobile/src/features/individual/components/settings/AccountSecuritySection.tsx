import { DeviceIcon, LockIcon, LoginIcon } from '@/assets/icons/settings';
import MenuItem from '@/shared/components/ui/MenuItem';

import SettingsSection from './SettingsSection';

export default function AccountSecuritySection({
  onChangePassword,
  onDevices,
  onLoginMethod,
}: {
  onChangePassword: () => void;
  onDevices: () => void;
  onLoginMethod: () => void;
}) {
  return (
    <SettingsSection title="الحساب والامان">
      <MenuItem
        icon={LockIcon}
        title="تغيير كلمة المرور"
        onPress={onChangePassword}
      />
      <MenuItem icon={DeviceIcon} title="الاجهزة المسجلة" onPress={onDevices} />
      <MenuItem
        icon={LoginIcon}
        title="طريقة تسجيل الدخول"
        onPress={onLoginMethod}
      />
    </SettingsSection>
  );
}
