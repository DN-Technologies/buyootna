import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';

interface SuccessBottomSheetProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  iconType?: 'check' | 'document-search';
  footerText?: string;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  /** Visual style of the optional secondary button. Defaults to 'gold'. */
  secondaryButtonVariant?: 'gold' | 'neutral';
}

const SuccessBottomSheet = forwardRef<
  BottomSheetModal,
  SuccessBottomSheetProps
>(
  (
    {
      title,
      description,
      buttonText,
      onPress,
      iconType = 'check',
      footerText,
      secondaryButtonText,
      onSecondaryPress,
      secondaryButtonVariant = 'gold',
    },
    ref,
  ) => {
    const snapPoints = useMemo(() => {
      if (secondaryButtonText) {
        return footerText ? ['55%'] : ['50%'];
      }
      if (footerText) {
        return ['45%'];
      }
      return ['40%'];
    }, [footerText, secondaryButtonText]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: '#111111',
          width: 40,
          height: 4,
        }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 28 }}
      >
        <BottomSheetView
          accessible={false}
          className="mb-6 flex-1 items-center justify-center px-6 pb-8 pt-4"
        >
          <View className="mt-4 items-center">
            {/* Dynamic Success Icon */}
            {iconType === 'document-search' ? (
              <SafeLinearGradient
                colors={['#33D679', '#AADB53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 24,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="file-text" size={32} color="white" />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      backgroundColor: '#38D97D',
                      borderRadius: 10,
                      padding: 1,
                      borderWidth: 1.5,
                      borderColor: 'white',
                    }}
                  >
                    <Feather name="search" size={10} color="white" />
                  </View>
                </View>
              </SafeLinearGradient>
            ) : (
              <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Image
                  source={require('@/assets/icons/success-icon.svg')}
                  style={{ width: 74, height: 74 }}
                />
              </View>
            )}

            {/* Text Content */}
            <Text className="mb-2 text-center font-cairo-bold text-xl text-[#111111]">
              {title}
            </Text>
            <Text className="mb-6 px-4 text-center font-cairo-semibold text-sm leading-6 text-[#6B6A6A]">
              {description}
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="mb-4 h-[48px] w-full items-center justify-center rounded-3xl bg-[#15304D]"
          >
            <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
              {buttonText}
            </Text>
          </TouchableOpacity>

          {/* Optional Secondary (Outlined) Button */}
          {secondaryButtonText && onSecondaryPress && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSecondaryPress}
              className={`mb-4 h-[48px] w-full items-center justify-center rounded-3xl border bg-white ${
                secondaryButtonVariant === 'neutral'
                  ? 'border-[#E2E8F0]'
                  : 'border-[#D4AF37]'
              }`}
            >
              <Text
                className={`font-cairo-semibold text-[14px] leading-[24px] ${
                  secondaryButtonVariant === 'neutral'
                    ? 'text-[#111111]'
                    : 'text-[#D4AF37]'
                }`}
              >
                {secondaryButtonText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Optional Footer Text */}
          {footerText && (
            <Text className="text-center font-cairo-medium text-xs text-[#9CA3AF]">
              {footerText}
            </Text>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

SuccessBottomSheet.displayName = 'SuccessBottomSheet';

export default SuccessBottomSheet;
