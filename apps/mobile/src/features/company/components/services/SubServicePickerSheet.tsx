import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { BackChevronIcon } from '@/assets/icons/activity';
import { CheckboxOffIcon, CheckboxOnIcon } from '@/assets/icons/company-add';

interface SubServicePickerSheetProps {
  options: string[];
  selected: string[];
  // Already added: ticked, greyed, not pressable
  disabled: string[];
  onToggle: (type: string) => void;
}

/**
 * «اختر الخدمة الفرعية» (Figma 8455:25558): الكل, the specialty's types and
 * اخرى, each with its box on the right; back closes it.
 */
const SubServicePickerSheet = forwardRef<BottomSheetModal, SubServicePickerSheetProps>(
  ({ options, selected, disabled, onToggle }, ref) => {
    const snapPoints = useMemo(() => ['92%'], []);
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
    const close = () => (ref as any)?.current?.dismiss();

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        handleComponent={null}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        {/* Back on the right, the title centred, a blank on the left */}
        <View className="flex-row items-center gap-2 px-[10px] pb-2 pt-4">
          <TouchableOpacity
            testID="sub-service-picker-back"
            accessibilityLabel="رجوع"
            onPress={close}
            className="h-8 w-8 items-center justify-center"
          >
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <BackChevronIcon color="#111111" />
            </View>
          </TouchableOpacity>
          <Text className="flex-1 text-center font-cairo-semibold text-[18px] text-[#111111]">
            اختر الخدمة الفرعية
          </Text>
          <View className="h-8 w-8" />
        </View>
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48, gap: 8 }}>
          {options.map((option) => {
            const isDisabled = disabled.includes(option);
            const isSelected = isDisabled || selected.includes(option);
            return (
              <TouchableOpacity
                key={option}
                testID={`sub-service-option-${option}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                activeOpacity={0.7}
                disabled={isDisabled}
                onPress={() => onToggle(option)}
                className="h-9 flex-row items-center gap-2 p-2"
              >
                {isDisabled ? (
                  <CheckboxOnIcon color="#A0A0A0" />
                ) : isSelected ? (
                  <CheckboxOnIcon />
                ) : (
                  <CheckboxOffIcon />
                )}
                <Text
                  className={`flex-1 font-cairo-medium text-[14px] leading-[21px] ${
                    isDisabled
                      ? 'text-[#A0A0A0]'
                      : isSelected
                        ? 'text-[#15304D]'
                        : 'text-[#111111]'
                  }`}
                  style={{ writingDirection: 'rtl', letterSpacing: -0.408 }}
                  numberOfLines={1}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

SubServicePickerSheet.displayName = 'SubServicePickerSheet';
export default SubServicePickerSheet;
