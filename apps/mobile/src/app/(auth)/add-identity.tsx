import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useIdentity } from '@/shared/hooks/useIdentity';
import { IdentityType } from '@/shared/store/useAuthStore';

interface IdentityOption {
  type: IdentityType;
  title: string;
  description: string;
  icon: any;
  route: string;
}

const identityOptions: IdentityOption[] = [
  {
    type: 'INDIVIDUAL',
    title: 'حساب فردي',
    description: 'للأفراد الذين يرغبون في نشر عقاراتهم الشخصية',
    icon: require('@/assets/icons/individual-icon.svg'),
    route: '/(auth)/add-identity-individual',
  },
  {
    type: 'COMPANY',
    title: 'حساب شركة',
    description: 'للشركات العقارية والمطورين',
    icon: require('@/assets/icons/company-icon.svg'),
    route: '/(auth)/add-identity-company',
  },
  {
    type: 'OFFICE',
    title: 'حساب مكتب',
    description: 'للمكاتب العقارية والوسطاء',
    icon: require('@/assets/icons/owner-icon.svg'),
    route: '/(auth)/add-identity-office',
  },
];

export default function AddIdentityScreen() {
  const { canCreateIdentity } = useIdentity();

  const handleSelect = (option: IdentityOption) => {
    if (!canCreateIdentity(option.type)) {
      // TODO: Show toast that this identity type is already created
      return;
    }
    router.push(option.route as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Feather name="arrow-right" size={20} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-bold text-lg text-charcoal">
          إضافة هوية جديدة
        </Text>
        <View className="w-10" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6 pt-4">
        <Text
          className="mb-2 font-cairo-semibold text-xl text-charcoal"
          style={{ writingDirection: 'rtl' }}
        >
          اختر نوع الهوية
        </Text>
        <Text
          className="mb-8 font-cairo-medium text-sm text-gray-medium"
          style={{ writingDirection: 'rtl' }}
        >
          يمكنك إضافة هويات متعددة للتبديل بينها بسهولة
        </Text>

        {/* Identity Options */}
        {identityOptions.map((option) => {
          const isDisabled = !canCreateIdentity(option.type);

          return (
            <TouchableOpacity
              key={option.type}
              activeOpacity={0.8}
              disabled={isDisabled}
              onPress={() => handleSelect(option)}
              className={`mb-4 flex-row items-center rounded-2xl border p-4 ${
                isDisabled
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Icon */}
              <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
                <Image
                  source={option.icon}
                  style={{ width: 28, height: 28 }}
                  resizeMode="contain"
                />
              </View>

              {/* Info */}
              <View className="ml-4 flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="font-cairo-bold text-base text-charcoal"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {option.title}
                  </Text>
                  {isDisabled && (
                    <View className="ml-2 rounded-full bg-gray-200 px-2 py-0.5">
                      <Text
                        className="font-cairo-medium text-xs text-gray-500"
                        style={{ paddingTop: Platform.OS === 'ios' ? 2 : 0 }}
                      >
                        موجود
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className="font-cairo-medium text-sm text-gray-medium"
                  style={{ writingDirection: 'rtl' }}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
              </View>

              {/* Arrow */}
              {!isDisabled && (
                <Feather name="chevron-left" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
