import { View } from 'react-native';

import StudioModeSwitch, {
  type BusinessHomeMode,
} from '@/features/stories/studio/StudioModeSwitch';
import AvatarPill from '@/shared/components/avatar-pill/AvatarPill';

interface HomeHeaderProps {
  // A double tap on the logo: the profile switcher
  onSwitchProfile: () => void;
  mode: BusinessHomeMode;
  onModeChange: (mode: BusinessHomeMode) => void;
}

// The home pill (the logo, whose + adds a story, what's going on, chats and
// the bell) and «الرئيسية / الاستوديو»
export default function HomeHeader({
  onSwitchProfile,
  mode,
  onModeChange,
}: HomeHeaderProps) {
  return (
    <View className="h-[52px] flex-row items-center justify-between px-4 py-[6px]">
      <AvatarPill onSwitchProfile={onSwitchProfile} />
      <StudioModeSwitch mode={mode} onChange={onModeChange} />
    </View>
  );
}
