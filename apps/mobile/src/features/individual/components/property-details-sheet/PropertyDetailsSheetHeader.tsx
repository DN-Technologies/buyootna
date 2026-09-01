import { Text, TouchableOpacity, View } from 'react-native';

import { HeartIcon } from '@/assets/icons/home/cards';
import { CloseIcon, ShareIcon } from '@/assets/icons/home/property';

interface PropertyDetailsSheetHeaderProps {
  title: string;
  showActions: boolean;
  isFavorited: boolean;
  onFavorite?: () => void;
  onShare?: () => void;
  onClose?: () => void;
}

export default function PropertyDetailsSheetHeader({
  title,
  showActions,
  isFavorited,
  onFavorite,
  onShare,
  onClose,
}: PropertyDetailsSheetHeaderProps) {
  return (
    <View
      className="flex-row items-center justify-between border-b border-gray-100 px-5 pb-3 pt-2"
      style={{ flexDirection: 'row' }}
    >
      {/* Title (Right Side) */}
      <Text className="font-cairo-semibold text-lg text-[#111111]">
        {title}
      </Text>
      {/* Actions (Left Side) */}
      <View className="flex-row items-center gap-3">
        {showActions && (
          <>
            {/* Favorite */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onFavorite}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <HeartIcon
                color={isFavorited ? '#BA0003' : '#111111'}
                size={16}
                filled={isFavorited}
              />
            </TouchableOpacity>
            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onShare}
              className="h-8 w-8 items-center justify-center rounded-full"
            >
              <ShareIcon color="#111111" size={16} />
            </TouchableOpacity>
          </>
        )}
        {/* Close */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onClose}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <CloseIcon color="#111111" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
