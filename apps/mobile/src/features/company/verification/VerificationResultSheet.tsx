import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import SafeBottomSheetView from '@/shared/components/ui/SafeBottomSheetView';
import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';

import { VerifiedSealIcon, ZoomDocumentIcon } from './icons';
import {
  renderSheetBackdrop,
  SHEET_BACKGROUND,
  SHEET_HANDLE,
} from './VerificationParts';

// «تم إرسال طلبك بنجاح» (Figma 10305:136776) and «حسابك موثق بنجاح»
// (Figma 10307:141455)
const CONTENT = {
  sent: {
    title: 'تم إرسال طلبك بنجاح',
    description:
      'يقوم فريقنا حالياً بمراجعة بيانات الشركة والمستندات\nسيتم إشعارك فور تفعيل شارة التوثيق.',
    footer: 'تتم المراجعة  خلال 24 ساعة',
  },
  verified: {
    title: 'حسابك موثق بنجاح',
    description: 'تم التحقق من بيانات الرخصة واعتماد حسابك.',
    footer: undefined,
  },
};

interface Props {
  variant: keyof typeof CONTENT;
  // After the sheet closes («حسنا» or swiped down)
  onDone?: () => void;
}

const VerificationResultSheet = forwardRef<BottomSheetModal, Props>(
  ({ variant, onDone }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    useImperativeHandle(ref, () => sheetRef.current as BottomSheetModal);
    const content = CONTENT[variant];
    return (
      <BottomSheetModal
        ref={sheetRef}
        enableDynamicSizing
        backdropComponent={renderSheetBackdrop}
        handleIndicatorStyle={SHEET_HANDLE}
        backgroundStyle={SHEET_BACKGROUND}
        onDismiss={onDone}
      >
        <SafeBottomSheetView className="items-center gap-6 px-4 pb-6 pt-3">
          <View className="w-full items-center gap-5">
            {variant === 'sent' ? (
              <SafeLinearGradient
                // linear-gradient(-45.9deg, #33D679 20%, #AADB53 82%)
                colors={['#33D679', '#AADB53']}
                locations={[0.2, 0.82]}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: 500,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View className="h-10 w-10 items-center justify-center">
                  <ZoomDocumentIcon />
                </View>
              </SafeLinearGradient>
            ) : (
              <VerifiedSealIcon />
            )}
            <View className="w-full items-center gap-3">
              <Text className="w-full text-center font-cairo-semibold text-[20px] leading-[22px] text-[#111111]">
                {content.title}
              </Text>
              <Text className="w-full text-center font-cairo-medium text-[14px] leading-[21px] text-[#6B6A6A]">
                {content.description}
              </Text>
            </View>
          </View>

          <View className="w-full items-center gap-3">
            <TouchableOpacity
              testID="verification-result-done"
              activeOpacity={0.8}
              onPress={() => sheetRef.current?.dismiss()}
              className="h-12 w-full items-center justify-center rounded-[24px] border border-[#15304D] bg-[#15304D]"
            >
              <Text className="font-cairo-semibold text-[14px] leading-[21px] text-white">
                حسنا
              </Text>
            </TouchableOpacity>
            {content.footer ? (
              <Text className="w-full text-center font-cairo-medium text-[14px] leading-[21px] text-[#A0A0A0]">
                {content.footer}
              </Text>
            ) : null}
          </View>
        </SafeBottomSheetView>
      </BottomSheetModal>
    );
  },
);

VerificationResultSheet.displayName = 'VerificationResultSheet';

export default VerificationResultSheet;
