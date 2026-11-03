import { Text, TouchableOpacity, View } from 'react-native';

import { CloseIcon, ShareIcon } from '@/assets/icons/home/property';

interface AdPreviewHeaderProps {
  title: string;
  // The switch: a draft's "published", an active ad's "visible"
  isOn: boolean;
  onTogglePress: () => void;
  onSharePress?: () => void;
  onClosePress: () => void;
}

/** The sheet's fixed top row: the ad's title, the switch, share and close. */
export default function AdPreviewHeader({
  title,
  isOn,
  onTogglePress,
  onSharePress,
  onClosePress,
}: AdPreviewHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-100">
      {/* Right Header Title */}
      <Text className="font-cairo-bold text-lg text-[#111111]">{title}</Text>
      {/* Left Actions: Close, Share, Publish Toggle */}
      <View className="flex-row items-center gap-3">
        <TouchableOpacity activeOpacity={0.8} onPress={onTogglePress}>
          <View
            className="w-11 h-6 rounded-full p-0.5 justify-center"
            style={{
              backgroundColor: isOn ? '#15304D' : '#E2E8F0',
              alignItems: isOn ? 'flex-start' : 'flex-end',
            }}
          >
            <View className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSharePress}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <ShareIcon size={18} color="#111111" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClosePress}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <CloseIcon size={20} color="#111111" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
