import { TouchableOpacity, View } from 'react-native';

import { CallIcon, ChatIcon, WhatsappIcon } from '@/assets/icons/home/cards';

interface PropertyContactActionsBarProps {
  onCall: () => void;
  onWhatsApp: () => void;
  onChat: () => void;
}

export default function PropertyContactActionsBar({
  onCall,
  onWhatsApp,
  onChat,
}: PropertyContactActionsBarProps) {
  return (
    <View className="mb-5 flex-row items-center justify-start gap-4">
      {/* Call Button (Navy Border) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onCall}
        className="h-12 w-20 items-center justify-center rounded-full border border-[#15304D]"
      >
        <CallIcon color="#15304D" size={16} />
      </TouchableOpacity>

      {/* WhatsApp Button (Green Border) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onWhatsApp}
        className="h-12 w-20 items-center justify-center rounded-full border border-[#60D669]"
      >
        <WhatsappIcon size={20} />
      </TouchableOpacity>

      {/* Chat Button (Gold Border) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onChat}
        className="h-12 w-20 items-center justify-center rounded-full border border-[#B28648]"
      >
        <ChatIcon color="#B28648" size={18} />
      </TouchableOpacity>
    </View>
  );
}
