import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { forwardRef, ReactNode, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ConfirmActionSheetProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  // navy for accepting, red for anything destructive
  variant?: 'primary' | 'danger';
  // Round icon above the title (omitted for the accept confirmation)
  icon?: ReactNode;
  iconBackground?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

/**
 * Figma confirmation sheet: handle, optional round icon, title, description,
 * a filled confirm button and a "تراجع" outline button. Used to accept or
 * reject an offer and to delete one / all requests.
 */
const ConfirmActionSheet = forwardRef<BottomSheetModal, ConfirmActionSheetProps>(
  (
    {
      title,
      description,
      confirmLabel,
      cancelLabel = 'تراجع',
      variant = 'primary',
      icon,
      iconBackground = '#F9FAFE',
      onConfirm,
      onCancel,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
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

    const dismiss = () => (ref as any)?.current?.dismiss();

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: '#000000', width: 45, height: 5 }}
        backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      >
        <BottomSheetView>
          <View
            className="items-center gap-5 px-4 pt-6"
            style={{ paddingBottom: Math.max(insets.bottom, 40) }}
          >
            <View className="w-full items-center gap-4">
              {icon && (
                <View
                  testID="confirm-sheet-icon"
                  className="h-[75px] w-[75px] items-center justify-center rounded-full"
                  style={{ backgroundColor: iconBackground }}
                >
                  {icon}
                </View>
              )}
              <View className="w-full items-center gap-3">
                <Text
                  testID="confirm-sheet-title"
                  className="w-full text-center font-cairo-semibold text-[18px] leading-[26px] text-[#111111]"
                >
                  {title}
                </Text>
                <Text
                  testID="confirm-sheet-description"
                  className="w-full text-center font-cairo-medium text-[14px] leading-[21px] text-[#6B6A6A]"
                  // No negative letterSpacing on wrapping Arabic: iOS stacks the lines
                  style={{ writingDirection: 'rtl' }}
                >
                  {description}
                </Text>
              </View>
            </View>

            <View className="w-full gap-2">
              <TouchableOpacity
                testID="confirm-sheet-confirm"
                activeOpacity={0.8}
                onPress={() => {
                  dismiss();
                  onConfirm();
                }}
                className={`h-12 w-full items-center justify-center rounded-[24px] px-5 ${
                  variant === 'danger' ? 'bg-[#9C1E28]' : 'bg-[#15304D]'
                }`}
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-white"
                  style={{ letterSpacing: 0.28 }}
                >
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="confirm-sheet-cancel"
                activeOpacity={0.8}
                onPress={() => {
                  dismiss();
                  onCancel?.();
                }}
                className="h-12 w-full items-center justify-center rounded-[24px] border border-[#E2E8F0] px-5"
              >
                <Text
                  className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
                  style={{ letterSpacing: 0.28 }}
                >
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);
ConfirmActionSheet.displayName = 'ConfirmActionSheet';

export default ConfirmActionSheet;
