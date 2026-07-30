import { Feather } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import AppLogo from '@/core/components/AppLogo';

interface IndividualAuthHeaderProps {
  onSelectAccountType: () => void;
}

export const IndividualAuthHeader: React.FC<IndividualAuthHeaderProps> = ({
  onSelectAccountType,
}) => {
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
          source={require('@/assets/icons/individual-icon.svg')}
          style={{
            width: 18,
            height: 18,
          }}
        />
        <Text className="mx-2 font-cairo-semibold text-base leading-[22px] text-charcoal">
          فرد
        </Text>
        <Feather name="chevron-up" size={16} color="#6B6A6A" />
      </TouchableOpacity>
    </View>
  );
};
