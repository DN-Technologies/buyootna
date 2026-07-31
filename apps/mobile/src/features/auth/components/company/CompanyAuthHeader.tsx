import { Feather } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import AppLogo from '@/shared/components/AppLogo';

interface CompanyAuthHeaderProps {
  type: 'company' | 'office';
  onSelectAccountType: () => void;
}

export const CompanyAuthHeader: React.FC<CompanyAuthHeaderProps> = ({
  type,
  onSelectAccountType,
}) => {
  const title = type === 'office' ? 'مكتب عقاري' : 'شركة';
  const icon =
    type === 'office'
      ? require('@/assets/icons/owner-icon.svg')
      : require('@/assets/icons/company-icon.svg');

  return (
    <View className="mb-0 mt-2 items-center">
      <View className="mb-1 h-14 w-14 items-center justify-center">
        <AppLogo width={56} height={56} fill="#0B2239" />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSelectAccountType}
        className="flex-row items-center px-4 py-2"
      >
        <Image
          source={icon}
          style={{
            width: 18,
            height: 18,
          }}
        />
        <Text className="mx-2 font-cairo-semibold text-base text-charcoal">
          {title}
        </Text>
        <Feather name="chevron-up" size={16} color="#6B6A6A" />
      </TouchableOpacity>
    </View>
  );
};
