import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FavoritesOptionsSheetProps {
  onClearAll: () => void;
  onClose?: () => void;
}

const FavoritesOptionsSheet = forwardRef<
  BottomSheetModal,
  FavoritesOptionsSheetProps
>(({ onClearAll, onClose }, ref) => {
  const snapPoints = useMemo(() => ['26%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    [],
  );

  const handleDismiss = () => {
    // @ts-ignore
    ref.current?.dismiss();
    if (onClose) onClose();
  };

  const handleClearAll = () => {
    handleDismiss();
    onClearAll();
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: '#111111',
        width: 44,
        height: 4,
        borderRadius: 2,
      }}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      enablePanDownToClose
    >
      <BottomSheetView className="flex-1 px-5 pb-8 pt-1">
        {/* Header */}
        <View className="mb-2 flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDismiss}
            className="p-1"
          >
            <Feather name="x" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Clear All Option */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClearAll}
          className="h-14 w-full flex-row items-center gap-2.5 rounded-[16px] px-3"
        >
          <Feather name="trash-2" size={22} color="#9C1E28" />
          <Text className="font-cairo-medium leading-[22px] text-base text-[#9C1E28]">
            مسح الكل
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

FavoritesOptionsSheet.displayName = 'FavoritesOptionsSheet';

export default FavoritesOptionsSheet;
