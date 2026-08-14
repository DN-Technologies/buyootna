import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface SocialAuthButtonsProps {
  onGooglePress: () => void;
  onApplePress: () => void;
  isLoading?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGooglePress,
  onApplePress,
  isLoading = false,
}) => {
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
          disabled={isLoading}
          className="h-[48px] w-[48px] items-center justify-center rounded-full border border-[#3D3D3D40] bg-white"
        >
          {isLoading ? (
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
          disabled={isLoading}
          className="h-[48px] w-[48px] items-center justify-center rounded-full border border-[#3D3D3D40] bg-white"
        >
          {isLoading ? (
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

