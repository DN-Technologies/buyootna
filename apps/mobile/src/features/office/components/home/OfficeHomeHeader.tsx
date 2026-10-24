import { View } from 'react-native';

import StudioModeSwitch, {
  type BusinessHomeMode,
} from '@/features/stories/studio/StudioModeSwitch';
import AvatarPill from '@/shared/components/avatar-pill/AvatarPill';

interface OfficeHomeHeaderProps {
  // A double tap on the logo: the profile switcher
  onSwitchProfile: () => void;
  mode: BusinessHomeMode;
  onModeChange: (mode: BusinessHomeMode) => void;
}

// The home pill (the logo, whose + adds a story, what's going on, chats and
// the bell) and «الرئيسية / الاستوديو»
export default function OfficeHomeHeader({
  onSwitchProfile,
  mode,
  onModeChange,
}: OfficeHomeHeaderProps) {
  return (
    <View className="flex-row items-center justify-between pb-4 pt-2">
      <AvatarPill onSwitchProfile={onSwitchProfile} />
      <StudioModeSwitch mode={mode} onChange={onModeChange} />
    </View>
  );
}
