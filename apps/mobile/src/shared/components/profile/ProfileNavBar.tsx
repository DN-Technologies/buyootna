import { Feather } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileNavBarProps {
  onBack?: () => void;
  onMore?: () => void;
}

export default function ProfileNavBar({ onBack, onMore }: ProfileNavBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = onBack || (() => router.back());

  return (
    <View
      style={{ flexDirection: 'row', paddingTop: insets.top + 4 }}
      className="w-full flex-row items-center justify-between bg-white px-5 pb-4"
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleBack}
        className="p-2"
        accessibilityRole="button"
        accessibilityLabel="رجوع"
      >
        <ExpoImage
          source={require('@/assets/icons/arrow-back.svg')}
          style={{ width: 10, height: 14, tintColor: '#111111' }}
          contentFit="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onMore}
        className="p-2"
        accessibilityRole="button"
        accessibilityLabel="المزيد"
      >
        <Feather name="more-vertical" size={20} color="#111111" />
      </TouchableOpacity>
    </View>
  );
}
