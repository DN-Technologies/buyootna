import { Image } from 'expo-image';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

import type { CheckoutResult } from '../useCheckout';

interface PaymentResultModalProps {
  result: CheckoutResult;
  // Success: leave the screen; failure: back to the payment screen
  onClose: () => void;
  onRetry: () => void;
}

const RTL = { writingDirection: 'rtl' as const };

/**
 * «تعذر إتمام الدفع» (Figma 5576:144549) with «إغلاق» / «إعادة المحاولة»,
 * and «تم الدفع بنجاح» (Figma 5576:144886), closed by a tap.
 */
export default function PaymentResultModal({ result, onClose, onRetry }: PaymentResultModalProps) {
  const success = result?.kind === 'success';
  return (
    <Modal visible={!!result} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="checkout-result-backdrop"
        className="flex-1 items-center justify-center px-[16px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={success ? onClose : undefined}
      >
        <View
          testID={success ? 'checkout-result-success' : 'checkout-result-failed'}
          className="w-full max-w-[343px] items-center rounded-[6px] bg-white p-[18px]"
          style={{ gap: 20 }}
        >
          <View
            className="size-[40px] items-center justify-center rounded-full p-[4px]"
            style={{ borderWidth: 3, borderColor: success ? '#018B1B' : '#9C1E28' }}
          >
            <Image
              source={
                success
                  ? require('@/assets/icons/checkout/success-check.svg')
                  : require('@/assets/icons/checkout/failed-x.svg')
              }
              style={{ width: success ? 15.3 : 12, height: 12 }}
              contentFit="contain"
            />
          </View>
          <View className="w-full" style={{ gap: 8 }}>
            <Text
              className="text-center font-cairo-bold text-[16px]"
              style={{ color: success ? '#111111' : '#9C1E28', ...RTL }}
            >
              {success ? 'تم الدفع بنجاح' : 'تعذر إتمام الدفع'}
            </Text>
            <Text
              testID="checkout-result-message"
              className="text-center font-cairo-medium text-[14px] leading-[21px] tracking-[-0.408px] text-[#111111]"
              style={RTL}
            >
              {success
                ? result.message
                : 'لم نتمكن من إتمام عملية الدفع. يرجى المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة.'}
            </Text>
          </View>
          {!success && (
            <View className="w-full flex-row" style={{ gap: 8 }}>
              <TouchableOpacity
                testID="checkout-retry"
                onPress={onRetry}
                className="h-[40px] flex-1 items-center justify-center rounded-[24px] bg-[#15304D] px-[20px]"
              >
                <Text className="font-cairo-semibold text-[14px] text-white">إعادة المحاولة</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="checkout-close"
                onPress={onClose}
                className="h-[40px] flex-1 items-center justify-center rounded-[24px] border border-[#E2E8F0] bg-white px-[20px]"
              >
                <Text className="font-cairo-semibold text-[14px] text-[#111111]">إغلاق</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}
