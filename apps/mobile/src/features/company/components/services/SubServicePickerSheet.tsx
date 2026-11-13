import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetScrollViewMethods,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackChevronIcon } from '@/assets/icons/activity';
import { CheckboxOffIcon, CheckboxOnIcon } from '@/assets/icons/company-add';
import FieldLabel from '@/features/company/components/invoice/FieldLabel';
import { useScrollFieldAboveKeyboard } from '@/shared/hooks/useScrollFieldAboveKeyboard';

interface SubServicePickerSheetProps {
  options: string[];
  selected: string[];
  // Already added: ticked, greyed, not pressable
  disabled: string[];
  onToggle: (type: string) => void;
  // The bottom button adds what is ticked; with «اخرى» ticked, once its
  // «عنوان الخدمة» (asked right here) is typed
  canAdd: boolean;
  needsTitle: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  isSubmitting: boolean;
  onAdd: () => void;
}

/**
 * «اختر الخدمة الفرعية» (Figma 8455:25558): الكل, the specialty's types and
 * اخرى, each with its box on the right; back closes it. Below the list,
 * «اضافة» adds the ticked types straight away (QA: the frame had no way
 * to add from here).
 */
const SubServicePickerSheet = forwardRef<BottomSheetModal, SubServicePickerSheetProps>(
  (
    {
      options,
      selected,
      disabled,
      onToggle,
      canAdd,
      needsTitle,
      title,
      onTitleChange,
      isSubmitting,
      onAdd,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    // «عنوان الخدمة» under the list, kept above the keyboard while typed
    const scrollRef = useRef<BottomSheetScrollViewMethods>(null);
    const titleField = useScrollFieldAboveKeyboard(scrollRef);
    // Below the status bar, so the header is never under it
    const snapPoints = useMemo(() => ['100%'], []);
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

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View
            className="w-full bg-white px-4 pt-3"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <TouchableOpacity
              testID="sub-service-picker-add"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canAdd || isSubmitting }}
              activeOpacity={0.8}
              disabled={!canAdd || isSubmitting}
              onPress={onAdd}
              className={`h-12 items-center justify-center rounded-[24px] ${
                canAdd ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-cairo-semibold text-[14px] text-white">
                  اضافة
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </BottomSheetFooter>
      ),
      [canAdd, insets.bottom, isSubmitting, onAdd],
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        topInset={insets.top}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
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
        <BottomSheetScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 16,
            // Clear of the fixed «اضافة» below, and of the keyboard while
            // «عنوان الخدمة» is typed
            paddingBottom: insets.bottom + 96 + titleField.keyboardSpace,
            gap: 8,
          }}
        >
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

          {/* «اخرى» is named here, in the picker: «التالي» used to close it
              for the sheet beneath, which didn't come back, so the flow just
              ended (QA) */}
          {needsTitle && (
            <View className="gap-1.5 pt-2" onLayout={titleField.onLayout}>
              <FieldLabel text="عنوان الخدمة" />
              <BottomSheetTextInput
                testID="sub-service-picker-title"
                value={title}
                onChangeText={onTitleChange}
                onFocus={titleField.onFocus}
                maxLength={100}
                placeholder="اكتب اسم الخدمة..."
                placeholderTextColor="#979797"
                className="h-[48px] w-full rounded-[8px] border border-[#ECECEC] bg-white px-3 text-right font-cairo text-[14px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              />
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

SubServicePickerSheet.displayName = 'SubServicePickerSheet';
export default SubServicePickerSheet;
