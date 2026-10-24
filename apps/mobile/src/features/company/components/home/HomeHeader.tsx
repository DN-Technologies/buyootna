import { View } from 'react-native';

import AvatarPill from '@/shared/components/avatar-pill/AvatarPill';

interface HomeHeaderProps {
  // A double tap on the logo: the profile switcher
  onSwitchProfile: () => void;
}

// The home pill alone: the logo (its + adds a story), what's going on,
// chats and the bell
export default function HomeHeader({ onSwitchProfile }: HomeHeaderProps) {
  return (
    <View className="h-[52px] flex-row items-center px-4 py-[6px]">
      <AvatarPill onSwitchProfile={onSwitchProfile} />
    </View>
  );
}
