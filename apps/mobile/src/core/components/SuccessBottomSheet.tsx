import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity,View } from 'react-native';

interface SuccessBottomSheetProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  // Optional: Allow you to switch to the green "document" icon for company signup later
  iconName?: keyof typeof Feather.glyphMap;
}

const SuccessBottomSheet = forwardRef<
  BottomSheetModal,
  SuccessBottomSheetProps
>(({ title, description, buttonText, onPress, iconName = 'check' }, ref) => {
  const snapPoints = useMemo(() => ['40%'], []);

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
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 40 }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
    >
      <BottomSheetView className="mb-6 flex-1 items-center justify-center px-6 pb-8 pt-4">
        <View className="mt-4 items-center">
          {/* Success Icon Circle */}
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Image
              source={require('@/assets/icons/success-icon.svg')}
              style={{ width: 74, height: 74 }}
            />
          </View>

          {/* Text Content */}
          <Text className="text-center font-cairo-bold text-xl text-[#111111]">
            {title}
          </Text>
          <Text className="mb-3 px-4 text-center font-cairo-semibold text-sm leading-6 text-[#6B6A6A]">
            {description}
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          className="mb-2 w-full items-center justify-center rounded-3xl bg-[#15304D] py-4"
        >
          <Text className="font-cairo-bold text-lg text-white">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

SuccessBottomSheet.displayName = 'SuccessBottomSheet';

export default SuccessBottomSheet;
