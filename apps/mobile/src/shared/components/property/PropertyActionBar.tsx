import { TouchableOpacity, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';

import { CallIcon, ChatIcon, WhatsappIcon } from '@/assets/icons/home/cards';

export interface PropertyActionBarProps {
  insets: EdgeInsets;
  onWhatsapp?: () => void;
  onCall?: () => void;
  onChat?: () => void;
}

export default function PropertyActionBar({
  insets,
  onWhatsapp,
  onCall,
  onChat,
}: PropertyActionBarProps) {
  return (
    <View
      className="absolute bottom-0 w-full flex-row items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 pt-3.5 shadow-lg"
      style={{
        paddingBottom: Math.max(insets.bottom, 16), // Provides proper breathing room above Android navigation bar and iOS Home Indicator
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      }}
    >
      {/* Phone Button (Navy Outline) */}
      <TouchableOpacity
        className="h-11 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#15304D]"
        activeOpacity={0.7}
        onPress={onCall}
      >
        <CallIcon color="#15304D" size={16} />
      </TouchableOpacity>

      {/* WhatsApp Button (Green Outline); none for companies and offices */}
      {onWhatsapp && (
        <TouchableOpacity
          className="h-11 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#60D669]"
          activeOpacity={0.7}
          onPress={onWhatsapp}
        >
          <WhatsappIcon size={20} />
        </TouchableOpacity>
      )}

      {/* Message/Chat Button (Gold Outline) */}
      <TouchableOpacity
        className="h-11 flex-1 flex-row items-center justify-center rounded-[24px] border border-[#B28648]"
        activeOpacity={0.7}
        onPress={onChat}
      >
        <ChatIcon color="#B28648" size={18} />
      </TouchableOpacity>
    </View>
  );
}

