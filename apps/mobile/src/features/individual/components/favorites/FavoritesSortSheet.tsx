import { Feather } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';

import { FavoritesTab } from './FavoritesTabs';

export type FavoritesSortOption =
  | 'all'
  | 'oldest'
  | 'newest'
  | 'price_desc'
  | 'price_asc'
  | 'rating_desc'
  | 'rating_asc';

interface FavoritesSortSheetProps {
  activeTab: FavoritesTab;
  selectedSort: FavoritesSortOption;
  onSelectSort: (sort: FavoritesSortOption) => void;
  onClose?: () => void;
}

const PROPERTY_SORT_OPTIONS: { key: FavoritesSortOption; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'oldest', label: 'الأقدم أولاً' },
  { key: 'newest', label: 'الأحدث أولاً' },
  { key: 'price_desc', label: 'السعر (من الأعلى للأقل)' },
  { key: 'price_asc', label: 'السعر (من الأقل للأعلى)' },
];

const ENTITY_SORT_OPTIONS: { key: FavoritesSortOption; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'oldest', label: 'الأقدم أولاً' },
  { key: 'newest', label: 'الأحدث أولاً' },
  { key: 'rating_desc', label: 'الأعلى تقييماً' },
  { key: 'rating_asc', label: 'الأقل تقييماً' },
];

const FavoritesSortSheet = forwardRef<BottomSheetModal, FavoritesSortSheetProps>(
  ({ activeTab, selectedSort, onSelectSort, onClose }, ref) => {
    const snapPoints = useMemo(() => ['54%'], []);

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

    const handleSelect = (key: FavoritesSortOption) => {
      onSelectSort(key);
      handleDismiss();
    };

    const options =
      activeTab === 'properties' ? PROPERTY_SORT_OPTIONS : ENTITY_SORT_OPTIONS;

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
        <SafeBottomSheetView className="flex-1 px-5 pb-8 pt-1">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-cairo-semibold text-lg text-[#111111]">
              الترتيب حسب
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDismiss}
              className="p-1"
            >
              <Feather name="x" size={20} color="#111111" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <View className="flex-col gap-2.5">
            {options.map((option) => {
              const isSelected = selectedSort === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.8}
                  onPress={() => handleSelect(option.key)}
                  className={`h-12 w-full flex-row items-center gap-2.5 rounded-[16px] border px-4 ${
                    isSelected
                      ? 'border-[#15304D] bg-white'
                      : 'border-[#D7D7D7] bg-white'
                  }`}
                >
                  {/* Radio Indicator */}
                  <View
                    className={`h-5 w-5 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-2 border-[#15304D]'
                        : 'border-[#D7D7D7]'
                    }`}
                  >
                    {isSelected && (
                      <View className="h-2.5 w-2.5 rounded-full bg-[#15304D]" />
                    )}
                  </View>
                  
                  <Text
                    className={`font-cairo-medium text-sm ${
                      isSelected ? 'text-[#15304D]' : 'text-[#111111]'
                    }`}
                  >
                    {option.label}
                  </Text>

                </TouchableOpacity>
              );
            })}
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

FavoritesSortSheet.displayName = 'FavoritesSortSheet';

export default FavoritesSortSheet;
