import { View } from 'react-native';

import AvatarPill from '@/shared/components/avatar-pill/AvatarPill';

interface OfficeHomeHeaderProps {
  // A double tap on the logo: the profile switcher
  onSwitchProfile: () => void;
}

// The home pill alone: the logo (its + adds a story), what's going on,
// chats and the bell
export default function OfficeHomeHeader({
  onSwitchProfile,
}: OfficeHomeHeaderProps) {
  return (
    <View className="flex-row items-center pb-4 pt-2">
      <AvatarPill onSwitchProfile={onSwitchProfile} />
    </View>
  );
}
