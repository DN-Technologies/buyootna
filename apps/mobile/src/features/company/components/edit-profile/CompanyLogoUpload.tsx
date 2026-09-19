import { TouchableOpacity, View } from 'react-native';

import { CameraBadgeIcon } from '@/assets/icons/more';
import Avatar from '@/shared/components/Avatar';

interface CompanyLogoUploadProps {
  avatarUri?: string | null;
  onPickLogo: () => void;
}

export default function CompanyLogoUpload({
  avatarUri,
  onPickLogo,
}: CompanyLogoUploadProps) {
  return (
    <View className="my-6 items-center justify-center">
      <View className="relative">
        <View
          style={{
            width: 126,
            height: 120,
            backgroundColor: '#133C2F',
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
          }}
          className="border-2 border-white shadow-sm shadow-gray-200"
        >
          <Avatar uri={avatarUri} />
        </View>

        {/* Camera Badge Action Button (Visual Right in RTL) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPickLogo}
          style={{ position: 'absolute', bottom: -4, start: -4 }}
          className="h-8 w-8 items-center justify-center rounded-full border border-white bg-[#15304D] shadow"
        >
          <CameraBadgeIcon size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
