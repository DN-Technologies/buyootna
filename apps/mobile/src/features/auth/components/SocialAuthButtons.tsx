import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface SocialAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  // Each button spins independently for its own sign-in, and only its own.
  isGoogleLoading?: boolean;
  isAppleLoading?: boolean;
  // Some other action (e.g. the regular submit button) is in flight: disables
  // both buttons without showing a spinner on either.
  disabled?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onApplePress,
  isGoogleLoading = false,
  isAppleLoading = false,
  disabled = false,
}) => {
  // Both buttons are disabled while either is loading, to prevent tapping a
  // second provider mid-flight — but only the one actually loading spins.
  const isDisabled = isGoogleLoading || isAppleLoading || disabled;
  return (
    <View className="mb-4">
      <View className="mb-4 flex-row items-center">
        <View className="h-[1px] flex-1 bg-gray-200" />
        <Text className="mx-3 font-cairo text-xs text-[#6B6A6A]">
          أو قم بالتسجيل باستخدام
        </Text>
        <View className="h-[1px] flex-1 bg-gray-200" />
      </View>

      <View className="flex-row items-center justify-center gap-3">
        <TouchableOpacity
          testID="social-auth-apple-button"
          activeOpacity={0.7}
          onPress={onApplePress}
          disabled={isDisabled}
          className="h-[48px] w-[48px] items-center justify-center rounded-full border border-[#3D3D3D40] bg-white"
        >
          {isAppleLoading ? (
            <ActivityIndicator color="#0B2239" size="small" />
          ) : (
            <Image
              source={require('@/assets/icons/apple-icon.svg')}
              style={{ width: 20, height: 24 }}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          testID="social-auth-google-button"
          activeOpacity={0.7}
          onPress={onGooglePress}
          disabled={isDisabled}
          className="h-[48px] w-[48px] items-center justify-center rounded-full border border-[#3D3D3D40] bg-white"
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#0B2239" size="small" />
          ) : (
            <Image
              source={require('@/assets/icons/google-icon.svg')}
              style={{ width: 48, height: 48 }}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

