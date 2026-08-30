import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

import AppLogo from '@/shared/components/AppLogo';

interface IndividualAuthHeaderProps {
  onSelectAccountType: () => void;
  onBack?: () => void;
}

export const IndividualAuthHeader: React.FC<IndividualAuthHeaderProps> = ({
  onSelectAccountType,
  onBack,
}) => {
  return (
    <View>
      {/* Header Back Button */}
      {onBack && (
        <View className="flex-row items-center justify-between w-full mb-1">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onBack}
            className="p-2 -ml-2"
            testID="auth-back-button"
          >
            <Image
              source={require('@/assets/icons/arrow-back.svg')}
              style={{ width: 12, height: 16 }}
            />
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-0 mt-0 items-center">
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
    </View>
  );
};
